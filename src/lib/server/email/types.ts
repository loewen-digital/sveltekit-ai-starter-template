export interface EmailMessage {
	to: string;
	subject: string;
	html: string;
}

export interface EmailProvider {
	/** Identifies the provider in logs. */
	readonly name: string;
	/**
	 * Delivers the message, or throws. Never resolve when the message was not
	 * handed off — silent failure is what made the previous stub dangerous.
	 */
	send(message: EmailMessage): Promise<void>;
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
