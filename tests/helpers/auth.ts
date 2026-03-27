import type { Page } from '@playwright/test';

let userCounter = 0;

export function generateTestEmail(): string {
	userCounter++;
	return `test-${Date.now()}-${userCounter}@example.com`;
}

export async function register(page: Page, email: string, password: string): Promise<void> {
	await page.goto('/register');
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').fill(password);
	await page.locator('input[name="passwordConfirm"]').fill(password);
	await page.getByRole('button', { name: 'Register' }).click();
	await page.waitForURL('/');
}

export async function login(page: Page, email: string, password: string): Promise<void> {
	await page.goto('/login');
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').fill(password);
	await page.getByRole('button', { name: 'Login' }).click();
	await page.waitForURL('/');
}

export async function logout(page: Page): Promise<void> {
	await page.getByRole('button', { name: 'Logout' }).click();
	await page.waitForURL('/login');
}
