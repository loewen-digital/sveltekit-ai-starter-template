import { createConsoleProvider } from './providers/console.js';
import { createResendProvider } from './providers/resend.js';
import {
	BLOCKED_SMTP_PORT,
	IMPLICIT_TLS_PORT,
	createSmtpProvider,
	type SmtpConfig
} from './providers/smtp.js';
import { EmailConfigurationError, type EmailProvider } from './types.js';

const DEFAULT_SMTP_PORT = 587;

export interface EmailEnv {
	EMAIL_PROVIDER?: string;
	RESEND_API_KEY?: string;
	EMAIL_FROM?: string;
	SMTP_HOST?: string;
	SMTP_PORT?: string;
	SMTP_USERNAME?: string;
	SMTP_PASSWORD?: string;
	SMTP_SECURE?: string;
	// Present so the whole $env/dynamic/private record is assignable here.
	[key: string]: string | undefined;
}

function requireFrom(env: EmailEnv): string {
	const from = env.EMAIL_FROM?.trim();
	if (!from) {
		throw new EmailConfigurationError(
			'EMAIL_FROM is required when an email provider is configured (e.g. "Acme <noreply@acme.com>").'
		);
	}
	return from;
}

function buildResend(env: EmailEnv): EmailProvider {
	const apiKey = env.RESEND_API_KEY?.trim();
	if (!apiKey) {
		throw new EmailConfigurationError('EMAIL_PROVIDER=resend requires RESEND_API_KEY.');
	}
	return createResendProvider({ apiKey, from: requireFrom(env) });
}

function parseSmtpPort(raw: string | undefined): number {
	const value = raw?.trim();
	if (!value) return DEFAULT_SMTP_PORT;

	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new EmailConfigurationError(`SMTP_PORT must be a port number, got "${value}".`);
	}
	if (port === BLOCKED_SMTP_PORT) {
		// Caught here rather than at send time, where it would surface as an
		// opaque connection timeout.
		throw new EmailConfigurationError(
			`SMTP_PORT=${BLOCKED_SMTP_PORT} cannot work on Cloudflare Workers — outbound ` +
				`connections on that port are blocked. Use ${DEFAULT_SMTP_PORT} (STARTTLS) or ` +
				`${IMPLICIT_TLS_PORT} (implicit TLS).`
		);
	}
	return port;
}

function parseSmtpSecure(raw: string | undefined, port: number): boolean {
	const value = raw?.trim().toLowerCase();
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (value) {
		throw new EmailConfigurationError(`SMTP_SECURE must be "true" or "false", got "${value}".`);
	}
	// 465 expects TLS from the first byte; everything else negotiates STARTTLS.
	return port === IMPLICIT_TLS_PORT;
}

/**
 * Turns the environment into an SMTP config, separately from building the
 * provider so the port and TLS rules can be asserted on their own.
 */
export function resolveSmtpConfig(env: EmailEnv): SmtpConfig {
	const host = env.SMTP_HOST?.trim();
	if (!host) {
		throw new EmailConfigurationError('EMAIL_PROVIDER=smtp requires SMTP_HOST.');
	}

	const username = env.SMTP_USERNAME?.trim();
	const password = env.SMTP_PASSWORD?.trim();
	if (Boolean(username) !== Boolean(password)) {
		throw new EmailConfigurationError(
			'SMTP_USERNAME and SMTP_PASSWORD must be set together (or both left unset for an ' +
				'unauthenticated relay).'
		);
	}

	const port = parseSmtpPort(env.SMTP_PORT);

	return {
		host,
		port,
		secure: parseSmtpSecure(env.SMTP_SECURE, port),
		username,
		password,
		from: requireFrom(env)
	};
}

function buildSmtp(env: EmailEnv): EmailProvider {
	return createSmtpProvider(resolveSmtpConfig(env));
}

/**
 * Picks a provider from the environment.
 *
 *   EMAIL_PROVIDER=console  -> log only, at any time (useful on staging)
 *   EMAIL_PROVIDER=resend   -> Resend, and fail loudly if it is misconfigured
 *   EMAIL_PROVIDER=smtp     -> any SMTP server, same failure contract
 *   unset + RESEND_API_KEY  -> Resend
 *   unset + SMTP_HOST       -> SMTP
 *   unset + both of those   -> throws, rather than silently preferring one
 *   unset + dev             -> log only
 *   unset + production      -> throws
 *
 * The last rule is deliberate. Production previously fell through to a stub
 * that logged a warning and resolved successfully, so password resets and
 * verification mails were silently dropped and every caller believed they had
 * been sent.
 */
export function resolveEmailProvider(env: EmailEnv, isDev: boolean): EmailProvider {
	const configured = env.EMAIL_PROVIDER?.trim().toLowerCase();

	if (configured === 'console') return createConsoleProvider();
	if (configured === 'resend') return buildResend(env);
	if (configured === 'smtp') return buildSmtp(env);

	if (configured) {
		throw new EmailConfigurationError(
			`Unknown EMAIL_PROVIDER "${configured}". Supported values: console, resend, smtp.`
		);
	}

	const hasResend = Boolean(env.RESEND_API_KEY?.trim());
	const hasSmtp = Boolean(env.SMTP_HOST?.trim());

	if (hasResend && hasSmtp) {
		throw new EmailConfigurationError(
			'Both RESEND_API_KEY and SMTP_HOST are set. Set EMAIL_PROVIDER to "resend" or "smtp" ' +
				'so the choice is explicit instead of depending on precedence.'
		);
	}

	if (hasResend) return buildResend(env);
	if (hasSmtp) return buildSmtp(env);
	if (isDev) return createConsoleProvider();

	throw new EmailConfigurationError(
		'No email provider configured. Set RESEND_API_KEY and EMAIL_FROM, or SMTP_HOST and ' +
			'EMAIL_FROM, or set EMAIL_PROVIDER=console to acknowledge that mail is intentionally ' +
			'not delivered.'
	);
}
