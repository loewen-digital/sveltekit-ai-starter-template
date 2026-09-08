import { Buffer } from 'node:buffer';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const ALGORITHM = 'scrypt';
const SEPARATOR = ':';
const SALT_BYTES = 16;
const KEY_LEN = 64;

/**
 * Hashes a password with scrypt (Node defaults: N=16384, r=8, p=1).
 *
 * Stored format: `scrypt:<salt_hex>:<key_hex>`, the same layout
 * @loewen-digital/fullstack uses, so nothing has to be migrated when auth
 * moves there. node:crypto is available on Cloudflare Workers under
 * `nodejs_compat`, unlike the native/WASI builds of argon2.
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(SALT_BYTES).toString('hex');
	const key = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
	return [ALGORITHM, salt, key.toString('hex')].join(SEPARATOR);
}

/**
 * Verifies a password against a stored hash. Never throws: a malformed or
 * foreign hash simply does not match.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [algorithm, salt, hex, ...rest] = stored.split(SEPARATOR);
	if (algorithm !== ALGORITHM || !salt || !hex || rest.length > 0) return false;

	const storedKey = Buffer.from(hex, 'hex');
	if (storedKey.length !== KEY_LEN) return false;

	try {
		const key = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
		return timingSafeEqual(storedKey, key);
	} catch {
		return false;
	}
}
