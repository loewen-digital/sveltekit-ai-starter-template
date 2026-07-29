import { sequence } from '@sveltejs/kit/hooks';
import { authHandle } from '$lib/features/auth/server/middleware.js';

// Rate limiting lives in the auth form actions (see rate-limit-guard.ts), not
// here, so it can return a form-level failure instead of a raw 429 response.
export const handle = sequence(authHandle);
