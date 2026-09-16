import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createMailInstance, type MailInstance } from '@loewen-digital/fullstack/mail';
import { logger } from '$lib/server/logger.js';
import { resolveEmailProvider } from './provider.js';
import type { EmailMessage } from './types.js';

export type { EmailMessage, EmailProvider, MailMessage } from './types.js';
export { EmailDeliveryError, EmailConfigurationError } from './types.js';

let _mail: { instance: MailInstance; provider: string } | null = null;

function getMail() {
	if (!_mail) {
		const provider = resolveEmailProvider(env, dev);
		// The sender is read from the environment once; every message inherits it.
		const instance = createMailInstance(provider, { driver: provider.name, from: env.EMAIL_FROM });
		_mail = { instance, provider: provider.name };
		logger.info('Email provider initialized', { provider: provider.name });
	}
	return _mail;
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
	const { instance, provider } = getMail();
	await instance.send(message);
	logger.info('Email sent', { to: message.to, subject: message.subject, provider });
}
