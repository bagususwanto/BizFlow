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
      page.getByRole('heading', { name: 'Kategori', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Tambah Kategori' }),
    ).toBeVisible();
    // Verify seeded categories exist
    await expect(
      page.locator('span.font-medium').getByText('Umum', { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator('span.font-medium').getByText('Elektronik', { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator('span.font-medium')
        .getByText('Makanan & Minuman', { exact: true }),
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
    await page.click('button[role="combobox"]'); // Assuming Select component uses this
    // Select 'Umum' as parent
    await page.click('div[role="option"]:has-text("Umum")');

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
    // Target the 'Umum' category
    const row = page.getByRole('row').filter({ hasText: 'Umum' });
    await row.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    await expect(page.url()).toContain('/edit');

    const newDescription = `Updated desc ${Date.now()}`;
    await page.fill('textarea[name="description"]', newDescription);
    await page.click('button[type="submit"]');

    await page.waitForURL('/master-data/categories');
    await expect(page.getByText('Kategori berhasil diperbarui')).toBeVisible();

    // Verify description updated (might need to expand row or check detail)
    // For now just success toast is good indication
  });

  test('should delete a category', async ({ page }) => {
    // Create a temp category to delete
    await page.getByRole('link', { name: 'Tambah Kategori' }).click();
    const tempName = `To Delete ${Date.now()}`;
    await page.fill('input[name="name"]', tempName);
    await page.click('button[type="submit"]');
    await page.waitForURL('/master-data/categories');

    // Find and delete it
    await page.fill('input[placeholder*="Cari"]', tempName);
    await page.waitForTimeout(500); // Wait for debounce

    const row = page.getByRole('row').filter({ hasText: tempName });
    await row.getByRole('button', { name: 'Open menu' }).click();

    // Make sure to handle potential confirmation dialog
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('menuitem', { name: 'Hapus' }).click();

    await expect(page.getByText('Kategori berhasil dihapus')).toBeVisible();
    await expect(page.getByText(tempName)).not.toBeVisible();
  });
});
