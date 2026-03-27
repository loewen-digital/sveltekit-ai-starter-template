import { getDb } from '$lib/server/db/index.js';
import { userTable, emailVerificationTokenTable } from '$lib/server/db/schema.js';
import { sendEmail } from '$lib/server/email/index.js';
import { emailVerificationEmail } from '$lib/server/email/templates.js';
import { logger } from '$lib/server/logger.js';
import { generateToken, hashToken, generateId, isTokenExpired } from '$lib/server/token.js';
import { eq } from 'drizzle-orm';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createVerificationToken(
	userId: string,
	email: string,
	origin: string
): Promise<void> {
	const db = getDb();

	// Delete existing tokens for this user
	await db
		.delete(emailVerificationTokenTable)
		.where(eq(emailVerificationTokenTable.userId, userId));

	const token = generateToken();
	const hashedToken = hashToken(token);

	await db.insert(emailVerificationTokenTable).values({
		id: generateId(),
		userId,
		email,
		hashedToken,
		expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS)
	});

	const verifyUrl = `${origin}/verify-email?token=${token}`;
	const template = emailVerificationEmail(verifyUrl);

	await sendEmail({
		to: email,
		...template
	});

	logger.info('Email verification token created', { userId, email });
}

export async function verifyEmail(token: string): Promise<{ error?: string }> {
	const db = getDb();
	const hashedToken = hashToken(token);

	const verificationToken = await db
		.select()
		.from(emailVerificationTokenTable)
		.where(eq(emailVerificationTokenTable.hashedToken, hashedToken))
		.get();

	if (!verificationToken) {
		return { error: 'Invalid or expired verification link' };
	}

	if (isTokenExpired(verificationToken.expiresAt)) {
		await db
			.delete(emailVerificationTokenTable)
			.where(eq(emailVerificationTokenTable.id, verificationToken.id));
		return { error: 'Invalid or expired verification link' };
	}

	// Update user email (in case it was changed) and mark as verified
	await db
		.update(userTable)
		.set({ email: verificationToken.email, emailVerified: true })
		.where(eq(userTable.id, verificationToken.userId));

	// Delete all verification tokens for this user
	await db
		.delete(emailVerificationTokenTable)
		.where(eq(emailVerificationTokenTable.userId, verificationToken.userId));

	logger.info('Email verified', {
		userId: verificationToken.userId,
		email: verificationToken.email
	});
	return {};
}
