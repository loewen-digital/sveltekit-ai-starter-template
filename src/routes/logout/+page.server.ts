import { redirect } from '@sveltejs/kit';
import { clearAuthCookie } from '@loewen-digital/fullstack/adapters/sveltekit';
import { AUTH_COOKIE } from '$lib/features/auth/server/auth.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	redirect(302, '/');
};

export const actions: Actions = {
	default: async (event) => {
		const { auth, authSession } = event.locals;
		if (!authSession) {
			redirect(302, '/login');
		}

		await auth.destroySession(authSession.token);
		clearAuthCookie(event, { authCookie: AUTH_COOKIE });

		redirect(302, '/login');
	}
};
