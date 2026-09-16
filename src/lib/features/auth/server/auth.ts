import type { RequestEvent } from '@sveltejs/kit';
import {
	createAuth,
	type AuthDbAdapter,
	type AuthInstance,
	type AuthUser
} from '@loewen-digital/fullstack/auth';
import { createFlatdbAuthAdapter } from '@loewen-digital/fullstack/auth/flatdb';
import { setAuthCookie } from '@loewen-digital/fullstack/adapters/sveltekit';
import type { AppDb } from '$lib/server/db.js';

/** Auth sessions and their cookie live this long, in seconds. */
export const SESSION_TTL = 7 * 24 * 3600;

/** The cookie that carries the opaque session token. */
export const AUTH_COOKIE = 'fs_token';

export interface AppAuth {
	auth: AuthInstance;
	authDb: AuthDbAdapter;
}

/** The user as pages and layouts see it: no hash, no dates. */
export interface SessionUser {
	id: string;
	email: string;
	emailVerified: boolean;
}

/** What server code needs from `event.locals` to touch users and sessions. */
export type AuthContext = Pick<App.Locals, 'db' | 'auth' | 'authDb'>;

/**
 * fullstack's auth on this request's collections. Both factories hold no
 * state and cost nothing, so they are built per request next to the database.
 */
export function createAppAuth(db: AppDb): AppAuth {
	const authDb = createFlatdbAuthAdapter(db);
	const auth = createAuth({ sessionTtl: SESSION_TTL }, { db: authDb });
	return { auth, authDb };
}

export function toSessionUser(user: AuthUser): SessionUser {
	return {
		id: String(user.id),
		email: user.email,
		emailVerified: Boolean(user.emailVerifiedAt)
	};
}

/** Opens a session for `user` and sets its cookie on the response. */
export async function startSession(event: RequestEvent, user: AuthUser): Promise<void> {
	const session = await event.locals.auth.createSession(user);
	setAuthCookie(event, session.token, { maxAge: SESSION_TTL, authCookie: AUTH_COOKIE });
}
