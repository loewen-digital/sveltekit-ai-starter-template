import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { clearAuthCookie, createHandle } from '@loewen-digital/fullstack/adapters/sveltekit';
import { createRequestDb } from '$lib/server/db.js';
import { AUTH_COOKIE, createAppAuth, toSessionUser } from './auth.js';

/** The database and the auth stack for this request, on `event.locals`. */
const stackHandle: Handle = ({ event, resolve }) => {
	const db = createRequestDb(event.platform);
	const { auth, authDb } = createAppAuth(db);
	event.locals.db = db;
	event.locals.auth = auth;
	event.locals.authDb = authDb;
	event.locals.authSession = null;
	event.locals.user = null;
	return resolve(event);
};

/**
 * fullstack validates the auth cookie against the sessions collection and
 * sets `locals.authSession`. Its handle is a closure over this request's
 * stack, so building it here costs nothing.
 */
const fullstackHandle: Handle = ({ event, resolve }) =>
	createHandle({ auth: event.locals.auth }, { authCookie: AUTH_COOKIE })({ event, resolve });

/**
 * Loads the user behind the session; fullstack leaves that to the app
 * (loewen-digital/fullstack#9). A cookie without a user behind it is dropped.
 */
const userHandle: Handle = async ({ event, resolve }) => {
	const { auth, authDb, authSession } = event.locals;
	const user = authSession ? await authDb.findUserById(authSession.userId) : null;

	if (user) {
		event.locals.user = toSessionUser(user);
	} else if (event.cookies.get(AUTH_COOKIE)) {
		if (authSession) await auth.destroySession(authSession.token);
		event.locals.authSession = null;
		clearAuthCookie(event, { authCookie: AUTH_COOKIE });
	}

	return resolve(event);
};

export const authHandle = sequence(stackHandle, fullstackHandle, userHandle);
