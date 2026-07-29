import { fail } from '@sveltejs/kit';
import {
	validateEmail,
	validatePassword,
	validatePasswordConfirm,
	normalizeEmail
} from '$lib/shared/validation.js';
import { getLucia } from '$lib/features/auth/server/auth.js';
import { createVerificationToken } from '$lib/features/auth/server/email-verification.js';
import { updateEmail, updatePassword } from '$lib/features/profile/server/profile.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user };
};

export const actions: Actions = {
	updateEmail: async ({ request, locals, url }) => {
		if (!locals.user) {
			return fail(401, { emailError: 'Not authenticated' });
		}

		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, { emailError: 'Invalid form data' });
		}

		const normalized = normalizeEmail(email);
		const validationError = validateEmail(normalized);
		if (validationError) {
			return fail(400, { emailError: validationError });
		}

		const result = await updateEmail(locals.user.id, normalized, password);
		if (result.error) {
			return fail(400, { emailError: result.error });
		}

		// The address is already changed at this point, so a failed mail must not
		// read as a full success — it would leave the user waiting for an inbox
		// that never fills.
		const { delivered } = await createVerificationToken(locals.user.id, normalized, url.origin);

		if (!delivered) {
			return {
				emailSuccess:
					'Email updated, but the verification message could not be sent. You can request a new one from the verification page.'
			};
		}

		return { emailSuccess: 'Email updated. Please check your inbox to verify your new email.' };
	},

	updatePassword: async ({ request, locals, cookies }) => {
		if (!locals.user) {
			return fail(401, { passwordError: 'Not authenticated' });
		}

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword');
		const newPassword = formData.get('newPassword');
		const newPasswordConfirm = formData.get('newPasswordConfirm');

		if (
			typeof currentPassword !== 'string' ||
			typeof newPassword !== 'string' ||
			typeof newPasswordConfirm !== 'string'
		) {
			return fail(400, { passwordError: 'Invalid form data' });
		}

		const passwordError = validatePassword(newPassword);
		if (passwordError) {
			return fail(400, { passwordError });
		}

		const confirmError = validatePasswordConfirm(newPassword, newPasswordConfirm);
		if (confirmError) {
			return fail(400, { passwordError: confirmError });
		}

		const result = await updatePassword(locals.user.id, currentPassword, newPassword);
		if (result.error) {
			return fail(400, { passwordError: result.error });
		}

		// updatePassword invalidated every session, including this one. Issue a
		// fresh session so the user who just changed their password stays in.
		const lucia = getLucia();
		const session = await lucia.createSession(locals.user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return { passwordSuccess: 'Password updated successfully' };
	}
};
