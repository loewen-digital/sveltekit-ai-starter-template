import { createConsoleProvider } from './providers/console.js';
import { createResendProvider } from './providers/resend.js';
import { EmailConfigurationError, type EmailProvider } from './types.js';

export interface EmailEnv {
	EMAIL_PROVIDER?: string;
	RESEND_API_KEY?: string;
	EMAIL_FROM?: string;
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

/**
 * Picks a provider from the environment.
 *
 *   EMAIL_PROVIDER=console  -> log only, at any time (useful on staging)
 *   EMAIL_PROVIDER=resend   -> Resend, and fail loudly if it is misconfigured
 *   unset + RESEND_API_KEY  -> Resend
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

	if (configured) {
		throw new EmailConfigurationError(
			`Unknown EMAIL_PROVIDER "${configured}". Supported values: console, resend.`
		);
	}

	if (env.RESEND_API_KEY?.trim()) return buildResend(env);
	if (isDev) return createConsoleProvider();

	throw new EmailConfigurationError(
		'No email provider configured. Set RESEND_API_KEY and EMAIL_FROM, or set ' +
			'EMAIL_PROVIDER=console to acknowledge that mail is intentionally not delivered.'
	);
}
