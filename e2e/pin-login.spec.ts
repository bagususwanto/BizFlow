import { test, expect } from '@playwright/test';

test.describe('PIN Login', () => {
  test('should allow switching between password and PIN login modes', async ({
    page,
  }) => {
    await page.goto('/login');

    // Default should be password login
    await expect(page.getByLabel(/^username$/i)).toBeVisible();

    // Switch to PIN login
    await page.getByRole('button', { name: /login dengan pin/i }).click();

    // Should show user selection (or empty state if no users)
    await expect(page.getByText(/pilih akun/i)).toBeVisible();
    await expect(page.getByLabel(/^username$/i)).not.toBeVisible();

    // Switch back to password login
    await page
      .getByRole('button', { name: /kembali ke login password/i })
      .click();
    await expect(page.getByLabel(/^username$/i)).toBeVisible();
  });

  // Note: This test assumes there might be users. If not, it just checks the empty state text
  test('should display user selection grid', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /login dengan pin/i }).click();

    // Check for either the grid or the empty message
    const hasUsers = (await page.locator('.grid').count()) > 0;
    const hasEmptyMessage =
      (await page.getByText(/tidak ada user/i).count()) > 0;

    expect(hasUsers || hasEmptyMessage).toBeTruthy();
  });
});
