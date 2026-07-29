import { describe, it, expect } from 'vitest';
import { resolveEmailProvider } from './provider.js';
import { EmailConfigurationError } from './types.js';

const DEV = true;
const PROD = false;

describe('resolveEmailProvider', () => {
	it('falls back to the console provider in dev', () => {
		expect(resolveEmailProvider({}, DEV).name).toBe('console');
	});

	it('refuses to start unconfigured in production', () => {
		// The regression this guards: production used to fall through to a stub
		// that resolved successfully, so mail was dropped without anyone noticing.
		expect(() => resolveEmailProvider({}, PROD)).toThrow(EmailConfigurationError);
	});

	it('uses resend as soon as an API key is present', () => {
		const provider = resolveEmailProvider(
			{ RESEND_API_KEY: 're_key', EMAIL_FROM: 'Acme <no@acme.com>' },
			PROD
		);
		expect(provider.name).toBe('resend');
	});

	it('prefers an explicit provider over key sniffing', () => {
		const provider = resolveEmailProvider(
			{ EMAIL_PROVIDER: 'console', RESEND_API_KEY: 're_key' },
			PROD
		);
		expect(provider.name).toBe('console');
	});

	it('requires EMAIL_FROM when sending for real', () => {
		expect(() => resolveEmailProvider({ RESEND_API_KEY: 're_key' }, PROD)).toThrow(/EMAIL_FROM/);
	});

	it('requires an API key when resend is requested explicitly', () => {
		expect(() =>
			resolveEmailProvider({ EMAIL_PROVIDER: 'resend', EMAIL_FROM: 'a@b.com' }, PROD)
		).toThrow(/RESEND_API_KEY/);
	});

	it('rejects an unknown provider name instead of guessing', () => {
		expect(() => resolveEmailProvider({ EMAIL_PROVIDER: 'sendgrid' }, DEV)).toThrow(
			/Unknown EMAIL_PROVIDER/
		);
	});

	it('ignores surrounding whitespace and casing', () => {
		expect(resolveEmailProvider({ EMAIL_PROVIDER: '  CONSOLE  ' }, PROD).name).toBe('console');
	});

	it('treats a blank API key as absent', () => {
		expect(() => resolveEmailProvider({ RESEND_API_KEY: '   ' }, PROD)).toThrow(
			EmailConfigurationError
		);
	});
});
