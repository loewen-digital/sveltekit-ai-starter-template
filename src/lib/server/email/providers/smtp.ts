import { EmailDeliveryError, type EmailMessage, type EmailProvider } from '../types.js';

/** Cloudflare blocks outbound connections on port 25 outright. */
export const BLOCKED_SMTP_PORT = 25;
/** Implicit TLS from the first byte, as opposed to STARTTLS on 587. */
export const IMPLICIT_TLS_PORT = 465;

export interface SmtpConfig {
	host: string;
	port: number;
	/** true = implicit TLS (465); false = plain connect then STARTTLS (587). */
	secure: boolean;
	username?: string;
	password?: string;
	/** RFC 5322 sender, e.g. `Acme <noreply@acme.com>`. */
	from: string;
}

export interface SmtpAddress {
	name?: string;
	email: string;
}

export interface SmtpEnvelope {
	from: SmtpAddress;
	to: string;
	subject: string;
	html: string;
}

/**
 * The actual wire call, injectable so unit tests neither open a socket nor load
 * cloudflare:sockets.
 */
export type SmtpSend = (config: SmtpConfig, envelope: SmtpEnvelope) => Promise<void>;

/**
 * Splits `Acme <noreply@acme.com>` into display name and address. A bare
 * address yields no name.
 *
 * Done here rather than handed to the library as one string so the From header
 * is predictable regardless of how the library parses addresses.
 */
export function parseAddress(value: string): SmtpAddress {
	const trimmed = value.trim();
	const match = trimmed.match(/^(.*?)\s*<([^>]+)>$/);
	if (!match) return { email: trimmed };

	const name = match[1]
		.trim()
		.replace(/^"(.*)"$/, '$1')
		.trim();
	const email = match[2].trim();
	return name ? { name, email } : { email };
}

const deliverViaWorkerMailer: SmtpSend = async (config, envelope) => {
	// Imported lazily on purpose: worker-mailer reaches for cloudflare:sockets,
	// which does not exist under Node. A static import would break `npm run dev`
	// and the unit tests even when SMTP is not the provider in use.
	let WorkerMailer: typeof import('worker-mailer').WorkerMailer;
	try {
		({ WorkerMailer } = await import('worker-mailer'));
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		// `vite dev` runs on Node, which has no TCP socket API for Workers, so
		// this is the expected outcome there rather than a broken install.
		if (reason.includes('cloudflare:sockets')) {
			throw new Error(
				'SMTP needs the Cloudflare Workers runtime (cloudflare:sockets) and cannot run under ' +
					'`vite dev`. Use EMAIL_PROVIDER=console for local development, or run the app with ' +
					'`wrangler pages dev` to exercise SMTP.'
			);
		}
		throw error;
	}

	await WorkerMailer.send(
		{
			host: config.host,
			port: config.port,
			secure: config.secure,
			// STARTTLS whenever we did not already start inside TLS, so credentials
			// are never sent over a plaintext connection.
			startTls: !config.secure,
			...(config.username && config.password
				? {
						credentials: { username: config.username, password: config.password },
						authType: ['plain', 'login', 'cram-md5']
					}
				: {})
		},
		{
			from: envelope.from,
			to: envelope.to,
			subject: envelope.subject,
			html: envelope.html
		}
	);
};

/**
 * Speaks SMTP to any mail server, which is the point: unlike an HTTP provider
 * this needs no vendor-specific driver — host, port and credentials are enough,
 * so the same build can be pointed at a client's own mail infrastructure.
 *
 * Trade-offs versus the HTTP providers: a full SMTP handshake per message
 * instead of one request, a per-isolate cap on concurrent TCP connections, and
 * no delivery or bounce webhooks.
 */
export function createSmtpProvider(
	config: SmtpConfig,
	send: SmtpSend = deliverViaWorkerMailer
): EmailProvider {
	const from = parseAddress(config.from);

	return {
		name: 'smtp',
		async send(message: EmailMessage): Promise<void> {
			try {
				await send(config, {
					from,
					to: message.to,
					subject: message.subject,
					html: message.html
				});
			} catch (error) {
				throw new EmailDeliveryError(
					`SMTP delivery via ${config.host}:${config.port} failed: ${
						error instanceof Error ? error.message : String(error)
					}`
				);
			}
		}
	};
}
