import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/login', '/register']) {
	test(`${path} has no axe violations`, async ({ page }) => {
		await page.goto(path);
		// Audit the hydrated page: axe walks the upgraded elements' shadow roots.
		await expect
			.poll(() =>
				page
					.locator('el-button')
					.first()
					.evaluate((el) => el.matches(':defined'))
			)
			.toBe(true);
		const { violations } = await new AxeBuilder({ page }).analyze();
		expect(
			violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
		).toEqual([]);
	});
}
