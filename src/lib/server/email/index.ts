import { dev } from '$app/environment';
import { logger } from '$lib/server/logger.js';

export interface EmailMessage {
	to: string;
	subject: string;
	html: string;
}

// TODO: Replace with a real email provider (Resend, SendGrid, Postmark, etc.)
// Example with Resend:
//   import { Resend } from 'resend';
//   const resend = new Resend(RESEND_API_KEY);
//   await resend.emails.send({ from: 'noreply@yourdomain.com', ...message });

export async function sendEmail(message: EmailMessage): Promise<void> {
	if (dev) {
		logger.info('Email sent (dev mode)', {
			to: message.to,
			subject: message.subject
		});
		logger.debug('Email content', { html: message.html });
		return;
	}

	// In production, replace this with your email provider
	logger.warn('Email sending not configured — email was not delivered', {
		to: message.to,
		subject: message.subject
	});
}
