import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MemoryAdapter } from '@loewen-digital/flatdb';
import { createDb } from '$lib/server/db.js';
import { updateEmail, updatePassword } from '$lib/features/profile/server/profile.js';
import { createAppAuth, type AuthContext } from './auth.js';
import { createVerificationToken, EMAIL_VERIFICATION, verifyEmail } from './email-verification.js';
import { PASSWORD_RESET, resetPassword } from './password-reset.js';

const ORIGIN = 'http://localhost:5173';
const EMAIL = 'alice@example.com';
const PASSWORD = 'correct horse battery staple';

/** The whole stack on an in-memory adapter, with one registered user. */
async function stack(): Promise<AuthContext & { userId: string }> {
	const db = createDb(new MemoryAdapter());
	const ctx = { db, ...createAppAuth(db) };
	const user = await db.users.insert({
		email: EMAIL,
		passwordHash: await ctx.auth.hashPassword(PASSWORD),
		emailVerifiedAt: null,
		createdAt: new Date().toISOString()
	});
	return { ...ctx, userId: user._id };
}

beforeAll(() => {
	// Mail goes to the log, never over the network.
	vi.stubEnv('EMAIL_PROVIDER', 'console');
});

describe('login', () => {
	it('verifies the password and opens a session the handle can validate', async () => {
		const { auth, authDb } = await stack();
		const user = await authDb.findUserByEmail(EMAIL);

		expect(user?.passwordHash).toMatch(/^scrypt:/);
		expect(await auth.verifyPassword(PASSWORD, user!.passwordHash!)).toBe(true);
		expect(await auth.verifyPassword('wrong', user!.passwordHash!)).toBe(false);

		const session = await auth.createSession(user!);
		expect(await auth.validateSession(session.token)).toMatchObject({ userId: user!.id });
		expect(await auth.validateSession('not-a-token')).toBeNull();
	});
});

describe('password reset', () => {
	it('sets the new password, burns the link and revokes every session', async () => {
		const ctx = await stack();
		const user = (await ctx.authDb.findUserById(ctx.userId))!;
		await ctx.auth.createSession(user);
		await ctx.auth.createSession(user);
		const token = await ctx.auth.generateToken(ctx.userId, PASSWORD_RESET);

		expect(await resetPassword(ctx, token, 'new password 1')).toEqual({});

		const updated = (await ctx.authDb.findUserById(ctx.userId))!;
		expect(await ctx.auth.verifyPassword('new password 1', updated.passwordHash!)).toBe(true);
		expect(await ctx.db.sessions.count({ userId: ctx.userId })).toBe(0);
		expect(await resetPassword(ctx, token, 'new password 2')).toEqual({
			error: expect.stringMatching(/Invalid or expired/)
		});
	});
});

describe('email verification', () => {
	it('keeps one live link per user and marks the address verified', async () => {
		const ctx = await stack();

		await createVerificationToken(ctx, ctx.userId, EMAIL, ORIGIN);
		const first = (await ctx.db.tokens.findOne({ userId: ctx.userId }))!;
		await createVerificationToken(ctx, ctx.userId, EMAIL, ORIGIN);
		expect(await ctx.db.tokens.count({ userId: ctx.userId, type: EMAIL_VERIFICATION })).toBe(1);
		const second = (await ctx.db.tokens.findOne({ userId: ctx.userId }))!;

		expect(await verifyEmail(ctx, first.token)).toEqual({
			error: expect.stringMatching(/Invalid or expired/)
		});
		expect(await verifyEmail(ctx, second.token)).toEqual({});
		expect((await ctx.authDb.findUserById(ctx.userId))?.emailVerifiedAt).toBeInstanceOf(Date);
		expect(await ctx.db.tokens.count({ userId: ctx.userId })).toBe(0);
	});
});

describe('profile', () => {
	it('changing the email needs the password and clears the verification', async () => {
		const ctx = await stack();
		await ctx.authDb.markEmailVerified(ctx.userId);

		expect(await updateEmail(ctx, ctx.userId, 'bob@example.com', 'wrong')).toEqual({
			error: 'Incorrect password'
		});
		expect(await updateEmail(ctx, ctx.userId, 'Bob@Example.com', PASSWORD)).toEqual({});

		expect(await ctx.authDb.findUserById(ctx.userId)).toMatchObject({
			email: 'bob@example.com',
			emailVerifiedAt: null
		});
		expect(await ctx.authDb.findUserByEmail(EMAIL)).toBeNull();
	});

	it('refuses an email another account already uses', async () => {
		const ctx = await stack();
		await ctx.db.users.insert({
			email: 'bob@example.com',
			passwordHash: 'scrypt:00:00',
			emailVerifiedAt: null,
			createdAt: new Date().toISOString()
		});

		expect(await updateEmail(ctx, ctx.userId, 'bob@example.com', PASSWORD)).toEqual({
			error: expect.stringMatching(/already exists/)
		});
	});

	it('changing the password needs the current one and revokes every session', async () => {
		const ctx = await stack();
		const user = (await ctx.authDb.findUserById(ctx.userId))!;
		await ctx.auth.createSession(user);

		expect(await updatePassword(ctx, ctx.userId, 'wrong', 'new password 1')).toEqual({
			error: 'Incorrect password'
		});
		expect(await updatePassword(ctx, ctx.userId, PASSWORD, 'new password 1')).toEqual({});

		expect(await ctx.db.sessions.count({ userId: ctx.userId })).toBe(0);
		const updated = (await ctx.authDb.findUserById(ctx.userId))!;
		expect(await ctx.auth.verifyPassword('new password 1', updated.passwordHash!)).toBe(true);
	});
});
