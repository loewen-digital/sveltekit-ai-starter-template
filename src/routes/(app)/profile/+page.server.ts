import { fail } from '@sveltejs/kit';
import { validateEmail, validatePassword, validatePasswordConfirm } from '$lib/shared/validation.js';
import { updateEmail, updatePassword } from '$lib/features/profile/server/profile.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user };
};

export const actions: Actions = {
	updateEmail: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { emailError: 'Not authenticated' });
		}

		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, { emailError: 'Invalid form data' });
		}

		const validationError = validateEmail(email);
		if (validationError) {
			return fail(400, { emailError: validationError });
		}

		const result = await updateEmail(locals.user.id, email, password);
		if (result.error) {
			return fail(400, { emailError: result.error });
		}

		return { emailSuccess: 'Email updated successfully' };
	},

	updatePassword: async ({ request, locals }) => {
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

		return { passwordSuccess: 'Password updated successfully' };
	}
};
