import { logger } from '$lib/server/logger.js';
import type { EmailProvider, MailMessage } from '../types.js';

/** Pulls the first href out of a template so local dev can follow it. */
export function extractFirstLink(html: string): string | null {
	return html.match(/href="([^"]+)"/)?.[1] ?? null;
}

/**
 * Writes messages to the log instead of delivering them. Intended for local
 * development, where the reset and verification links are the only thing you
 * actually need — they are logged on their own line so you can click them
 * straight out of the terminal. fullstack's own console driver prints the
 * message with console.log and truncates the body, which hides the link.
 */
export function createConsoleProvider(): EmailProvider {
	return {
		name: 'console',
		async send(message: MailMessage): Promise<void> {
			logger.info('Email not delivered (console provider)', {
				to: message.to,
				subject: message.subject
			});

			const link = extractFirstLink(message.html ?? '');
			if (link) {
				logger.info('Email link', { link });
			}

			logger.debug('Email body', { html: message.html });
		}
	};
}
