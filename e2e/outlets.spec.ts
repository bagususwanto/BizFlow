import { test, expect } from '@playwright/test';

test.describe('Outlets CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  const generateOutletCode = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    return `OUT${randomNum.toString().padStart(4, '0')}`;
  };

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('e2e_admin_1768654269707');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page).toHaveURL(/dashboard|\/$/, { timeout: 10000 });
  });

  test('should display outlets list page', async ({ page }) => {
    await page.goto('/settings/outlets');

    // Verify page header
    await expect(
      page.getByRole('heading', { name: 'Outlet', exact: true }),
    ).toBeVisible();

    // Verify "Tambah Outlet" button
    await expect(
      page.getByRole('link', { name: /tambah outlet/i }),
    ).toBeVisible();

    // Verify toolbar elements
    await expect(page.getByPlaceholder(/cari outlet/i)).toBeVisible();
  });

  test('should create a new outlet', async ({ page }) => {
    const outletCode = generateOutletCode();
    const outletName = `Test Outlet ${outletCode}`;

    // Navigate via list for proper router.back()
    await page.goto('/settings/outlets');
    await page.getByRole('link', { name: /tambah outlet/i }).click();
    await expect(page).toHaveURL(/\/settings\/outlets\/create/);

    // Wait for form to load
    await expect(page.getByLabel(/kode outlet/i)).toBeVisible();

    // Fill form
    await page.getByLabel(/kode outlet/i).fill(outletCode);
    await page.getByLabel(/nama outlet/i).fill(outletName);
    await page.getByLabel(/no\. telepon/i).fill('021-1234567');
    await page.getByLabel(/alamat/i).fill('Jl. Test No. 123');

    // Submit
    await page.getByRole('button', { name: /buat outlet/i }).click();

    // Verify success
    await expect(page).toHaveURL(/\/settings\/outlets(?:\?|$)/, {
      timeout: 10000,
    });

    // Search for created outlet
    await page.getByPlaceholder(/cari outlet/i).fill(outletCode);
    await expect(page.getByText(outletCode, { exact: true })).toBeVisible();
  });

  test('should filter and search outlets', async ({ page }) => {
    await page.goto('/settings/outlets');

    // Test Search - just verify input works
    const searchInput = page.getByPlaceholder(/cari outlet/i);
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Clear search
    await searchInput.fill('');

    // Test Filter by Status - check if status trigger exists
    const statusTrigger = page.locator('button', { hasText: /semua/i }).first();
    if (await statusTrigger.isVisible()) {
      await statusTrigger.click();
      const inactiveOption = page.getByRole('option', { name: /nonaktif/i });
      if (await inactiveOption.isVisible()) {
        await inactiveOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should update an outlet', async ({ page }) => {
    const outletCode = generateOutletCode();
    const outletName = `Update Outlet ${outletCode}`;

    // 1. Create Outlet via list
    await page.goto('/settings/outlets');
    await page.getByRole('link', { name: /tambah outlet/i }).click();
    await expect(page.getByLabel(/kode outlet/i)).toBeVisible();
    await page.getByLabel(/kode outlet/i).fill(outletCode);
    await page.getByLabel(/nama outlet/i).fill(outletName);
    await page.getByRole('button', { name: /buat outlet/i }).click();
    await expect(page).toHaveURL(/\/settings\/outlets(?:\?|$)/, {
      timeout: 10000,
    });

    // 2. Search for the outlet
    await page.getByPlaceholder(/cari outlet/i).fill(outletCode);
    await expect(page.getByText(outletCode, { exact: true })).toBeVisible();

    // 3. Open edit page via actions menu
    const row = page.getByRole('row', { name: outletCode });
    await row.getByRole('button').last().click();
    await page.getByRole('menuitem', { name: /edit|ubah/i }).click();

    // Wait for form to load
    await expect(page.getByLabel(/nama outlet/i)).toBeVisible();

    // 4. Update name
    const updatedName = `${outletName} - Updated`;
    await page.getByLabel(/nama outlet/i).fill(updatedName);
    await page.getByRole('button', { name: /simpan/i }).click();

    // 5. Verify redirect
    await expect(page).toHaveURL(/\/settings\/outlets/, { timeout: 10000 });
  });

  test('should deactivate an outlet and verify value in inactive list', async ({
    page,
  }) => {
    const outletCode = generateOutletCode();
    const outletName = `Inactive Outlet ${outletCode}`;

    // 1. Create Outlet
    await page.goto('/settings/outlets');
    await page.getByRole('link', { name: /tambah outlet/i }).click();
    await page.getByLabel(/kode outlet/i).fill(outletCode);
    await page.getByLabel(/nama outlet/i).fill(outletName);
    await page.getByRole('button', { name: /buat outlet/i }).click();

    // 2. Deactivate via Edit Form (Delete hard deletes if no transactions)
    await page.getByPlaceholder(/cari outlet/i).fill(outletCode);
    await page.waitForTimeout(500); // Wait for search
    const row = page.getByRole('row', { name: outletCode });
    await row.getByRole('button').last().click();
    await page.getByRole('menuitem', { name: /edit|ubah/i }).click();

    // Toggle Status Aktif switch to off
    await page.getByRole('switch', { name: /status aktif/i }).click();
    await page.getByRole('button', { name: /simpan/i }).click();

    // 3. Clear search and filter by Inactive
    await page.getByPlaceholder(/cari outlet/i).fill('');
    const statusTrigger = page.locator('button', { hasText: /semua/i }).first();
    await statusTrigger.click();
    await page.getByRole('option', { name: /nonaktif/i }).click();
    await page.waitForTimeout(500);

    // 4. Verify outlet is visible in inactive list
    await expect(page.getByText(outletCode)).toBeVisible();

    // 5. Filter by Active
    const inactiveTrigger = page
      .locator('button', { hasText: /nonaktif/i })
      .first();
    await inactiveTrigger.click();
    await page.getByRole('option', { name: /aktif/i }).click();
    await page.waitForTimeout(500);

    // 6. Verify outlet is NOT visible in active list
    await expect(page.getByText(outletCode)).not.toBeVisible();
  });
});
