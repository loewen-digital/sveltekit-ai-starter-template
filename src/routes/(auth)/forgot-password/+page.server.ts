import { redirect } from '@sveltejs/kit';
import { normalizeEmail, validateEmail } from '$lib/shared/validation.js';
import { checkAuthRateLimit } from '$lib/features/auth/server/rate-limit-guard.js';
import { requestPasswordReset } from '$lib/features/auth/server/password-reset.js';
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

		const { request, url } = event;
		const formData = await request.formData();
		const email = formData.get('email');

		if (typeof email !== 'string') {
			return { success: true };
		}

		const normalizedEmail = normalizeEmail(email);
		const validationError = validateEmail(normalizedEmail);
		if (validationError) {
			return { success: true };
		}

		await requestPasswordReset(normalizedEmail, url.origin);

		// Always return success to prevent email enumeration
		return { success: true };
	}
};
