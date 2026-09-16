import { fail, redirect } from '@sveltejs/kit';
import { startSession } from '$lib/features/auth/server/auth.js';
import { checkAuthRateLimit } from '$lib/features/auth/server/rate-limit-guard.js';
import { createVerificationToken } from '$lib/features/auth/server/email-verification.js';
import { validateRegistration, normalizeEmail } from '$lib/shared/validation.js';
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

		const { request, locals, url } = event;
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const passwordConfirm = formData.get('passwordConfirm');

		if (
			typeof email !== 'string' ||
			typeof password !== 'string' ||
			typeof passwordConfirm !== 'string'
		) {
			return fail(400, { error: 'Invalid form data', email: String(email ?? '') });
		}

		const normalizedEmail = normalizeEmail(email);
		const validationError = validateRegistration({
			email: normalizedEmail,
			password,
			passwordConfirm
		});
		if (validationError) {
			return fail(400, { error: validationError, email });
		}

		const { db, auth } = locals;
		if (await db.users.findOne({ email: normalizedEmail })) {
			return fail(400, {
				error: 'An account with this email already exists',
				email: normalizedEmail
			});
		}

		const user = await db.users.insert({
			email: normalizedEmail,
			passwordHash: await auth.hashPassword(password),
			emailVerifiedAt: null,
			createdAt: new Date().toISOString()
		});

		await startSession(event, { id: user._id, email: user.email });

		await createVerificationToken(locals, user._id, normalizedEmail, url.origin);

		redirect(302, '/');
	}
};
