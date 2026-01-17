import { test, expect } from '@playwright/test';

test.describe('Multi-outlet Assignment', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('e2e_admin_1768654269707');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page).toHaveURL(/dashboard|\/$/, { timeout: 10000 });
  });

  test('should display outlet assignment field on user form', async ({
    page,
  }) => {
    await page.goto('/settings/users/create');

    // Verify the outlet assignment field is visible
    await expect(page.getByText('Assign ke Outlet')).toBeVisible();

    // Verify the MultiSelect placeholder is visible
    await expect(page.getByPlaceholder(/pilih outlet/i)).toBeVisible();
  });

  test('should assign outlet to user during creation', async ({ page }) => {
    const timestamp = Date.now();
    const testUsername = `outlet_user_${timestamp}`;

    // Navigate to users list first (so router.back() works correctly)
    await page.goto('/settings/users');
    await page.getByRole('link', { name: /tambah pengguna/i }).click();
    await expect(page).toHaveURL(/\/settings\/users\/create/);

    // Fill user basic info
    await page.getByLabel(/username/i).fill(testUsername);
    await page
      .getByLabel(/nama lengkap/i)
      .fill(`Outlet Test User ${timestamp}`);

    // Select role
    await page.getByRole('combobox', { name: /role/i }).click();
    await page.getByRole('option').first().click();

    // Fill password
    await page.getByLabel(/^password$/i).fill('Password123');

    // Click on the multi-select to focus and show options
    const outletSelect = page.getByPlaceholder(/pilih outlet/i);
    await outletSelect.click();

    // Wait for options to appear and select the first outlet
    const firstOption = page.getByRole('option').first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    // Wait for state to update
    await page.waitForTimeout(300);

    // Submit the form
    await page.getByRole('button', { name: /buat user/i }).click();

    // Verify success - router.back() goes to users list
    await expect(page).toHaveURL(/\/settings\/users$/);
    await expect(page.getByText('User berhasil dibuat').first()).toBeVisible();

    // Verify user was created by searching
    await page.getByPlaceholder(/cari user/i).fill(testUsername);
    await expect(page.getByText(testUsername, { exact: true })).toBeVisible();
  });

  test('should assign multiple outlets to user', async ({ page }) => {
    const timestamp = Date.now();
    const testUsername = `multi_outlet_${timestamp}`;

    // Navigate via users list
    await page.goto('/settings/users');
    await page.getByRole('link', { name: /tambah pengguna/i }).click();

    // Fill user basic info
    await page.getByLabel(/username/i).fill(testUsername);
    await page
      .getByLabel(/nama lengkap/i)
      .fill(`Multi Outlet User ${timestamp}`);

    // Select role
    await page.getByRole('combobox', { name: /role/i }).click();
    await page.getByRole('option').first().click();

    // Fill password
    await page.getByLabel(/^password$/i).fill('Password123');

    // Select first outlet
    const outletSelect = page.getByPlaceholder(/pilih outlet/i);
    await outletSelect.click();
    await page.getByRole('option').first().click();

    // Try to select second outlet (if available)
    await outletSelect.click();
    const secondOption = page.getByRole('option').first();
    const hasSecond = await secondOption.isVisible();
    if (hasSecond) {
      await secondOption.click();
    }

    // Submit form
    await page.getByRole('button', { name: /buat user/i }).click();

    // Verify success
    await expect(page).toHaveURL(/\/settings\/users$/);
    await expect(page.getByText('User berhasil dibuat').first()).toBeVisible();
  });

  test('should remove outlet from selection using backspace', async ({
    page,
  }) => {
    await page.goto('/settings/users/create');

    // Click on the multi-select
    const outletSelect = page.getByPlaceholder(/pilih outlet/i);
    await outletSelect.click();

    // Select first outlet
    await page.getByRole('option').first().click();

    // Focus input and press backspace to remove last selected item
    await outletSelect.click();
    await outletSelect.press('Backspace');

    // Now click and verify options are available again (first outlet should be back)
    await outletSelect.click();
    await expect(page.getByRole('option').first()).toBeVisible();
  });

  test('should persist outlets when editing user', async ({ page }) => {
    const timestamp = Date.now();
    const testUsername = `persist_outlet_${timestamp}`;

    // 1. Create user with outlet - navigate via list for proper back behavior
    await page.goto('/settings/users');
    await page.getByRole('link', { name: /tambah pengguna/i }).click();

    await page.getByLabel(/username/i).fill(testUsername);
    await page
      .getByLabel(/nama lengkap/i)
      .fill(`Persist Outlet User ${timestamp}`);

    await page.getByRole('combobox', { name: /role/i }).click();
    await page.getByRole('option').first().click();

    await page.getByLabel(/^password$/i).fill('Password123');

    // Select outlet and remember the name
    const outletSelect = page.getByPlaceholder(/pilih outlet/i);
    await outletSelect.click();
    const firstOption = page.getByRole('option').first();
    const outletName = await firstOption.textContent();
    await firstOption.click();

    await page.getByRole('button', { name: /buat user/i }).click();
    await expect(page).toHaveURL(/\/settings\/users$/);

    // 2. Search for the created user
    await page.getByPlaceholder(/cari user/i).fill(testUsername);
    await expect(page.getByText(testUsername, { exact: true })).toBeVisible();

    // 3. Open edit page
    const row = page.getByRole('row', { name: testUsername });
    await row.getByRole('button').last().click();
    await page.getByRole('menuitem', { name: /edit|ubah/i }).click();

    // 4. Verify the outlet name is visible on the page (as badge)
    if (outletName) {
      // The outlet name should appear on the edit form as a selected badge
      await expect(page.getByText(outletName.trim())).toBeVisible();
    }

    // 5. Verify we can save without changes
    await page.getByRole('button', { name: /simpan/i }).click();
    await expect(page).toHaveURL(/\/settings\/users/);
  });
});
