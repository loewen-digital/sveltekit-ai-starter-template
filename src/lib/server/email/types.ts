import type { MailDriver, MailMessage } from '@loewen-digital/fullstack/mail';

export type { MailMessage };

/** What the app sends: one recipient, HTML body. A subset of `MailMessage`. */
export interface EmailMessage {
	to: string;
	subject: string;
	html: string;
}

/** A fullstack mail driver that says who it is in the logs. */
export interface EmailProvider extends MailDriver {
	readonly name: string;
}

/** The provider was reachable but refused or failed to accept the message. */
export class EmailDeliveryError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EmailDeliveryError';
	}
}

/** No usable provider could be built from the environment. */
export class EmailConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EmailConfigurationError';
	}
}
