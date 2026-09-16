import { createHash } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { FsAdapter, type StorageAdapter, type VersionedRead } from '@loewen-digital/flatdb';

// One queue per file for the whole process: every request builds its own
// adapter, and the requests of one dev server share the folder.
const queues = new Map<string, Promise<unknown>>();

/**
 * `FsAdapter` for `vite dev`, with what concurrent requests in one process
 * need: every write lands atomically (temp file plus rename), and
 * `_index.json` goes through flatdb's compare-and-swap via `readVersioned`
 * and `writeIf`, so two requests that insert at once keep each other's
 * entries instead of leaving a torn file behind. flatdb's own `FsAdapter`
 * writes in place and unconditionally, which the Playwright suite turns into
 * a corrupt index within one run.
 *
 * UPSTREAM: https://github.com/loewen-digital/flatdb/issues/10
 */
export class AtomicFsAdapter extends FsAdapter implements StorageAdapter {
	private readonly base: string;

	constructor(basePath: string) {
		super(basePath);
		this.base = basePath;
	}

	override write(path: string, data: string): Promise<void> {
		return this.queued(path, () => this.writeAtomic(path, data));
	}

	readVersioned(path: string): Promise<VersionedRead> {
		// Waits for a write in flight, so the caller starts from its result and
		// rarely has to retry.
		return this.queued(path, async () => {
			const data = await this.read(path);
			return { data, version: data === null ? null : version(data) };
		});
	}

	writeIf(path: string, data: string, expected: string | null): Promise<string | null> {
		return this.queued(path, async () => {
			const current = await this.read(path);
			const actual = current === null ? null : version(current);
			if (actual !== expected) return null;
			await this.writeAtomic(path, data);
			return version(data);
		});
	}

	/** Runs `fn` once every earlier queued operation on `path` has settled. */
	private queued<T>(path: string, fn: () => Promise<T>): Promise<T> {
		const key = join(this.base, path);
		const previous = queues.get(key) ?? Promise.resolve();
		const run = previous.then(fn, fn);
		queues.set(
			key,
			run.catch(() => undefined)
		);
		return run;
	}

	private async writeAtomic(path: string, data: string): Promise<void> {
		const target = join(this.base, path);
		const temp = `${target}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
		await mkdir(dirname(target), { recursive: true });
		await writeFile(temp, data, 'utf-8');
		await rename(temp, target);
	}
}

function version(data: string): string {
	return createHash('sha256').update(data).digest('hex');
}
