import { hash } from '@node-rs/argon2';
import { getLucia } from './auth.js';
import { getDb } from '$lib/server/db/index.js';
import { userTable, passwordResetTokenTable } from '$lib/server/db/schema.js';
import { sendEmail } from '$lib/server/email/index.js';
import { passwordResetEmail } from '$lib/server/email/templates.js';
import { logger } from '$lib/server/logger.js';
import { generateToken, hashToken, generateId, isTokenExpired } from '$lib/server/token.js';
import { eq } from 'drizzle-orm';

const ARGON2_CONFIG = {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
};

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordReset(email: string, origin: string): Promise<void> {
	const db = getDb();
	const user = await db.select().from(userTable).where(eq(userTable.email, email)).get();

	if (!user) {
		// Don't reveal whether email exists
		logger.info('Password reset requested for non-existent email', { email });
		return;
	}

	// Delete any existing tokens for this user
	await db.delete(passwordResetTokenTable).where(eq(passwordResetTokenTable.userId, user.id));

	const token = generateToken();
	const hashedToken = hashToken(token);

	await db.insert(passwordResetTokenTable).values({
		id: generateId(),
		userId: user.id,
		hashedToken,
		expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS)
	});

	const resetUrl = `${origin}/reset-password?token=${token}`;
	const template = passwordResetEmail(resetUrl);

	// Swallowed on purpose: this function must be indistinguishable from the
	// unknown-address path above, and a propagating error would turn a delivery
	// problem into an account-existence oracle. Operators see it in the logs.
	try {
		await sendEmail({
			to: user.email,
			...template
		});
	} catch (error) {
		logger.error('Failed to deliver password reset email', {
			userId: user.id,
			error: error instanceof Error ? error.message : String(error)
		});
		return;
	}

	logger.info('Password reset token created', { userId: user.id });
}

export async function resetPassword(
	token: string,
	newPassword: string
): Promise<{ error?: string }> {
	const db = getDb();
	const hashedToken = hashToken(token);

	const resetToken = await db
		.select()
		.from(passwordResetTokenTable)
		.where(eq(passwordResetTokenTable.hashedToken, hashedToken))
		.get();

	if (!resetToken) {
		return { error: 'Invalid or expired reset link' };
	}

	if (isTokenExpired(resetToken.expiresAt)) {
		await db.delete(passwordResetTokenTable).where(eq(passwordResetTokenTable.id, resetToken.id));
		return { error: 'Invalid or expired reset link' };
	}

	const passwordHash = await hash(newPassword, ARGON2_CONFIG);

	await db.update(userTable).set({ passwordHash }).where(eq(userTable.id, resetToken.userId));

	// Delete all reset tokens for this user
	await db
		.delete(passwordResetTokenTable)
		.where(eq(passwordResetTokenTable.userId, resetToken.userId));

	// Invalidate every existing session — a reset is the recovery path after a
	// takeover, so any session an attacker still holds must die with it.
	await getLucia().invalidateUserSessions(resetToken.userId);

	logger.info('Password reset completed', { userId: resetToken.userId });
	return {};
}
