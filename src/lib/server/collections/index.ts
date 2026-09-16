import { collection } from '@loewen-digital/flatdb';
import { sessionSchema, tokenSchema } from './auth.js';
import { userSchema } from './users.js';

export { sessionSchema, tokenSchema, type SessionDoc, type TokenDoc } from './auth.js';
export { userSchema, type UserDoc } from './users.js';

/**
 * Every collection of the app. Each one is a folder (`users/<id>.json`) plus
 * an `_index.json` that holds all of its documents; on R2 the keys mirror
 * that layout.
 */
export const collections = {
	users: collection(userSchema),
	sessions: collection(sessionSchema),
	tokens: collection(tokenSchema)
};
