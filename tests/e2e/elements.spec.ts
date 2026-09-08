import { test, expect } from '@playwright/test';

test.describe('element-library SSR + hydration', () => {
	test('el-button is server-rendered as Declarative Shadow DOM', async ({ request }) => {
		const html = await (await request.get('/design')).text();
		expect(html).toMatch(
			/<el-button[^>]*variant="primary"[^>]*>\s*<template shadowrootmode="open">/
		);
	});

	test('el-button renders without JavaScript', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/design');
		await expect(page.getByRole('button', { name: 'Primary' })).toBeVisible();
		await context.close();
	});

	test('el-button upgrades and hydrates on the client', async ({ page }) => {
		await page.goto('/design');
		const button = page.locator('el-button', { hasText: 'Primary' });
		await expect(button).toBeVisible();
		await expect.poll(() => button.evaluate((el) => el.matches(':defined'))).toBe(true);
		// The hydrated shadow root still carries the server-rendered button.
		await expect(button.locator('button[part="base"]')).toHaveClass(/button--primary/);
	});
});
