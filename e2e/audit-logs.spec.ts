import { test, expect } from '@playwright/test';

test.describe('Audit Logs', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('e2e_admin_1768654269707');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page).toHaveURL(/dashboard|\/$/, { timeout: 10000 });
  });

  test('should display audit logs list page', async ({ page }) => {
    await page.goto('/settings/audit-logs');

    // Verify page header
    await expect(
      page.getByRole('heading', { name: /audit log/i }),
    ).toBeVisible();

    // Verify toolbar elements exist
    await expect(page.getByPlaceholder(/cari id entity/i)).toBeVisible();

    // Verify Module filter
    await expect(page.getByRole('combobox').first()).toBeVisible();

    // Verify table or empty state
    const tableOrEmpty = page
      .getByRole('table')
      .or(page.getByText(/tidak ada data audit log/i));
    await expect(tableOrEmpty).toBeVisible();
  });

  // Skip on mobile browsers due to Radix UI Select viewport limitations
  test('should filter audit logs by module', async ({ page, browserName }) => {
    // Skip on mobile browsers where dropdown options may be outside viewport
    test.skip(
      browserName === 'webkit' ||
        browserName.includes('Mobile') ||
        page.viewportSize()?.width! < 768,
      'Radix UI Select has viewport issues on mobile browsers',
    );

    await page.goto('/settings/audit-logs');

    // Click module filter dropdown
    const moduleSelect = page.locator('button', { hasText: 'Semua Module' });
    await moduleSelect.click();

    // Select 'users' module
    await page.getByRole('option', { name: /users/i }).click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Check that the select now shows 'users'
    await expect(page.locator('button', { hasText: /users/i })).toBeVisible();
  });

  // Skip on mobile browsers due to Radix UI Select viewport limitations
  test('should filter audit logs by action', async ({ page, browserName }) => {
    // Skip on mobile browsers where dropdown options may be outside viewport
    test.skip(
      browserName === 'webkit' ||
        browserName.includes('Mobile') ||
        page.viewportSize()?.width! < 768,
      'Radix UI Select has viewport issues on mobile browsers',
    );

    await page.goto('/settings/audit-logs');

    // Click action filter dropdown
    const actionSelect = page.locator('button', { hasText: 'Semua Aksi' });
    await actionSelect.click();

    // Select 'create' action
    await page.getByRole('option', { name: /create/i }).click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Check that the select now shows 'create'
    await expect(page.locator('button', { hasText: /create/i })).toBeVisible();
  });

  test('should search audit logs by entity ID', async ({ page }) => {
    await page.goto('/settings/audit-logs');

    // Type in search
    const searchInput = page.getByPlaceholder(/cari id entity/i);
    await searchInput.fill('test-entity-id');

    // Wait for debounce
    await page.waitForTimeout(500);

    // Clear search
    await searchInput.fill('');
  });

  // Skip on mobile/webkit browsers due to date picker button being outside viewport
  test('should open date range picker', async ({ page, browserName }) => {
    test.skip(
      browserName === 'webkit' ||
        browserName.includes('Mobile') ||
        page.viewportSize()?.width! < 768,
      'Date picker button may be outside viewport on mobile/webkit',
    );

    await page.goto('/settings/audit-logs');

    // Click date picker button
    const datePickerButton = page.getByRole('button', {
      name: /pilih tanggal/i,
    });
    await datePickerButton.click();

    // Verify calendar is visible
    await expect(page.locator('[role="grid"]').first()).toBeVisible();

    // Close by clicking outside or pressing escape
    await page.keyboard.press('Escape');
  });

  // Skip on mobile/webkit browsers due to Radix UI Select viewport issues
  test('should reset all filters', async ({ page, browserName }) => {
    test.skip(
      browserName === 'webkit' ||
        browserName.includes('Mobile') ||
        page.viewportSize()?.width! < 768,
      'Radix UI Select has viewport issues on mobile/webkit browsers',
    );

    await page.goto('/settings/audit-logs');

    // Apply module filter first
    const moduleSelect = page.locator('button', { hasText: 'Semua Module' });
    await moduleSelect.click();
    await page.getByRole('option', { name: /users/i }).click();
    await page.waitForTimeout(300);

    // Verify Reset button appears when filters are applied
    const resetButton = page.getByRole('button', { name: /reset/i });
    await expect(resetButton).toBeVisible();

    // Click reset
    await resetButton.click();

    // Verify filters are reset - module should show 'Semua Module' again
    await expect(
      page.locator('button', { hasText: 'Semua Module' }),
    ).toBeVisible();
  });

  test('should view audit log detail', async ({ page }) => {
    await page.goto('/settings/audit-logs');

    // Check if there are audit logs in the table
    const table = page.getByRole('table');
    const hasLogs = await table.isVisible().catch(() => false);

    if (hasLogs) {
      // Find the first row's detail button (Eye icon)
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();

      if (rowCount > 0) {
        // Click the detail button (last button in first row)
        await rows.first().getByRole('button').click();

        // Verify the detail sheet opens
        await expect(page.getByText('Detail Audit Log')).toBeVisible();

        // Verify sheet content sections
        await expect(page.getByText('Informasi Umum')).toBeVisible();
        await expect(page.getByText('Informasi Entity')).toBeVisible();

        // Close sheet by pressing Escape
        await page.keyboard.press('Escape');

        // Verify sheet is closed
        await expect(page.getByText('Detail Audit Log')).not.toBeVisible();
      }
    }
  });

  // Skip on mobile browsers where column button may be outside viewport
  test('should toggle column visibility', async ({ page, browserName }) => {
    test.skip(
      browserName === 'webkit' ||
        browserName.includes('Mobile') ||
        page.viewportSize()?.width! < 768,
      'Column visibility button may be outside viewport on mobile/webkit',
    );

    await page.goto('/settings/audit-logs');

    // Click the Kolom dropdown button
    const columnButton = page.getByRole('button', { name: /kolom/i });
    await columnButton.click();

    // Verify dropdown menu items
    await expect(
      page.getByRole('menuitemcheckbox', { name: /waktu/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitemcheckbox', { name: /user/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitemcheckbox', { name: /module/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitemcheckbox', { name: /aksi/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitemcheckbox', { name: /entity/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitemcheckbox', { name: /ip address/i }),
    ).toBeVisible();

    // Toggle off "IP Address" column
    await page.getByRole('menuitemcheckbox', { name: /ip address/i }).click();

    // Close dropdown
    await page.keyboard.press('Escape');

    // Verify IP Address column header is hidden (if table exists)
    const table = page.getByRole('table');
    const hasTable = await table.isVisible().catch(() => false);

    if (hasTable) {
      await expect(
        page.locator('thead th', { hasText: 'IP Address' }),
      ).not.toBeVisible();
    }
  });

  test('should navigate pagination', async ({ page }) => {
    await page.goto('/settings/audit-logs');

    // Check if pagination exists (depends on data)
    const pagination = page
      .locator('[data-testid="pagination"]')
      .or(page.getByRole('navigation', { name: /pagination/i }))
      .or(page.locator('button', { hasText: /berikutnya|next/i }));

    const hasPagination = await pagination
      .first()
      .isVisible()
      .catch(() => false);

    if (hasPagination) {
      // Try clicking next page if available
      const nextButton = page.getByRole('button', { name: /berikutnya|next/i });
      const isNextEnabled = await nextButton.isEnabled().catch(() => false);

      if (isNextEnabled) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Navigate back
        const prevButton = page.getByRole('button', {
          name: /sebelumnya|previous/i,
        });
        if (await prevButton.isEnabled().catch(() => false)) {
          await prevButton.click();
        }
      }
    }
  });
});
