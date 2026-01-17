import { test, expect } from '@playwright/test';

test.describe('Roles CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  // Generate unique lowercase role name
  const generateRoleName = () => {
    const randomStr = Math.random()
      .toString(36)
      .substring(2, 10)
      .replace(/[0-9]/g, 'x');
    return `test_${randomStr}`;
  };

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('e2e_admin_1768654269707');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page).toHaveURL(/dashboard|\/$/, { timeout: 10000 });
  });

  test('should display roles list page', async ({ page }) => {
    await page.goto('/settings/roles');

    // Verify page header
    await expect(
      page.getByRole('heading', { name: /peran & akses/i }),
    ).toBeVisible();

    // Verify "Tambah Peran" button
    await expect(
      page.getByRole('link', { name: /tambah peran/i }),
    ).toBeVisible();

    // Verify table card
    await expect(
      page.getByRole('heading', { name: /daftar peran/i }),
    ).toBeVisible();
  });

  test('should create a new role', async ({ page }) => {
    const roleName = generateRoleName();
    const description = 'Test Role Description';

    // Navigate via list for proper router.back()
    await page.goto('/settings/roles');
    await page.getByRole('link', { name: /tambah peran/i }).click();
    await expect(page).toHaveURL(/\/settings\/roles\/create/);

    // Wait for form to be ready (permissions need to load)
    await expect(page.getByLabel(/nama role/i)).toBeVisible();

    // Fill form (name must be lowercase letters and underscores only)
    await page.getByLabel(/nama role/i).fill(roleName);
    await page.getByLabel(/deskripsi/i).fill(description);

    // Submit and wait for redirect
    await page.getByRole('button', { name: /buat role/i }).click();

    // Wait for navigation back to list
    await expect(page).toHaveURL(/\/settings\/roles(?:\?|$)/, {
      timeout: 10000,
    });

    // Verify role was created by searching
    await page.getByPlaceholder(/cari role/i).fill(roleName);
    await expect(page.getByText(roleName, { exact: true })).toBeVisible();
  });

  test('should filter and search roles', async ({ page }) => {
    await page.goto('/settings/roles');

    // Test Search
    const searchInput = page.getByPlaceholder(/cari role/i);
    await searchInput.fill('admin');
    await expect(page.getByText(/admin/i)).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Test Filter by Role Type - Custom Role
    // The select trigger shows the selected value, default is "Semua Role"
    const typeTrigger = page.locator('button', { hasText: 'Semua Role' });
    await typeTrigger.click();
    await page.getByRole('option', { name: /custom/i }).click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Reset filter - now shows "Custom Role"
    const customTrigger = page.locator('button', { hasText: 'Custom Role' });
    await customTrigger.click();
    await page.getByRole('option', { name: /semua/i }).click();
  });

  test('should update a role', async ({ page }) => {
    const roleName = generateRoleName();
    const description = 'Role to update';

    // 1. Create Role via list
    await page.goto('/settings/roles');
    await page.getByRole('link', { name: /tambah peran/i }).click();
    await expect(page.getByLabel(/nama role/i)).toBeVisible();
    await page.getByLabel(/nama role/i).fill(roleName);
    await page.getByLabel(/deskripsi/i).fill(description);
    await page.getByRole('button', { name: /buat role/i }).click();
    await expect(page).toHaveURL(/\/settings\/roles(?:\?|$)/, {
      timeout: 10000,
    });

    // 2. Search for the role
    await page.getByPlaceholder(/cari role/i).fill(roleName);
    await expect(page.getByText(roleName, { exact: true })).toBeVisible();

    // 3. Open edit page via actions menu
    const row = page.getByRole('row', { name: roleName });
    await row.getByRole('button').last().click();
    await page.getByRole('menuitem', { name: /edit|ubah/i }).click();

    // Wait for form to load
    await expect(page.getByLabel(/deskripsi/i)).toBeVisible();

    // 4. Update description
    const updatedDescription = `${description} - Updated`;
    await page.getByLabel(/deskripsi/i).fill(updatedDescription);
    await page.getByRole('button', { name: /simpan/i }).click();

    // 5. Verify redirect
    await expect(page).toHaveURL(/\/settings\/roles/, { timeout: 10000 });
  });

  test('should delete a role', async ({ page }) => {
    const roleName = generateRoleName();
    const description = 'Role to delete';

    // 1. Create Role
    await page.goto('/settings/roles');
    await page.getByRole('link', { name: /tambah peran/i }).click();
    await expect(page.getByLabel(/nama role/i)).toBeVisible();
    await page.getByLabel(/nama role/i).fill(roleName);
    await page.getByLabel(/deskripsi/i).fill(description);
    await page.getByRole('button', { name: /buat role/i }).click();
    await expect(page).toHaveURL(/\/settings\/roles(?:\?|$)/, {
      timeout: 10000,
    });

    // 2. Search for the role
    await page.getByPlaceholder(/cari role/i).fill(roleName);
    await expect(page.getByText(roleName, { exact: true })).toBeVisible();

    // 3. Delete via actions menu
    const row = page.getByRole('row', { name: roleName });
    await row.getByRole('button').last().click();
    await page.getByRole('menuitem', { name: /hapus|delete/i }).click();

    // 4. Confirm dialog
    await page.getByRole('button', { name: /hapus/i }).last().click();

    // 5. Verify deleted - role no longer visible
    await page.waitForTimeout(500);
    await expect(page.getByText(roleName, { exact: true })).not.toBeVisible();
  });
});
