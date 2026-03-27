import type { Handle } from '@sveltejs/kit';
import { authRateLimiter } from '$lib/server/rate-limit.js';

const RATE_LIMITED_PATHS = ['/login', '/register'];

export const rateLimitHandle: Handle = async ({ event, resolve }) => {
	if (event.request.method !== 'POST') {
		return resolve(event);
	}

	const path = event.url.pathname;
	if (!RATE_LIMITED_PATHS.includes(path)) {
		return resolve(event);
	}

	const ip = event.getClientAddress();
	const { allowed, retryAfterMs } = authRateLimiter.check(ip);

	if (!allowed) {
		return new Response(
			JSON.stringify({ error: 'Too many requests. Please try again later.' }),
			{
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': String(Math.ceil(retryAfterMs / 1000))
				}
			}
		);
	}

	return resolve(event);
};
