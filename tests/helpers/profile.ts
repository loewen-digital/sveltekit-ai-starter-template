import type { Page } from '@playwright/test';

export async function navigateToProfile(page: Page): Promise<void> {
	await page.goto('/profile');
	await page.waitForURL('/profile');
}

export async function changeEmail(page: Page, newEmail: string, password: string): Promise<void> {
	await page.locator('input[name="email"]').fill(newEmail);
	await page.locator('input[name="password"]').fill(password);
	await page.getByRole('button', { name: 'Update Email' }).click();
}

export async function changePassword(
	page: Page,
	currentPassword: string,
	newPassword: string,
	confirmPassword: string
): Promise<void> {
	await page.locator('input[name="currentPassword"]').fill(currentPassword);
	await page.locator('input[name="newPassword"]').fill(newPassword);
	await page.locator('input[name="newPasswordConfirm"]').fill(confirmPassword);
	await page.getByRole('button', { name: 'Update Password' }).click();
}
