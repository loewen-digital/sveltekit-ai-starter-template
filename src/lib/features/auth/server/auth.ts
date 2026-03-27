import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { dev } from '$app/environment';
import { getDb } from '$lib/server/db/index.js';
import { sessionTable, userTable } from '$lib/server/db/schema.js';

interface DatabaseUserAttributes {
	email: string;
}

type AppLucia = Lucia<Record<never, never>, { email: string }>;

let _lucia: AppLucia | null = null;

export function getLucia(): AppLucia {
	if (_lucia) return _lucia;

	const db = getDb();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const adapter = new DrizzleSQLiteAdapter(db as any, sessionTable, userTable);

	_lucia = new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: !dev
			}
		},
		getUserAttributes: (attributes) => {
			return {
				email: attributes.email
			};
		}
	});

	return _lucia;
}

declare module 'lucia' {
	interface Register {
		Lucia: AppLucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}
