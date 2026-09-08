import { test, expect } from '@playwright/test';

test.describe('element-library SSR + hydration', () => {
	test('the login button is server-rendered as Declarative Shadow DOM', async ({ request }) => {
		const html = await (await request.get('/login')).text();
		expect(html).toMatch(/<el-button[^>]*type="submit"[^>]*>\s*<template shadowrootmode="open">/);
	});

	test('the login button renders without JavaScript', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/login');
		await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
		await context.close();
	});

	test('the login button upgrades and hydrates on the client', async ({ page }) => {
		await page.goto('/login');
		const button = page.locator('el-button', { hasText: 'Login' });
		await expect(button).toBeVisible();
		await expect.poll(() => button.evaluate((el) => el.matches(':defined'))).toBe(true);
		// The hydrated shadow root still carries the server-rendered button.
		await expect(button.locator('button[part="base"]')).toHaveClass(/button--primary/);
	});
});
