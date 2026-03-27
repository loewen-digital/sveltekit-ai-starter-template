import { randomBytes, createHash } from 'crypto';
import { generateIdFromEntropySize } from 'lucia';

export function generateToken(): string {
	return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function generateId(): string {
	return generateIdFromEntropySize(10);
}

export function isTokenExpired(expiresAt: Date): boolean {
	return new Date() > expiresAt;
}
