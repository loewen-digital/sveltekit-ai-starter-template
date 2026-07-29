import { fail, redirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { getLucia } from '$lib/features/auth/server/auth.js';
import { checkAuthRateLimit } from '$lib/features/auth/server/rate-limit-guard.js';
import { getDb } from '$lib/server/db/index.js';
import { userTable } from '$lib/server/db/schema.js';
import { normalizeEmail } from '$lib/shared/validation.js';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async (event) => {
		const limited = checkAuthRateLimit(event);
		if (limited) return limited;

		const { request, cookies } = event;
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, { error: 'Invalid email or password' });
		}

		const normalizedEmail = normalizeEmail(email);
		const user = await getDb()
			.select()
			.from(userTable)
			.where(eq(userTable.email, normalizedEmail))
			.get();

		if (!user) {
			return fail(400, { error: 'Invalid email or password', email: normalizedEmail });
		}

		const validPassword = await verify(user.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!validPassword) {
			return fail(400, { error: 'Invalid email or password', email: normalizedEmail });
		}

		const lucia = getLucia();
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
