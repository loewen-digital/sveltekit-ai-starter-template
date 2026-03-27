import { fail } from '@sveltejs/kit';
import { createVerificationToken } from '$lib/features/auth/server/email-verification.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user };
};

export const actions: Actions = {
	default: async ({ locals, url }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}

		if (locals.user.emailVerified) {
			return { success: true };
		}

		await createVerificationToken(locals.user.id, locals.user.email, url.origin);

		return { success: true };
	}
};
