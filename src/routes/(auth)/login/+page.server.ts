import { fail, redirect } from '@sveltejs/kit';
import { startSession } from '$lib/features/auth/server/auth.js';
import { checkAuthRateLimit } from '$lib/features/auth/server/rate-limit-guard.js';
import { normalizeEmail } from '$lib/shared/validation.js';
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

		const { request, locals } = event;
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, { error: 'Invalid email or password' });
		}

		const normalizedEmail = normalizeEmail(email);
		const user = await locals.authDb.findUserByEmail(normalizedEmail);

		if (!user?.passwordHash || !(await locals.auth.verifyPassword(password, user.passwordHash))) {
			return fail(400, { error: 'Invalid email or password', email: normalizedEmail });
		}

		await startSession(event, user);

		redirect(302, '/');
	}
};
