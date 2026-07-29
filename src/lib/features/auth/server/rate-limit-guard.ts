import { fail, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { authRateLimiter } from '$lib/server/rate-limit.js';

export type RateLimitFailure = ActionFailure<{ error: string }>;

/**
 * Guard for auth form actions. Call it as the first statement of an action and
 * return its result when it is non-null:
 *
 *   const limited = checkAuthRateLimit(event);
 *   if (limited) return limited;
 *
 * Returning a `fail()` instead of a bare 429 Response keeps progressive
 * enhancement intact — the message renders inside the form like any other
 * validation error rather than replacing the page with raw JSON.
 *
 * Set DISABLE_RATE_LIMIT=true to switch the limiter off. The E2E suite needs
 * this: every test hits the app from the same IP and would otherwise exhaust
 * the budget partway through the run.
 */
export function checkAuthRateLimit(event: RequestEvent): RateLimitFailure | null {
	if (env.DISABLE_RATE_LIMIT === 'true') return null;

	const { allowed, retryAfterMs } = authRateLimiter.check(event.getClientAddress());
	if (allowed) return null;

	event.setHeaders({ 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) });

	const minutes = Math.max(1, Math.ceil(retryAfterMs / 60_000));
	return fail(429, {
		error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
	});
}
