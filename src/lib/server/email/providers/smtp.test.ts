import { describe, it, expect } from 'vitest';
import { createSmtpProvider, parseAddress, type SmtpConfig, type SmtpEnvelope } from './smtp.js';
import { EmailDeliveryError } from '../types.js';

const CONFIG: SmtpConfig = {
	host: 'smtp.acme.com',
	port: 587,
	secure: false,
	username: 'mailer',
	password: 'secret',
	from: 'Acme <noreply@acme.com>'
};

const MESSAGE = {
	to: 'user@example.com',
	subject: 'Reset your password',
	html: '<a href="https://acme.com/reset?token=abc">Reset</a>'
};

/** Captures what would go on the wire instead of opening a socket. */
function recorder() {
	const sent: SmtpEnvelope[] = [];
	const send = async (_config: SmtpConfig, envelope: SmtpEnvelope) => {
		sent.push(envelope);
	};
	return { sent, send };
}

describe('parseAddress', () => {
	it('splits a display name from the address', () => {
		expect(parseAddress('Acme <noreply@acme.com>')).toEqual({
			name: 'Acme',
			email: 'noreply@acme.com'
		});
	});

	it('keeps a bare address as-is', () => {
		expect(parseAddress('noreply@acme.com')).toEqual({ email: 'noreply@acme.com' });
	});

	it('strips quotes around the display name', () => {
		expect(parseAddress('"Acme, Inc." <no@acme.com>')).toEqual({
			name: 'Acme, Inc.',
			email: 'no@acme.com'
		});
	});

	it('omits an empty display name rather than sending one', () => {
		expect(parseAddress('  <no@acme.com>')).toEqual({ email: 'no@acme.com' });
	});
});

describe('createSmtpProvider', () => {
	it('passes the message through with a parsed sender', async () => {
		const { sent, send } = recorder();

		await createSmtpProvider(CONFIG, send).send(MESSAGE);

		expect(sent).toHaveLength(1);
		expect(sent[0].from).toEqual({ name: 'Acme', email: 'noreply@acme.com' });
		expect(sent[0].to).toBe('user@example.com');
		expect(sent[0].subject).toBe('Reset your password');
		expect(sent[0].html).toContain('token=abc');
	});

	it('reports itself as smtp', () => {
		expect(createSmtpProvider(CONFIG, recorder().send).name).toBe('smtp');
	});

	it('wraps transport failures as EmailDeliveryError', async () => {
		const provider = createSmtpProvider(CONFIG, async () => {
			throw new Error('535 authentication failed');
		});

		await expect(provider.send(MESSAGE)).rejects.toThrow(EmailDeliveryError);
	});

	it('names host and port in the failure so misconfiguration is obvious', async () => {
		const provider = createSmtpProvider(CONFIG, async () => {
			throw new Error('connection refused');
		});

		await expect(provider.send(MESSAGE)).rejects.toThrow(/smtp\.acme\.com:587.*connection refused/);
	});

	it('never resolves when delivery failed', async () => {
		// The whole point of the provider contract: a caller that awaits send()
		// and sees no rejection may tell the user the mail is on its way.
		const provider = createSmtpProvider(CONFIG, async () => {
			throw new Error('nope');
		});

		await expect(provider.send(MESSAGE)).rejects.toBeInstanceOf(EmailDeliveryError);
	});
});
