import type { AuthContext } from '$lib/features/auth/server/auth.js';
import { normalizeEmail } from '$lib/shared/validation.js';

export async function updateEmail(
	{ db, auth, authDb }: AuthContext,
	userId: string,
	newEmail: string,
	currentPassword: string
): Promise<{ error?: string }> {
	const user = await authDb.findUserById(userId);

	if (!user) {
		return { error: 'User not found' };
	}

	if (!user.passwordHash || !(await auth.verifyPassword(currentPassword, user.passwordHash))) {
		return { error: 'Incorrect password' };
	}

	const normalized = normalizeEmail(newEmail);
	const existing = await authDb.findUserByEmail(normalized);
	if (existing && String(existing.id) !== userId) {
		return { error: 'An account with this email already exists' };
	}

	// The new address is unverified until its link is clicked.
	await db.users.update({ _id: userId }, { email: normalized, emailVerifiedAt: null });

	return {};
}

export async function updatePassword(
	{ db, auth, authDb }: AuthContext,
	userId: string,
	currentPassword: string,
	newPassword: string
): Promise<{ error?: string }> {
	const user = await authDb.findUserById(userId);

	if (!user) {
		return { error: 'User not found' };
	}

	if (!user.passwordHash || !(await auth.verifyPassword(currentPassword, user.passwordHash))) {
		return { error: 'Incorrect password' };
	}

	await authDb.updateUserPassword(userId, await auth.hashPassword(newPassword));

	// Drop every session, including the caller's. The caller gets a fresh one
	// issued by the form action; everyone else is logged out.
	await db.sessions.delete({ userId });

	return {};
}
