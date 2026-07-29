import { describe, it, expect } from 'vitest';
import { resolveEmailProvider, resolveSmtpConfig } from './provider.js';
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

	it('uses smtp as soon as a host is present', () => {
		const provider = resolveEmailProvider(
			{ SMTP_HOST: 'smtp.acme.com', EMAIL_FROM: 'Acme <no@acme.com>' },
			PROD
		);
		expect(provider.name).toBe('smtp');
	});

	it('refuses to pick between resend and smtp on its own', () => {
		expect(() =>
			resolveEmailProvider(
				{ RESEND_API_KEY: 're_key', SMTP_HOST: 'smtp.acme.com', EMAIL_FROM: 'a@b.com' },
				PROD
			)
		).toThrow(/EMAIL_PROVIDER/);
	});

	it('requires SMTP_HOST when smtp is requested explicitly', () => {
		expect(() =>
			resolveEmailProvider({ EMAIL_PROVIDER: 'smtp', EMAIL_FROM: 'a@b.com' }, PROD)
		).toThrow(/SMTP_HOST/);
	});

	it('rejects port 25, which Cloudflare blocks', () => {
		expect(() =>
			resolveEmailProvider(
				{ EMAIL_PROVIDER: 'smtp', SMTP_HOST: 'smtp.acme.com', SMTP_PORT: '25', EMAIL_FROM: 'a@b' },
				PROD
			)
		).toThrow(/blocked/);
	});

	it('rejects a non-numeric port', () => {
		expect(() =>
			resolveEmailProvider(
				{
					EMAIL_PROVIDER: 'smtp',
					SMTP_HOST: 'smtp.acme.com',
					SMTP_PORT: 'submission',
					EMAIL_FROM: 'a@b'
				},
				PROD
			)
		).toThrow(/SMTP_PORT/);
	});

	it('rejects half-configured credentials', () => {
		expect(() =>
			resolveEmailProvider(
				{
					EMAIL_PROVIDER: 'smtp',
					SMTP_HOST: 'smtp.acme.com',
					SMTP_USERNAME: 'mailer',
					EMAIL_FROM: 'a@b'
				},
				PROD
			)
		).toThrow(/SMTP_PASSWORD/);
	});

	it('rejects a non-boolean SMTP_SECURE', () => {
		expect(() =>
			resolveEmailProvider(
				{ EMAIL_PROVIDER: 'smtp', SMTP_HOST: 'h', SMTP_SECURE: 'yes', EMAIL_FROM: 'a@b' },
				PROD
			)
		).toThrow(/SMTP_SECURE/);
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

describe('resolveSmtpConfig', () => {
	const BASE = { SMTP_HOST: 'smtp.acme.com', EMAIL_FROM: 'Acme <no@acme.com>' };

	it('defaults to the submission port with STARTTLS', () => {
		const config = resolveSmtpConfig(BASE);
		expect(config.port).toBe(587);
		expect(config.secure).toBe(false);
	});

	it('switches to implicit TLS on 465', () => {
		expect(resolveSmtpConfig({ ...BASE, SMTP_PORT: '465' }).secure).toBe(true);
	});

	it('lets SMTP_SECURE override the port-derived default', () => {
		expect(resolveSmtpConfig({ ...BASE, SMTP_PORT: '465', SMTP_SECURE: 'false' }).secure).toBe(
			false
		);
		expect(resolveSmtpConfig({ ...BASE, SMTP_PORT: '2525', SMTP_SECURE: 'true' }).secure).toBe(
			true
		);
	});

	it('leaves credentials unset for an unauthenticated relay', () => {
		const config = resolveSmtpConfig(BASE);
		expect(config.username).toBeUndefined();
		expect(config.password).toBeUndefined();
	});

	it('carries credentials through when both are given', () => {
		expect(resolveSmtpConfig({ ...BASE, SMTP_USERNAME: 'u', SMTP_PASSWORD: 'p' })).toMatchObject({
			username: 'u',
			password: 'p'
		});
	});
});
