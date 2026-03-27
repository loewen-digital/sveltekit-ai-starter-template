import { dev } from '$app/environment';
import * as schema from './schema.js';

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type AppDatabase = BetterSQLite3Database<typeof schema> | DrizzleD1Database<typeof schema>;

let _db: AppDatabase;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function initDb(d1?: any): Promise<AppDatabase> {
	if (_db) return _db;

	if (dev) {
		const { default: Database } = await import('better-sqlite3');
		const { drizzle } = await import('drizzle-orm/better-sqlite3');
		const sqlite = new Database('local.db');
		_db = drizzle(sqlite, { schema });
	} else if (d1) {
		const { drizzle } = await import('drizzle-orm/d1');
		_db = drizzle(d1, { schema });
	} else {
		throw new Error('D1 database binding required in production');
	}

	return _db;
}

export function getDb(): AppDatabase {
	if (!_db) throw new Error('Database not initialized. Call initDb() first.');
	return _db;
}
