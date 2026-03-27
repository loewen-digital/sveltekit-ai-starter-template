import { dev } from '$app/environment';
import { logger } from '$lib/server/logger.js';
import * as schema from './schema.js';

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type AppDatabase = BetterSQLite3Database<typeof schema> | DrizzleD1Database<typeof schema>;

let _db: AppDatabase;

export async function initDb(d1?: unknown): Promise<AppDatabase> {
	if (_db) return _db;

	try {
		if (dev) {
			const { default: Database } = await import('better-sqlite3');
			const { drizzle } = await import('drizzle-orm/better-sqlite3');
			const sqlite = new Database('local.db');
			_db = drizzle(sqlite, { schema });
			logger.info('Database initialized', { adapter: 'better-sqlite3' });
		} else if (d1) {
			const { drizzle } = await import('drizzle-orm/d1');
			_db = drizzle(d1, { schema });
			logger.info('Database initialized', { adapter: 'd1' });
		} else {
			throw new Error('D1 database binding required in production');
		}
	} catch (error) {
		logger.error('Failed to initialize database', {
			error: error instanceof Error ? error.message : String(error)
		});
		throw error;
	}

	return _db;
}

export function getDb(): AppDatabase {
	if (!_db) throw new Error('Database not initialized. Call initDb() first.');
	return _db;
}
