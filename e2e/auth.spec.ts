import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');

    // Check login form elements
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByPlaceholder(/username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /login|masuk/i }),
    ).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder(/username/i).fill('invalid');
    await page.getByPlaceholder(/password/i).fill('invalid');
    await page.getByRole('button', { name: /login|masuk/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid|salah|gagal/i)).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder(/username/i).fill('admin');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /login|masuk/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard|\/$/);
  });
});
