import { fail, redirect } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import { getLucia } from '$lib/features/auth/server/auth.js';
import { getDb } from '$lib/server/db/index.js';
import { userTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const passwordConfirm = formData.get('passwordConfirm');

		if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { error: 'Invalid email address', email: String(email ?? '') });
		}

		if (typeof password !== 'string' || password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters',
				email: String(email)
			});
		}

		if (password !== passwordConfirm) {
			return fail(400, { error: 'Passwords do not match', email: String(email) });
		}

		const db = getDb();
		const existingUser = await db.select().from(userTable).where(eq(userTable.email, email)).get();

		if (existingUser) {
			return fail(400, {
				error: 'An account with this email already exists',
				email: String(email)
			});
		}

		const userId = generateIdFromEntropySize(10);
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		await getDb().insert(userTable).values({
			id: userId,
			email,
			passwordHash
		});

		const lucia = getLucia();
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
