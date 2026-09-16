import type { AuthDbAdapter, AuthInstance, AuthSession } from '@loewen-digital/fullstack/auth';
import type { SessionUser } from '$lib/features/auth/server/auth.js';
import type { AppDb } from '$lib/server/db.js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** This request's collections, built in the auth handle. */
			db: AppDb;
			auth: AuthInstance;
			authDb: AuthDbAdapter;
			/** Set by fullstack's handle from the auth cookie; null when logged out. */
			authSession: AuthSession | null;
			/** The user behind `authSession`, without secrets; null when logged out. */
			user: SessionUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				CONTENT: R2Bucket;
			};
		}
	}
}

export {};
