import type { Handle } from '@sveltejs/kit';
import { initDb } from '$lib/server/db/index.js';
import { logger } from '$lib/server/logger.js';
import { getLucia } from './auth.js';

export const authHandle: Handle = async ({ event, resolve }) => {
	await initDb(event.platform?.env?.DB);
	const lucia = getLucia();

	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	try {
		const { session, user } = await lucia.validateSession(sessionId);

		if (session && session.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}

		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}

		event.locals.user = user;
		event.locals.session = session;
	} catch (error) {
		logger.error('Session validation failed', {
			error: error instanceof Error ? error.message : String(error)
		});
		event.locals.user = null;
		event.locals.session = null;
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	return resolve(event);
};
