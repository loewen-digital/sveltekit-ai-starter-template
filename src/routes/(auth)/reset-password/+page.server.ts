import { fail, redirect } from '@sveltejs/kit';
import { validatePassword, validatePasswordConfirm } from '$lib/shared/validation.js';
import { resetPassword } from '$lib/features/auth/server/password-reset.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		redirect(302, '/');
	}

	const token = url.searchParams.get('token');
	if (!token) {
		redirect(302, '/login');
	}

	return { token };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const token = formData.get('token');
		const password = formData.get('password');
		const passwordConfirm = formData.get('passwordConfirm');

		if (
			typeof token !== 'string' ||
			typeof password !== 'string' ||
			typeof passwordConfirm !== 'string'
		) {
			return fail(400, { error: 'Invalid form data' });
		}

		const passwordError = validatePassword(password);
		if (passwordError) {
			return fail(400, { error: passwordError, token });
		}

		const confirmError = validatePasswordConfirm(password, passwordConfirm);
		if (confirmError) {
			return fail(400, { error: confirmError, token });
		}

		const result = await resetPassword(token, password);
		if (result.error) {
			return fail(400, { error: result.error, token });
		}

		return { success: true };
	}
};
