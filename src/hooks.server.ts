import { sequence } from '@sveltejs/kit/hooks';
import { authHandle } from '$lib/features/auth/server/middleware.js';
import { rateLimitHandle } from '$lib/features/auth/server/rate-limit-handle.js';

export const handle = sequence(rateLimitHandle, authHandle);
