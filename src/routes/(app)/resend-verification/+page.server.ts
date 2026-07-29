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

		const { delivered } = await createVerificationToken(
			locals.user.id,
			locals.user.email,
			url.origin
		);

		// Delivering the mail is the entire point of this page, so a failure here
		// has to reach the user rather than showing a "check your inbox" lie.
		if (!delivered) {
			return fail(502, {
				error: 'We could not send the verification email right now. Please try again in a moment.'
			});
		}

		return { success: true };
	}
};
