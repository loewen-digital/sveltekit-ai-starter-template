import { test, expect } from '@playwright/test';
import { generateTestEmail, register, login } from '../helpers/auth';
import { navigateToProfile, changeEmail, changePassword } from '../helpers/profile';

const TEST_PASSWORD = 'testpassword123';

test.describe('Profile - Email Change', () => {
	let testEmail: string;

	test.beforeEach(async ({ page }) => {
		testEmail = generateTestEmail();
		await register(page, testEmail, TEST_PASSWORD);
	});

	test('change email with valid data shows success toast', async ({ page }) => {
		await navigateToProfile(page);
		const newEmail = generateTestEmail();
		await changeEmail(page, newEmail, TEST_PASSWORD);
		await expect(page.getByText('Email updated successfully')).toBeVisible();
	});

	test('change email with invalid email shows error', async ({ page }) => {
		await navigateToProfile(page);
		await changeEmail(page, 'invalid@test', TEST_PASSWORD);
		await expect(page.getByText('Invalid email')).toBeVisible();
	});

	test('change email with wrong password shows error', async ({ page }) => {
		await navigateToProfile(page);
		const newEmail = generateTestEmail();
		await changeEmail(page, newEmail, 'wrongpassword');
		await expect(page.getByText('Incorrect password')).toBeVisible();
	});
});

test.describe('Profile - Password Change', () => {
	let testEmail: string;

	test.beforeEach(async ({ page }) => {
		testEmail = generateTestEmail();
		await register(page, testEmail, TEST_PASSWORD);
	});

	test('change password with valid data shows success toast', async ({ page }) => {
		await navigateToProfile(page);
		const newPassword = 'newpassword456';
		await changePassword(page, TEST_PASSWORD, newPassword, newPassword);
		await expect(page.getByText('Password updated successfully')).toBeVisible();
	});

	test('change password with short password shows error', async ({ page }) => {
		await navigateToProfile(page);
		await changePassword(page, TEST_PASSWORD, 'short', 'short');
		await expect(page.getByText('at least 8 characters')).toBeVisible();
	});

	test('change password with mismatched confirmation shows error', async ({ page }) => {
		await navigateToProfile(page);
		await changePassword(page, TEST_PASSWORD, 'newpassword456', 'different789');
		await expect(page.getByText('do not match')).toBeVisible();
	});

	test('change password with wrong current password shows error', async ({ page }) => {
		await navigateToProfile(page);
		await changePassword(page, 'wrongpassword', 'newpassword456', 'newpassword456');
		await expect(page.getByText('Incorrect password')).toBeVisible();
	});

	test('can login with new password after change', async ({ page }) => {
		await navigateToProfile(page);
		const newPassword = 'newpassword456';
		await changePassword(page, TEST_PASSWORD, newPassword, newPassword);
		await expect(page.getByText('Password updated successfully')).toBeVisible();

		// Logout and login with new password
		await page.getByRole('button', { name: 'Logout' }).click();
		await page.waitForURL('/login');
		await login(page, testEmail, newPassword);
		await expect(page).toHaveURL('/');
	});
});
