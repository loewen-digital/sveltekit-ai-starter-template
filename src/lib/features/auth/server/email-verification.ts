import { sendEmail } from '$lib/server/email/index.js';
import { emailVerificationEmail } from '$lib/server/email/templates.js';
import { logger } from '$lib/server/logger.js';
import type { AuthContext } from './auth.js';

export const EMAIL_VERIFICATION = 'email_verification';

export interface VerificationTokenResult {
	/** False when the token was stored but the mail could not be handed off. */
	delivered: boolean;
}

export async function createVerificationToken(
	{ db, auth }: AuthContext,
	userId: string,
	email: string,
	origin: string
): Promise<VerificationTokenResult> {
	// One live link per user: a link mailed to a previous address must not
	// verify the current one. fullstack keeps older tokens until they expire.
	// UPSTREAM: https://github.com/loewen-digital/fullstack/issues/26
	await db.tokens.delete({ userId, type: EMAIL_VERIFICATION });

	// The token is stored before the mail goes out, so a delivery failure is
	// recoverable: the user can trigger a resend. Report it instead of throwing,
	// and let each caller decide whether it is worth surfacing.
	let delivered = true;
	await auth.sendVerificationEmail({ id: userId, email }, async (to, token) => {
		try {
			await sendEmail({ to, ...emailVerificationEmail(`${origin}/verify-email?token=${token}`) });
		} catch (error) {
			logger.error('Failed to deliver verification email', {
				userId,
				email,
				error: error instanceof Error ? error.message : String(error)
			});
			delivered = false;
		}
	});

	if (delivered) logger.info('Email verification token created', { userId, email });
	return { delivered };
}

export async function verifyEmail(
	{ db, auth }: AuthContext,
	token: string
): Promise<{ error?: string }> {
	const user = await auth.verifyEmail(token);
	if (!user) {
		return { error: 'Invalid or expired verification link' };
	}

	// The used link and any older one of this user are done with.
	await db.tokens.delete({ userId: String(user.id), type: EMAIL_VERIFICATION });

	logger.info('Email verified', { userId: user.id, email: user.email });
	return {};
}
