import { hashPassword, verifyPassword } from '$lib/server/password.js';
import { getLucia } from '$lib/features/auth/server/auth.js';
import { getDb } from '$lib/server/db/index.js';
import { userTable } from '$lib/server/db/schema.js';
import { normalizeEmail } from '$lib/shared/validation.js';
import { eq } from 'drizzle-orm';

export async function updateEmail(
	userId: string,
	newEmail: string,
	currentPassword: string
): Promise<{ error?: string }> {
	const db = getDb();
	const user = await db.select().from(userTable).where(eq(userTable.id, userId)).get();

	if (!user) {
		return { error: 'User not found' };
	}

	const validPassword = await verifyPassword(currentPassword, user.passwordHash);
	if (!validPassword) {
		return { error: 'Incorrect password' };
	}

	const normalized = normalizeEmail(newEmail);
	const existing = await db.select().from(userTable).where(eq(userTable.email, normalized)).get();
	if (existing && existing.id !== userId) {
		return { error: 'An account with this email already exists' };
	}

	await db
		.update(userTable)
		.set({ email: normalized, emailVerified: false })
		.where(eq(userTable.id, userId));

	return {};
}

export async function updatePassword(
	userId: string,
	currentPassword: string,
	newPassword: string
): Promise<{ error?: string }> {
	const db = getDb();
	const user = await db.select().from(userTable).where(eq(userTable.id, userId)).get();

	if (!user) {
		return { error: 'User not found' };
	}

	const validPassword = await verifyPassword(currentPassword, user.passwordHash);
	if (!validPassword) {
		return { error: 'Incorrect password' };
	}

	const passwordHash = await hashPassword(newPassword);

	await db
		.update(userTable)
		.set({ passwordHash, updatedAt: new Date() })
		.where(eq(userTable.id, userId));

	// Drop every session, including the caller's. The caller gets a fresh one
	// issued by the form action; everyone else is logged out.
	await getLucia().invalidateUserSessions(userId);

	return {};
}
