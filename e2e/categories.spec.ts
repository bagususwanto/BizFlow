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

    // Open parent dropdown
    await page.click('button[role="combobox"]');
    // Select 'Umum' as parent
    const umumOption = page.getByRole('option', { name: 'Umum' });
    await expect(umumOption).toBeVisible();
    await umumOption.scrollIntoViewIfNeeded();
    await umumOption.click({ force: true });

    await page.click('button[type="submit"]');

    await page.waitForURL('/master-data/categories');
    await expect(page.getByText('Kategori berhasil dibuat')).toBeVisible();

    // Expand 'Umum' to see subcategory if it's tree view, checking if it renders
    // Note: Depends on how tree expansion is handled.
    // If flattened search works, we can just search for it.
    await page.fill('input[placeholder*="Cari"]', uniqueName);
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('should update a category', async ({ page }) => {
    // Select the category from tree
    await page.getByText('Umum', { exact: true }).click();

    // Check detail view is visible (Edit button should be there)
    const editButton = page.getByRole('button', { name: 'Edit' });
    await expect(editButton).toBeVisible();
    await editButton.click();

    await expect(page.url()).toContain('/edit');

    const newDescription = `Updated desc ${Date.now()}`;
    await page.fill('textarea[name="description"]', newDescription);
    await page.click('button[type="submit"]');

    await page.waitForURL('/master-data/categories');
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
    // We might need to filter or scroll, but for now assuming it's visible or searchable
    await page.fill('input[placeholder*="Cari"]', tempName);
    await page.waitForTimeout(500); // Wait for debounce

    await page.getByText(tempName).click();

    // Click delete in detail view
    const deleteButton = page.getByRole('button', { name: 'Hapus' });
    await expect(deleteButton).toBeVisible();

    // Setup dialog handler
    page.once('dialog', (dialog) => dialog.accept());
    await deleteButton.click();

    await expect(
      page.getByText('Kategori berhasil dihapus/dinonaktifkan'),
    ).toBeVisible();
    await expect(page.getByText(tempName)).not.toBeVisible();
  });
});
