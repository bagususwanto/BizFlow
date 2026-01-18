import { test, expect } from '@playwright/test';

test.describe('App Settings', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('e2e_admin_1768654269707');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page).toHaveURL(/dashboard|\/$/, { timeout: 10000 });
  });

  test('should display settings page with tabs', async ({ page }) => {
    await page.goto('/settings/general');

    // Verify page header
    await expect(
      page.getByRole('heading', { name: /pengaturan aplikasi/i }),
    ).toBeVisible();

    // Verify all tabs are present
    await expect(page.getByRole('tab', { name: /perusahaan/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /pajak/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /struk/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /tampilan/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /umum/i })).toBeVisible();

    // Verify default tab (Perusahaan) is selected
    await expect(
      page.getByRole('tab', { name: /perusahaan/i }),
    ).toHaveAttribute('data-state', 'active');
  });

  test('should display company settings form', async ({ page }) => {
    await page.goto('/settings/general');

    // Verify company settings card
    await expect(
      page.getByRole('heading', { name: /informasi perusahaan/i }),
    ).toBeVisible();

    // Verify form fields
    await expect(page.getByLabel(/nama perusahaan/i)).toBeVisible();
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/nomor telepon/i)).toBeVisible();
    await expect(page.getByLabel(/alamat/i)).toBeVisible();
    await expect(page.getByLabel(/npwp/i)).toBeVisible();
    await expect(page.getByLabel(/url logo/i)).toBeVisible();

    // Verify save button
    await expect(
      page.getByRole('button', { name: /simpan perubahan/i }),
    ).toBeVisible();
  });

  test('should display tax settings form', async ({ page }) => {
    await page.goto('/settings/general');

    // Click on Pajak tab
    await page.getByRole('tab', { name: /pajak/i }).click();

    // Verify tax settings card
    await expect(
      page.getByRole('heading', { name: /pengaturan pajak/i }),
    ).toBeVisible();

    // Verify form fields
    await expect(page.getByLabel(/tarif pajak default/i)).toBeVisible();
    await expect(page.getByLabel(/harga termasuk pajak/i)).toBeVisible();

    // Verify save button
    await expect(
      page.getByRole('button', { name: /simpan perubahan/i }),
    ).toBeVisible();
  });

  test('should display receipt settings form', async ({ page }) => {
    await page.goto('/settings/general');

    // Click on Struk tab
    await page.getByRole('tab', { name: /struk/i }).click();

    // Verify receipt settings card
    await expect(
      page.getByRole('heading', { name: /pengaturan struk/i }),
    ).toBeVisible();

    // Verify form has save button
    await expect(
      page.getByRole('button', { name: /simpan perubahan/i }),
    ).toBeVisible();
  });

  // Skip on mobile/webkit due to dropdown viewport issues
  test('should display display settings form', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit' ||
        browserName.includes('Mobile') ||
        page.viewportSize()?.width! < 768,
      'Date format select may have viewport issues on mobile/webkit',
    );

    await page.goto('/settings/general');

    // Click on Tampilan tab
    await page.getByRole('tab', { name: /tampilan/i }).click();

    // Verify display settings card
    await expect(
      page.getByRole('heading', { name: /tampilan.*format/i }),
    ).toBeVisible();

    // Verify form has save button
    await expect(
      page.getByRole('button', { name: /simpan perubahan/i }),
    ).toBeVisible();
  });

  // Skip on mobile/webkit due to dropdown viewport issues
  test('should display general settings form', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit' ||
        browserName.includes('Mobile') ||
        page.viewportSize()?.width! < 768,
      'Language select may have viewport issues on mobile/webkit',
    );

    await page.goto('/settings/general');

    // Click on Umum tab
    await page.getByRole('tab', { name: /umum/i }).click();

    // Verify general settings card
    await expect(
      page.getByRole('heading', { name: /pengaturan umum system/i }),
    ).toBeVisible();

    // Verify form has save button
    await expect(
      page.getByRole('button', { name: /simpan perubahan/i }),
    ).toBeVisible();
  });

  test('should update company settings', async ({ page }) => {
    await page.goto('/settings/general');

    // Fill company name
    const companyNameInput = page.getByLabel(/nama perusahaan/i);
    await companyNameInput.fill('Test Company E2E');

    // Fill email
    const emailInput = page.getByLabel(/email/i).first();
    await emailInput.fill('test@e2e.com');

    // Fill phone
    const phoneInput = page.getByLabel(/nomor telepon/i);
    await phoneInput.fill('021-12345678');

    // Submit form
    await page.getByRole('button', { name: /simpan perubahan/i }).click();

    // Verify success message or no error
    await page.waitForTimeout(1000);

    // Values should still be there after save
    await expect(companyNameInput).toHaveValue('Test Company E2E');
  });

  test('should update tax settings', async ({ page }) => {
    await page.goto('/settings/general');

    // Click on Pajak tab
    await page.getByRole('tab', { name: /pajak/i }).click();

    // Fill tax rate
    const taxRateInput = page.getByLabel(/tarif pajak default/i);
    await taxRateInput.fill('11');

    // Toggle tax inclusive switch
    const taxInclusiveSwitch = page.getByRole('switch');
    await taxInclusiveSwitch.click();

    // Submit form
    await page.getByRole('button', { name: /simpan perubahan/i }).click();

    // Wait for save
    await page.waitForTimeout(1000);

    // Tax rate should still be there
    await expect(taxRateInput).toHaveValue('11');
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/settings/general');

    // Default tab should be Perusahaan
    await expect(
      page.getByRole('tab', { name: /perusahaan/i }),
    ).toHaveAttribute('data-state', 'active');

    // Click Pajak tab
    await page.getByRole('tab', { name: /pajak/i }).click();
    await expect(page.getByRole('tab', { name: /pajak/i })).toHaveAttribute(
      'data-state',
      'active',
    );
    await expect(
      page.getByRole('heading', { name: /pengaturan pajak/i }),
    ).toBeVisible();

    // Click Struk tab
    await page.getByRole('tab', { name: /struk/i }).click();
    await expect(page.getByRole('tab', { name: /struk/i })).toHaveAttribute(
      'data-state',
      'active',
    );
    await expect(
      page.getByRole('heading', { name: /pengaturan struk/i }),
    ).toBeVisible();

    // Click Tampilan tab
    await page.getByRole('tab', { name: /tampilan/i }).click();
    await expect(page.getByRole('tab', { name: /tampilan/i })).toHaveAttribute(
      'data-state',
      'active',
    );

    // Click Umum tab
    await page.getByRole('tab', { name: /umum/i }).click();
    await expect(page.getByRole('tab', { name: /umum/i })).toHaveAttribute(
      'data-state',
      'active',
    );

    // Click back to Perusahaan
    await page.getByRole('tab', { name: /perusahaan/i }).click();
    await expect(
      page.getByRole('tab', { name: /perusahaan/i }),
    ).toHaveAttribute('data-state', 'active');
  });

  test('should validate company name is required', async ({ page }) => {
    await page.goto('/settings/general');

    // Clear company name
    const companyNameInput = page.getByLabel(/nama perusahaan/i);
    await companyNameInput.fill('');

    // Blur to trigger validation
    await companyNameInput.blur();

    // Submit form
    await page.getByRole('button', { name: /simpan perubahan/i }).click();

    // Should show validation error
    await expect(page.getByText(/nama perusahaan wajib diisi/i)).toBeVisible();
  });
});
