import { test, expect } from '@playwright/test';

test.describe('Permission Management', () => {
  test.describe.configure({ mode: 'serial' });

  // Generate unique lowercase role name
  const generateRoleName = () => {
    const randomStr = Math.random()
      .toString(36)
      .substring(2, 10)
      .replace(/[0-9]/g, 'x');
    return `perm_${randomStr}`;
  };

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('e2e_admin_1768654269707');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page).toHaveURL(/dashboard|\/$/, { timeout: 10000 });
  });

  test('should display permission matrix on role form', async ({ page }) => {
    await page.goto('/settings/roles/create');

    // Wait for form to load
    await expect(page.getByLabel(/nama role/i)).toBeVisible();

    // Verify permission matrix header (use heading role to be specific)
    await expect(
      page.getByRole('heading', { name: 'Hak Akses' }),
    ).toBeVisible();

    // Verify permission matrix description
    await expect(
      page.getByText(/atur hak akses untuk role ini/i),
    ).toBeVisible();

    // Verify at least one module checkbox is visible
    await expect(page.locator('[id^="module-"]').first()).toBeVisible();
  });

  test('should select individual permission action', async ({ page }) => {
    await page.goto('/settings/roles/create');
    await expect(page.getByLabel(/nama role/i)).toBeVisible();

    // Find first accordion trigger and click to expand
    const firstAccordionTrigger = page
      .locator('[data-state="closed"]')
      .filter({ has: page.locator('svg') })
      .first();
    await firstAccordionTrigger.click();

    // Wait for accordion content to expand
    await page.waitForTimeout(300);

    // Find action checkboxes inside the expanded accordion content
    // Action checkboxes have ids like "module-action" e.g. "users-create"
    const actionCheckbox = page
      .locator('input[type="checkbox"][id*="-"]')
      .filter({ hasNot: page.locator('[id^="module-"]') })
      .first();

    // Check if we found a action checkbox (not module checkbox)
    const allCheckboxes = page.locator(
      'input[type="checkbox"]:not([id^="module-"])',
    );
    const count = await allCheckboxes.count();

    if (count > 0) {
      await allCheckboxes.first().click();
      // Verify counter updates (shows "1 / X akses" or similar)
      await expect(page.getByText(/\d+ \/ \d+ akses/)).toBeVisible();
    }
  });

  test('should toggle entire module permissions', async ({ page }) => {
    await page.goto('/settings/roles/create');
    await expect(page.getByLabel(/nama role/i)).toBeVisible();

    // Find module-level checkbox
    const moduleCheckbox = page.locator('[id^="module-"]').first();
    await expect(moduleCheckbox).toBeVisible();

    // Get initial count text
    const initialCount = await page.getByText(/0 \/ \d+ akses/).first();

    // Click to select all actions in module
    await moduleCheckbox.click();

    // Verify counter shows all selected (non-zero)
    await expect(page.getByText(/[1-9]\d* \/ \d+ akses/).first()).toBeVisible();

    // Click again to deselect all
    await moduleCheckbox.click();

    // Verify counter shows 0
    await expect(page.getByText(/0 \/ \d+ akses/).first()).toBeVisible();
  });

  test('should persist permissions when creating role', async ({ page }) => {
    const roleName = generateRoleName();

    // Navigate via list for proper router.back()
    await page.goto('/settings/roles');
    await page.getByRole('link', { name: /tambah peran/i }).click();
    await expect(page.getByLabel(/nama role/i)).toBeVisible();

    // Fill basic info
    await page.getByLabel(/nama role/i).fill(roleName);
    await page.getByLabel(/deskripsi/i).fill('Role with permissions');

    // Select a module's permissions using module checkbox
    const moduleCheckbox = page.locator('[id^="module-"]').first();
    await expect(moduleCheckbox).toBeVisible();
    await moduleCheckbox.click();

    // Submit
    await page.getByRole('button', { name: /buat role/i }).click();
    await expect(page).toHaveURL(/\/settings\/roles(?:\?|$)/, {
      timeout: 10000,
    });

    // Search for created role
    await page.getByPlaceholder(/cari role/i).fill(roleName);
    await expect(page.getByText(roleName, { exact: true })).toBeVisible();

    // Open edit page
    const row = page.getByRole('row', { name: roleName });
    await row.getByRole('button').last().click();
    await page.getByRole('menuitem', { name: /edit|ubah/i }).click();

    // Wait for form to load
    await expect(page.getByLabel(/nama role/i)).toBeVisible();

    // Verify the module checkbox is checked (permissions persisted)
    const savedModuleCheckbox = page.locator('[id^="module-"]').first();
    await expect(savedModuleCheckbox).toBeChecked();
  });
});
