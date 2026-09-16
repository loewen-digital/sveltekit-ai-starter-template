import { dev } from '$app/environment';
import { flatdb, R2Adapter, type Collection, type StorageAdapter } from '@loewen-digital/flatdb';
import { AtomicFsAdapter } from './atomic-fs-adapter.js';
import { collections, type SessionDoc, type TokenDoc, type UserDoc } from './collections/index.js';

/** Where `vite dev` keeps the JSON documents. Ignored by git. */
export const DATA_DIR = '.data';

/** The app's collections, typed by their zod schemas. */
export interface AppDb {
	users: Collection<UserDoc>;
	sessions: Collection<SessionDoc>;
	tokens: Collection<TokenDoc>;
}

/**
 * Opens the collections on any storage adapter: `MemoryAdapter` in tests,
 * `AtomicFsAdapter` during development, `R2Adapter` on Workers.
 */
export function createDb(adapter: StorageAdapter): AppDb {
	const db = flatdb(adapter, collections);
	// UPSTREAM: https://github.com/loewen-digital/flatdb/issues/7 — flatdb types
	// every collection as `Collection | PathCollection` and loses the schema type.
	return {
		users: db.users as Collection<UserDoc>,
		sessions: db.sessions as Collection<SessionDoc>,
		tokens: db.tokens as Collection<TokenDoc>
	};
}

/**
 * The database for one request. flatdb caches a collection's index in memory
 * and refreshes it only on its own writes, so on Workers a module-level
 * instance would serve stale reads as soon as another isolate had written.
 * The auth handle builds one per request; nothing keeps one at module level.
 */
export function createRequestDb(platform: App.Platform | undefined): AppDb {
	if (dev) return createDb(new AtomicFsAdapter(DATA_DIR));

	const bucket = platform?.env?.CONTENT;
	if (!bucket) throw new Error('The R2 bucket binding CONTENT is required outside vite dev');
	return createDb(new R2Adapter({ bucket, prefix: 'data' }));
}
