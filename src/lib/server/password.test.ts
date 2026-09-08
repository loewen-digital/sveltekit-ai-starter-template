import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('hashPassword / verifyPassword', () => {
	it('verifies the password it hashed', async () => {
		const stored = await hashPassword('correct horse battery staple');
		expect(stored).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
		expect(await verifyPassword('correct horse battery staple', stored)).toBe(true);
	});

	it('rejects a wrong password', async () => {
		const stored = await hashPassword('correct horse battery staple');
		expect(await verifyPassword('correct horse battery stapl', stored)).toBe(false);
		expect(await verifyPassword('', stored)).toBe(false);
	});

	it('salts every hash', async () => {
		const a = await hashPassword('same');
		const b = await hashPassword('same');
		expect(a).not.toBe(b);
		expect(await verifyPassword('same', a)).toBe(true);
		expect(await verifyPassword('same', b)).toBe(true);
	});

	it('rejects malformed or foreign hashes without throwing', async () => {
		const bad = [
			'',
			'scrypt',
			'scrypt:abc',
			'scrypt::',
			'scrypt:abcd:zz',
			'scrypt:abcd:' + 'ab'.repeat(32),
			'scrypt:abcd:' + 'ab'.repeat(64) + ':extra',
			'$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA'
		];
		for (const stored of bad) {
			expect(await verifyPassword('pw', stored)).toBe(false);
		}
	});
});
