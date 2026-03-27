import { test, expect } from '@playwright/test';
import { generateTestEmail, register, login, logout } from '../helpers/auth';

const TEST_PASSWORD = 'testpassword123';

test.describe('Registration', () => {
	test('register with valid data redirects to home', async ({ page }) => {
		const email = generateTestEmail();
		await register(page, email, TEST_PASSWORD);
		await expect(page).toHaveURL('/');
		await expect(page.getByText(`Welcome, ${email}`)).toBeVisible();
	});

	test('register with invalid email shows error', async ({ page }) => {
		await page.goto('/register');
		// "test@test" passes HTML5 email validation but fails our stricter regex (requires dot in domain)
		await page.locator('input[name="email"]').fill('test@test');
		await page.locator('input[name="password"]').fill(TEST_PASSWORD);
		await page.locator('input[name="passwordConfirm"]').fill(TEST_PASSWORD);
		await page.getByRole('button', { name: 'Register' }).click();
		await expect(page.getByText('Invalid email')).toBeVisible();
	});

	test('register with short password shows error', async ({ page }) => {
		await page.goto('/register');
		await page.locator('input[name="email"]').fill(generateTestEmail());
		await page.locator('input[name="password"]').fill('short');
		await page.locator('input[name="passwordConfirm"]').fill('short');
		await page.getByRole('button', { name: 'Register' }).click();
		await expect(page.getByText('at least 8 characters')).toBeVisible();
	});

	test('register with mismatched passwords shows error', async ({ page }) => {
		await page.goto('/register');
		await page.locator('input[name="email"]').fill(generateTestEmail());
		await page.locator('input[name="password"]').fill(TEST_PASSWORD);
		await page.locator('input[name="passwordConfirm"]').fill('different123');
		await page.getByRole('button', { name: 'Register' }).click();
		await expect(page.getByText('do not match')).toBeVisible();
	});
});

test.describe('Login', () => {
	let testEmail: string;

	test.beforeAll(async ({ browser }) => {
		testEmail = generateTestEmail();
		const page = await browser.newPage();
		await register(page, testEmail, TEST_PASSWORD);
		await page.close();
	});

	test('login with valid credentials redirects to home', async ({ page }) => {
		await login(page, testEmail, TEST_PASSWORD);
		await expect(page).toHaveURL('/');
		await expect(page.getByText(`Welcome, ${testEmail}`)).toBeVisible();
	});

	test('login with wrong password shows error', async ({ page }) => {
		await page.goto('/login');
		await page.locator('input[name="email"]').fill(testEmail);
		await page.locator('input[name="password"]').fill('wrongpassword');
		await page.getByRole('button', { name: 'Login' }).click();
		await expect(page.getByText('Invalid email or password')).toBeVisible();
	});

	test('session persists after page reload', async ({ page }) => {
		await login(page, testEmail, TEST_PASSWORD);
		await expect(page).toHaveURL('/');

		await page.reload();
		await expect(page.getByText(`Welcome, ${testEmail}`)).toBeVisible();
	});
});

test.describe('Logout', () => {
	test('logout redirects to login', async ({ page }) => {
		const email = generateTestEmail();
		await register(page, email, TEST_PASSWORD);
		await expect(page).toHaveURL('/');

		await logout(page);
		await expect(page).toHaveURL('/login');
	});
});

test.describe('Route Protection', () => {
	test('unauthenticated access to / redirects to login', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login');
	});

	test('authenticated user on /login redirects to home', async ({ page }) => {
		const email = generateTestEmail();
		await register(page, email, TEST_PASSWORD);
		await page.goto('/login');
		await expect(page).toHaveURL('/');
	});
});
