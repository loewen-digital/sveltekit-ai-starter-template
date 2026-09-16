import { z } from 'zod';

/**
 * The app's users. `email`, `passwordHash` and `emailVerifiedAt` are the
 * fields fullstack's auth adapter reads and writes; flatdb strips fields a
 * schema does not declare, so they must be listed here. Dates are ISO 8601
 * strings because JSON has no Date.
 */
export const userSchema = z.object({
	email: z.string(),
	passwordHash: z.string(),
	emailVerifiedAt: z.string().datetime().nullable(),
	createdAt: z.string().datetime()
});

export type UserDoc = z.infer<typeof userSchema>;
