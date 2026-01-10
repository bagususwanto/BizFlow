import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be loaded
    await expect(page).toHaveTitle(/BizFlow/i);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that page loads correctly on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});
