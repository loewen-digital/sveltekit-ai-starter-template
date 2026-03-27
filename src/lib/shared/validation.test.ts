import { describe, test, expect } from 'vitest';
import {
	validateEmail,
	validatePassword,
	validatePasswordConfirm,
	validateRegistration
} from './validation.js';

describe('validateEmail', () => {
	test('returns null for valid email', () => {
		expect(validateEmail('user@example.com')).toBeNull();
	});

	test('returns error for empty string', () => {
		expect(validateEmail('')).toBe('Invalid email address');
	});

	test('returns error for email without @', () => {
		expect(validateEmail('userexample.com')).toBe('Invalid email address');
	});

	test('returns error for email without domain dot', () => {
		expect(validateEmail('user@example')).toBe('Invalid email address');
	});

	test('returns error for email with spaces', () => {
		expect(validateEmail('user @example.com')).toBe('Invalid email address');
	});
});

describe('validatePassword', () => {
	test('returns null for password with 8 or more characters', () => {
		expect(validatePassword('12345678')).toBeNull();
	});

	test('returns error for password shorter than 8 characters', () => {
		expect(validatePassword('short')).toBe('Password must be at least 8 characters');
	});

	test('returns error for empty string', () => {
		expect(validatePassword('')).toBe('Password must be at least 8 characters');
	});
});

describe('validatePasswordConfirm', () => {
	test('returns null when passwords match', () => {
		expect(validatePasswordConfirm('password123', 'password123')).toBeNull();
	});

	test('returns error when passwords differ', () => {
		expect(validatePasswordConfirm('password123', 'different')).toBe('Passwords do not match');
	});
});

describe('validateRegistration', () => {
	test('returns null for valid registration data', () => {
		expect(
			validateRegistration({
				email: 'user@example.com',
				password: 'password123',
				passwordConfirm: 'password123'
			})
		).toBeNull();
	});

	test('returns first error encountered (email)', () => {
		expect(
			validateRegistration({
				email: 'invalid',
				password: 'password123',
				passwordConfirm: 'password123'
			})
		).toBe('Invalid email address');
	});

	test('returns first error encountered (password)', () => {
		expect(
			validateRegistration({
				email: 'user@example.com',
				password: 'short',
				passwordConfirm: 'short'
			})
		).toBe('Password must be at least 8 characters');
	});

	test('returns first error encountered (confirm)', () => {
		expect(
			validateRegistration({
				email: 'user@example.com',
				password: 'password123',
				passwordConfirm: 'different'
			})
		).toBe('Passwords do not match');
	});
});
