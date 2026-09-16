import { sendEmail } from '$lib/server/email/index.js';
import { passwordResetEmail } from '$lib/server/email/templates.js';
import { logger } from '$lib/server/logger.js';
import type { AuthContext } from './auth.js';

export const PASSWORD_RESET = 'password_reset';

export async function requestPasswordReset(
	{ db, auth, authDb }: AuthContext,
	email: string,
	origin: string
): Promise<void> {
	const user = await authDb.findUserByEmail(email);

	if (!user) {
		// Don't reveal whether the email exists
		logger.info('Password reset requested for non-existent email', { email });
		return;
	}

	// One live link per user, as for email verification.
	// UPSTREAM: https://github.com/loewen-digital/fullstack/issues/26
	await db.tokens.delete({ userId: String(user.id), type: PASSWORD_RESET });

	// Swallowed on purpose: this function must be indistinguishable from the
	// unknown-address path above, and a propagating error would turn a delivery
	// problem into an account-existence oracle. Operators see it in the logs.
	await auth.sendPasswordResetEmail(user, async (to, token) => {
		try {
			await sendEmail({ to, ...passwordResetEmail(`${origin}/reset-password?token=${token}`) });
			logger.info('Password reset token created', { userId: user.id });
		} catch (error) {
			logger.error('Failed to deliver password reset email', {
				userId: user.id,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	});
}

export async function resetPassword(
	{ db, auth, authDb }: AuthContext,
	token: string,
	newPassword: string
): Promise<{ error?: string }> {
	// fullstack's resetPassword() returns only a boolean; the user id is needed
	// below to revoke the sessions, so its steps run here.
	// UPSTREAM: https://github.com/loewen-digital/fullstack/issues/25
	const userId = await auth.verifyToken(token, PASSWORD_RESET);
	if (userId === null) {
		return { error: 'Invalid or expired reset link' };
	}

	await authDb.updateUserPassword(userId, await auth.hashPassword(newPassword));
	await db.tokens.delete({ userId: String(userId), type: PASSWORD_RESET });

	// A reset is the recovery path after a takeover, so every session an
	// attacker may still hold dies with it.
	await db.sessions.delete({ userId: String(userId) });

	logger.info('Password reset completed', { userId });
	return {};
}
