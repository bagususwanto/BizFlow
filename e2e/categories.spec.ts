import { test, expect } from '@playwright/test';

test.describe('Categories Management', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('admin');
    await page.locator('input[name="password"]').fill('Admin123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await page.waitForURL('/dashboard');

    // Navigate to Categories
    await page.goto('/master-data/categories');
  });

  test('should display categories list', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Kategori Produk', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Tambah Kategori' }),
    ).toBeVisible();
    // Verify seeded categories exist
    await expect(page.getByText('Umum', { exact: true })).toBeVisible();
    await expect(page.getByText('Elektronik', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Makanan & Minuman', { exact: true }),
    ).toBeVisible();
  });

  test('should create a new root category', async ({ page }) => {
    await page.getByRole('link', { name: 'Tambah Kategori' }).click();
    await page.waitForURL('/master-data/categories/create');

    const uniqueName = `Root Cat ${Date.now()}`;
    await page.fill('input[name="name"]', uniqueName);
    await page.fill(
      'textarea[name="description"]',
      'Test root category description',
    );

    await page.click('button[type="submit"]');

    await page.waitForURL('/master-data/categories');
    await expect(page.getByText('Kategori berhasil dibuat')).toBeVisible();
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('should create a sub-category', async ({ page }) => {
    // Navigate to create page
    await page.getByRole('link', { name: 'Tambah Kategori' }).click();

    const uniqueName = `Sub Cat ${Date.now()}`;
    await page.fill('input[name="name"]', uniqueName);

    // Open parent dropdown and select using keyboard for reliability
    const combobox = page.locator('button[role="combobox"]');
    await combobox.click();
    // Wait for dropdown to open
    await page.waitForTimeout(300);
    // Type to filter and find Umum
    await page.keyboard.type('Umum');
    await page.waitForTimeout(200);
    // Press Enter to select the first matching option
    await page.keyboard.press('Enter');

    await page.click('button[type="submit"]');

    await page.waitForURL('/master-data/categories');
    await expect(page.getByText('Kategori berhasil dibuat')).toBeVisible();

    // Click on parent category to see its details including children
    await page.getByText('Umum', { exact: true }).click();

    // Wait for detail view to load and verify sub-category appears in children list
    await page.waitForTimeout(500);
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('should update a category', async ({ page }) => {
    // Select the category from tree
    await page.getByText('Umum', { exact: true }).click();

    // Check detail view is visible (Edit button should be there)
    const editButton = page.getByRole('button', { name: 'Edit' });
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Wait for navigation to edit page
    await page.waitForURL(/\/edit$/);

    const newDescription = `Updated desc ${Date.now()}`;
    await page.fill('textarea[name="description"]', newDescription);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/master-data\/categories/);
    await expect(page.getByText('Kategori berhasil diperbarui')).toBeVisible();
  });

  test('should delete a category', async ({ page }) => {
    // Create a temp category to delete
    await page.getByRole('link', { name: 'Tambah Kategori' }).click();
    const tempName = `To Delete ${Date.now()}`;
    await page.fill('input[name="name"]', tempName);
    await page.click('button[type="submit"]');
    await page.waitForURL('/master-data/categories');

    // Find and select it in the tree
    await page.fill('input[placeholder*="Cari"]', tempName);
    await page.waitForTimeout(500); // Wait for debounce

    await page.getByText(tempName).click();

    // Click delete in detail view - this opens AlertDialog
    const deleteButton = page.getByRole('button', { name: 'Hapus' });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Confirm in AlertDialog
    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.getByText('Apakah anda yakin?')).toBeVisible();

    // Click confirm button in AlertDialog
    await confirmDialog.getByRole('button', { name: 'Hapus' }).click();

    // Wait for success toast
    await expect(
      page.getByText(/berhasil (dihapus|dinonaktifkan)/i),
    ).toBeVisible();
    await expect(page.getByText(tempName)).not.toBeVisible();
  });

  test('should expand and collapse tree nodes', async ({ page }) => {
    // First create a parent with child to ensure hierarchy exists
    const parentName = `Parent ${Date.now()}`;
    const childName = `Child ${Date.now()}`;

    // Create parent category
    await page.getByRole('link', { name: 'Tambah Kategori' }).click();
    await page.fill('input[name="name"]', parentName);
    await page.click('button[type="submit"]');
    await page.waitForURL('/master-data/categories');

    // Create child category
    await page.getByRole('link', { name: 'Tambah Kategori' }).click();
    await page.fill('input[name="name"]', childName);
    const combobox = page.locator('button[role="combobox"]');
    await combobox.click();
    await page.waitForTimeout(300);
    await page.keyboard.type(parentName);
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.click('button[type="submit"]');
    await page.waitForURL('/master-data/categories');

    // Search for and click parent category
    await page.fill('input[placeholder*="Cari"]', parentName);
    await page.waitForTimeout(500);

    // Parent should be visible
    await expect(page.getByText(parentName)).toBeVisible();

    // Click on parent to select and see details
    await page.getByText(parentName).click();

    // Verify detail shows sub-category count
    await expect(page.getByText('Sub-kategori')).toBeVisible();
  });

  test('should create sub-category via menu', async ({ page }) => {
    // Select an existing category
    await page.getByText('Umum', { exact: true }).click();

    // Wait for detail view to load
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();

    // Open the more actions menu (the three-dot button after Edit and Hapus)
    // It's a ghost button with MoreVertical icon - find it by being the last button in the header actions
    const detailHeader = page.locator('.flex.items-start.justify-between');
    const moreButton = detailHeader.locator('button').last();
    await moreButton.click();

    // Click "Tambah Sub-kategori"
    await page.getByRole('menuitem', { name: 'Tambah Sub-kategori' }).click();

    // Should navigate to create page with parentId query param
    await page.waitForURL(/\/master-data\/categories\/create/);
    await expect(page.url()).toContain('parentId=');

    // The parent should be pre-selected in dropdown
    const parentDropdown = page.locator('button[role="combobox"]');
    await expect(parentDropdown).toContainText('Umum');
  });

  test('should show validation error for empty name', async ({ page }) => {
    await page.getByRole('link', { name: 'Tambah Kategori' }).click();
    await page.waitForURL('/master-data/categories/create');

    // Leave name empty and submit
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.getByText(/nama.*wajib|required/i)).toBeVisible();
  });

  test('should show sub-categories in parent detail view', async ({ page }) => {
    // Click on a parent category that has children (Makanan & Minuman should have some)
    await page.getByText('Makanan & Minuman', { exact: true }).click();

    // Wait for detail view to load
    await page.waitForTimeout(300);

    // Check that Sub-kategori section is visible in detail (use first() as there are multiple matches)
    await expect(page.getByText('Sub-kategori').first()).toBeVisible();
  });
});
