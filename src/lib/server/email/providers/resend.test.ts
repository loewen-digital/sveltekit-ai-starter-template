import { describe, it, expect } from 'vitest';
import { createResendProvider } from './resend.js';
import { EmailDeliveryError } from '../types.js';

const CONFIG = { apiKey: 're_test_key', from: 'Acme <noreply@acme.com>' };
const MESSAGE = { to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' };

interface Captured {
	url: string;
	init: RequestInit;
}

/** Stubs the network boundary only — the provider itself is the real object. */
function capturingFetch(response: () => Response): { calls: Captured[]; impl: typeof fetch } {
	const calls: Captured[] = [];
	const impl = (async (url: RequestInfo | URL, init?: RequestInit) => {
		calls.push({ url: String(url), init: init ?? {} });
		return response();
	}) as typeof fetch;
	return { calls, impl };
}

describe('resend provider', () => {
	it('posts the message to the Resend API', async () => {
		const { calls, impl } = capturingFetch(() => new Response('{"id":"abc"}', { status: 200 }));

		await createResendProvider(CONFIG, impl).send(MESSAGE);

		expect(calls).toHaveLength(1);
		expect(calls[0].url).toBe('https://api.resend.com/emails');
		expect(calls[0].init.method).toBe('POST');

		const headers = calls[0].init.headers as Record<string, string>;
		expect(headers.Authorization).toBe('Bearer re_test_key');
		expect(headers['Content-Type']).toBe('application/json');

		expect(JSON.parse(String(calls[0].init.body))).toEqual({
			from: 'Acme <noreply@acme.com>',
			to: ['user@example.com'],
			subject: 'Hello',
			html: '<p>Hi</p>'
		});
	});

	it('throws when Resend rejects the message', async () => {
		const { impl } = capturingFetch(
			() => new Response('{"message":"domain not verified"}', { status: 403 })
		);

		await expect(createResendProvider(CONFIG, impl).send(MESSAGE)).rejects.toThrow(
			EmailDeliveryError
		);
	});

	it('includes the status and reason so the log is actionable', async () => {
		const { impl } = capturingFetch(
			() => new Response('{"message":"domain not verified"}', { status: 403 })
		);

		await expect(createResendProvider(CONFIG, impl).send(MESSAGE)).rejects.toThrow(
			/403.*domain not verified/
		);
	});

	it('throws when the network fails', async () => {
		const impl = (async () => {
			throw new TypeError('fetch failed');
		}) as typeof fetch;

		await expect(createResendProvider(CONFIG, impl).send(MESSAGE)).rejects.toThrow(
			EmailDeliveryError
		);
	});

	it('never resolves silently on failure', async () => {
		const { impl } = capturingFetch(() => new Response('', { status: 500 }));

		const result = await createResendProvider(CONFIG, impl)
			.send(MESSAGE)
			.then(() => 'resolved')
			.catch(() => 'threw');

		expect(result).toBe('threw');
	});
});
