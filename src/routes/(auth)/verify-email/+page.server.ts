import { redirect } from '@sveltejs/kit';
import { verifyEmail } from '$lib/features/auth/server/email-verification.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		redirect(302, '/login');
	}

	const result = await verifyEmail(locals, token);

	return {
		error: result.error ?? null
	};
};
