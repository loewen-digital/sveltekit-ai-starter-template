type RateLimitConfig = {
	windowMs: number;
	maxRequests: number;
};

type RateLimitResult = {
	allowed: boolean;
	retryAfterMs: number;
};

export function createRateLimiter(config: RateLimitConfig) {
	const requests = new Map<string, number[]>();

	function check(key: string): RateLimitResult {
		const now = Date.now();
		const windowStart = now - config.windowMs;

		const timestamps = (requests.get(key) ?? []).filter((t) => t > windowStart);

		if (timestamps.length >= config.maxRequests) {
			const oldestInWindow = timestamps[0];
			const retryAfterMs = oldestInWindow + config.windowMs - now;
			requests.set(key, timestamps);
			return { allowed: false, retryAfterMs };
		}

		timestamps.push(now);
		requests.set(key, timestamps);
		return { allowed: true, retryAfterMs: 0 };
	}

	return { check };
}

// 10 attempts per 15 minutes per IP.
// Note: On Cloudflare Workers each isolate has its own memory, so this is
// per-isolate. For distributed rate limiting use Cloudflare KV or Durable Objects.
export const authRateLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	maxRequests: 10
});
