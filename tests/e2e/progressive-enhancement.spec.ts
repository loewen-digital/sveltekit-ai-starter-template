import { test, expect } from '@playwright/test';
import { generateTestEmail, register } from '../helpers/auth';

const TEST_PASSWORD = 'testpassword123';

test.describe('Progressive enhancement', () => {
	let email: string;

	test.beforeAll(async ({ browser }) => {
		email = generateTestEmail();
		const page = await browser.newPage();
		await register(page, email, TEST_PASSWORD);
		await page.close();
	});

	test('login form is server-rendered and works without JavaScript', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/login');
		await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
		await page.getByLabel('Email', { exact: true }).fill(email);
		await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
		await page.getByRole('button', { name: 'Login' }).click();
		await expect(page).toHaveURL('/');
		await expect(page.getByText(`Welcome, ${email}`)).toBeVisible();
		await context.close();
	});

	test('wrong password without JavaScript shows the server error', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/login');
		await page.getByLabel('Email', { exact: true }).fill(email);
		await page.getByLabel('Password', { exact: true }).fill('wrongpassword');
		await page.getByRole('button', { name: 'Login' }).click();
		const error = page.getByRole('alert');
		await expect(error).toContainText('Invalid email or password');
		// The notification is a shadow component; without its JavaScript the
		// server-rendered panel must not be left transparent.
		await expect
			.poll(() =>
				error.evaluate(
					(el) => getComputedStyle(el.shadowRoot!.querySelector('[part~="base"]')!).opacity
				)
			)
			.toBe('1');
		await context.close();
	});

	test('login form works after hydration, including Enter to submit', async ({ page }) => {
		await page.goto('/login');
		await expect
			.poll(() =>
				page
					.locator('el-button')
					.first()
					.evaluate((el) => el.matches(':defined'))
			)
			.toBe(true);
		await page.getByLabel('Email', { exact: true }).fill(email);
		await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
		await page.getByLabel('Password', { exact: true }).press('Enter');
		await expect(page).toHaveURL('/');
		await expect(page.getByText(`Welcome, ${email}`)).toBeVisible();
	});
});
