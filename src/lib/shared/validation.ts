const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
	if (!EMAIL_REGEX.test(email)) return 'Invalid email address';
	return null;
}

export function validatePassword(password: string): string | null {
	if (password.length < PASSWORD_MIN_LENGTH) return 'Password must be at least 8 characters';
	return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
	if (password !== confirm) return 'Passwords do not match';
	return null;
}

export function validateRegistration(data: {
	email: string;
	password: string;
	passwordConfirm: string;
}): string | null {
	return (
		validateEmail(data.email) ??
		validatePassword(data.password) ??
		validatePasswordConfirm(data.password, data.passwordConfirm)
	);
}
