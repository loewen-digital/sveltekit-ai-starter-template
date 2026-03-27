import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRateLimiter } from './rate-limit.js';

describe('createRateLimiter', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('allows requests under the limit', () => {
		const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 3 });

		expect(limiter.check('ip1').allowed).toBe(true);
		expect(limiter.check('ip1').allowed).toBe(true);
		expect(limiter.check('ip1').allowed).toBe(true);
	});

	test('blocks requests over the limit', () => {
		const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 2 });

		expect(limiter.check('ip1').allowed).toBe(true);
		expect(limiter.check('ip1').allowed).toBe(true);

		const result = limiter.check('ip1');
		expect(result.allowed).toBe(false);
		expect(result.retryAfterMs).toBeGreaterThan(0);
	});

	test('allows requests again after window expires', () => {
		const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });

		expect(limiter.check('ip1').allowed).toBe(true);
		expect(limiter.check('ip1').allowed).toBe(false);

		vi.advanceTimersByTime(60001);

		expect(limiter.check('ip1').allowed).toBe(true);
	});

	test('tracks different keys independently', () => {
		const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });

		expect(limiter.check('ip1').allowed).toBe(true);
		expect(limiter.check('ip1').allowed).toBe(false);

		expect(limiter.check('ip2').allowed).toBe(true);
	});

	test('returns correct retryAfterMs', () => {
		const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });

		limiter.check('ip1');

		vi.advanceTimersByTime(20000);

		const result = limiter.check('ip1');
		expect(result.allowed).toBe(false);
		expect(result.retryAfterMs).toBeLessThanOrEqual(40000);
		expect(result.retryAfterMs).toBeGreaterThan(39000);
	});
});
