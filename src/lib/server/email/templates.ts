export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
	return {
		subject: 'Reset your password',
		html: `
			<h1>Reset your password</h1>
			<p>Click the link below to reset your password. This link expires in 1 hour.</p>
			<p><a href="${resetUrl}">${resetUrl}</a></p>
			<p>If you did not request this, you can safely ignore this email.</p>
		`
	};
}

export function emailVerificationEmail(verifyUrl: string): { subject: string; html: string } {
	return {
		subject: 'Verify your email address',
		html: `
			<h1>Verify your email</h1>
			<p>Click the link below to verify your email address. This link expires in 24 hours.</p>
			<p><a href="${verifyUrl}">${verifyUrl}</a></p>
			<p>If you did not create an account, you can safely ignore this email.</p>
		`
	};
}
