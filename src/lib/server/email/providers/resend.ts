import { EmailDeliveryError, type EmailMessage, type EmailProvider } from '../types.js';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface ResendConfig {
	apiKey: string;
	/** RFC 5322 sender, e.g. `Acme <noreply@acme.com>`. Domain must be verified. */
	from: string;
}

/**
 * Talks to the Resend REST API over plain fetch — no SDK, so it runs unchanged
 * on the Cloudflare Workers runtime.
 *
 * To swap in a different provider, implement EmailProvider the same way and
 * return it from resolveEmailProvider(); nothing else in the app changes.
 */
export function createResendProvider(
	config: ResendConfig,
	fetchImpl: typeof fetch = fetch
): EmailProvider {
	return {
		name: 'resend',
		async send(message: EmailMessage): Promise<void> {
			let response: Response;

			try {
				response = await fetchImpl(RESEND_ENDPOINT, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${config.apiKey}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						from: config.from,
						to: [message.to],
						subject: message.subject,
						html: message.html
					})
				});
			} catch (error) {
				throw new EmailDeliveryError(
					`Could not reach Resend: ${error instanceof Error ? error.message : String(error)}`
				);
			}

			if (!response.ok) {
				// Body carries Resend's reason (unverified domain, bad key, ...).
				const detail = await response.text().catch(() => '');
				throw new EmailDeliveryError(
					`Resend rejected the message (HTTP ${response.status})${detail ? `: ${detail}` : ''}`
				);
			}
		}
	};
}
