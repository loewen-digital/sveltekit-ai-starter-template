import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AtomicFsAdapter } from './atomic-fs-adapter.js';
import { createDb } from './db.js';

const INDEX = 'users/_index.json';

let dir: string;

beforeEach(async () => {
	dir = await mkdtemp(join(tmpdir(), 'sveltekit-starter-flatdb-'));
});

afterEach(() => rm(dir, { recursive: true, force: true }));

describe('AtomicFsAdapter', () => {
	it('has no version for a missing file and creates it only once', async () => {
		const adapter = new AtomicFsAdapter(dir);

		expect(await adapter.readVersioned(INDEX)).toEqual({ data: null, version: null });
		expect(await adapter.writeIf(INDEX, '{}', null)).not.toBeNull();
		expect(await adapter.writeIf(INDEX, '{"late":1}', null)).toBeNull();
		expect(await adapter.read(INDEX)).toBe('{}');
	});

	it('lets exactly one of many concurrent writers win, across adapter instances', async () => {
		await new AtomicFsAdapter(dir).write(INDEX, '{}');
		const { version } = await new AtomicFsAdapter(dir).readVersioned(INDEX);

		const results = await Promise.all(
			Array.from({ length: 8 }, (_, i) =>
				new AtomicFsAdapter(dir).writeIf(INDEX, `{"writer":${i}}`, version)
			)
		);

		expect(results.filter((r) => r !== null)).toHaveLength(1);
		expect(JSON.parse(await readFile(join(dir, INDEX), 'utf-8'))).toHaveProperty('writer');
	});

	it('keeps every document in the index when requests insert concurrently', async () => {
		// The scenario the E2E suite hit with flatdb's FsAdapter: parallel
		// registrations tore _index.json and dropped entries. Five is what the
		// index store's compare-and-swap loop absorbs without a backoff
		// (loewen-digital/flatdb#10).
		await Promise.all(
			Array.from({ length: 5 }, (_, i) =>
				createDb(new AtomicFsAdapter(dir)).users.insert({
					email: `user-${i}@example.com`,
					passwordHash: 'scrypt:00:00',
					emailVerifiedAt: null,
					createdAt: new Date().toISOString()
				})
			)
		);

		const db = createDb(new AtomicFsAdapter(dir));
		expect(await db.users.count()).toBe(5);
		expect(await db.users.findOne({ email: 'user-4@example.com' })).not.toBeNull();
	});
});
