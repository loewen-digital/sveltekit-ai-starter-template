import { verify, hash } from '@node-rs/argon2';
import { getDb } from '$lib/server/db/index.js';
import { userTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const ARGON2_CONFIG = {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
};

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

	const validPassword = await verify(user.passwordHash, currentPassword, ARGON2_CONFIG);
	if (!validPassword) {
		return { error: 'Incorrect password' };
	}

	const existing = await db.select().from(userTable).where(eq(userTable.email, newEmail)).get();
	if (existing && existing.id !== userId) {
		return { error: 'An account with this email already exists' };
	}

	await db
		.update(userTable)
		.set({ email: newEmail, updatedAt: new Date() })
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

	const validPassword = await verify(user.passwordHash, currentPassword, ARGON2_CONFIG);
	if (!validPassword) {
		return { error: 'Incorrect password' };
	}

	const passwordHash = await hash(newPassword, ARGON2_CONFIG);

	await db
		.update(userTable)
		.set({ passwordHash, updatedAt: new Date() })
		.where(eq(userTable.id, userId));

	return {};
}
