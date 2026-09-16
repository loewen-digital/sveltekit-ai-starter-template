import { z } from 'zod';

/** Auth sessions, one per login; written by fullstack's flatdb adapter. */
export const sessionSchema = z.object({
	userId: z.string(),
	token: z.string(),
	expiresAt: z.string().datetime(),
	createdAt: z.string().datetime()
});

/** One-time tokens for email verification and password reset. */
export const tokenSchema = z.object({
	userId: z.string(),
	token: z.string(),
	type: z.string(),
	expiresAt: z.string().datetime(),
	usedAt: z.string().datetime().nullable(),
	createdAt: z.string().datetime()
});

export type SessionDoc = z.infer<typeof sessionSchema>;
export type TokenDoc = z.infer<typeof tokenSchema>;
