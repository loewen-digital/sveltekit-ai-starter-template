import { test, expect } from '@playwright/test';

test('el-button server-renders as Declarative Shadow DOM and hydrates', async ({ page }) => {
	const response = await page.goto('/dev/ssr-proof');
	expect(response?.ok()).toBeTruthy();

	// Server output: the button's shadow content must already be in the raw
	// HTML (Declarative Shadow DOM), before any client JS runs.
	const html = await response?.text();
	expect(html).toContain('<template shadowrootmode="open">');
	expect(html).toContain('el-button');

	// Client hydration: after JS runs, the tag upgrades via customElements.define
	// and attaches a real shadow root (element-js does this on connect).
	await page.waitForFunction(() => !!window.customElements.get('el-button'));
	const button = page.locator('el-button');
	await expect.poll(() => button.evaluate((el) => el.shadowRoot !== null)).toBe(true);
	await expect(button.locator('button')).toBeVisible();
});
