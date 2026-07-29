import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/server/logger.js';
import { resolveEmailProvider } from './provider.js';
import type { EmailMessage, EmailProvider } from './types.js';

export type { EmailMessage, EmailProvider } from './types.js';
export { EmailDeliveryError, EmailConfigurationError } from './types.js';

let _provider: EmailProvider | null = null;

function getProvider(): EmailProvider {
	if (!_provider) {
		_provider = resolveEmailProvider(env, dev);
		logger.info('Email provider initialized', { provider: _provider.name });
	}
	return _provider;
}

/**
 * Sends a message, or throws.
 *
 * Callers must decide what a failure means for them, because the policies
 * differ: a failed password-reset mail must not surface to the requester (it
 * would leak whether the account exists), while a failed "resend verification"
 * absolutely must.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
	const provider = getProvider();
	await provider.send(message);
	logger.info('Email sent', {
		to: message.to,
		subject: message.subject,
		provider: provider.name
	});
}
