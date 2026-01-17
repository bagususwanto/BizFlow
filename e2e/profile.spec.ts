import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('e2e_admin_1768654269707');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page).toHaveURL(/dashboard|\/$/, { timeout: 10000 });
  });

  test('should display profile page with user info', async ({ page }) => {
    await page.goto('/settings/profile');

    // Verify page header
    await expect(
      page.getByRole('heading', { name: /profil saya/i }),
    ).toBeVisible();

    // Verify card content
    await expect(
      page.getByRole('heading', { name: /informasi profil/i }),
    ).toBeVisible();

    // Verify form fields are present
    await expect(page.getByLabel(/nama lengkap/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Username and Role fields don't use FormField, check by text content
    await expect(page.getByText('Username', { exact: true })).toBeVisible();
    await expect(page.getByText('Role', { exact: true })).toBeVisible();

    // Verify security section
    await expect(
      page.getByRole('heading', { name: /keamanan/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /ganti password/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /ganti pin/i }),
    ).toBeVisible();
  });

  test('should update profile information', async ({ page }) => {
    await page.goto('/settings/profile');

    // Get current name value
    const nameInput = page.getByLabel(/nama lengkap/i);
    const originalName = await nameInput.inputValue();

    // Update name with timestamp to make it unique
    const timestamp = Date.now();
    const newName = `E2E Admin ${timestamp}`;
    await nameInput.fill(newName);

    // Submit form
    await page.getByRole('button', { name: /simpan profil/i }).click();

    // Verify success toast
    await expect(
      page.getByText(/profil berhasil diperbarui/i).first(),
    ).toBeVisible();

    // Verify the name was updated (page still shows the new name)
    await expect(nameInput).toHaveValue(newName);

    // Restore original name for next tests
    await nameInput.fill(originalName);
    await page.getByRole('button', { name: /simpan profil/i }).click();
    await expect(
      page.getByText(/profil berhasil diperbarui/i).first(),
    ).toBeVisible();
  });

  test('should open and close change password dialog', async ({ page }) => {
    await page.goto('/settings/profile');

    // Click "Ganti Password" button
    await page.getByRole('button', { name: /ganti password/i }).click();

    // Verify dialog is open
    await expect(
      page.getByRole('heading', { name: /ganti password/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/password lama/i)).toBeVisible();
    await expect(page.getByLabel(/password baru/i)).toBeVisible();
    await expect(page.getByLabel(/konfirmasi password/i)).toBeVisible();

    // Close dialog by clicking "Batal"
    await page.getByRole('button', { name: /batal/i }).click();

    // Verify dialog is closed
    await expect(
      page.getByRole('heading', { name: /ganti password/i }),
    ).not.toBeVisible();
  });

  test('should show validation error for password mismatch', async ({
    page,
  }) => {
    await page.goto('/settings/profile');

    // Open change password dialog
    await page.getByRole('button', { name: /ganti password/i }).click();

    // Fill with mismatched passwords
    await page.getByLabel(/password lama/i).fill('password123');
    await page.getByLabel(/password baru/i).fill('NewPassword123');
    await page.getByLabel(/konfirmasi password/i).fill('DifferentPassword123');

    // Try to submit
    await page.getByRole('button', { name: /simpan password/i }).click();

    // Verify validation error
    await expect(page.getByText(/password tidak cocok/i)).toBeVisible();
  });

  test('should open and close change PIN dialog', async ({ page }) => {
    await page.goto('/settings/profile');

    // Click "Ganti PIN" button
    await page.getByRole('button', { name: /ganti pin/i }).click();

    // Verify dialog is open
    await expect(
      page.getByRole('heading', { name: /ganti pin/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/pin lama/i)).toBeVisible();
    await expect(page.getByLabel(/pin baru/i)).toBeVisible();

    // Close dialog by clicking "Batal"
    await page.getByRole('button', { name: /batal/i }).click();

    // Verify dialog is closed
    await expect(
      page.getByRole('heading', { name: /ganti pin/i }),
    ).not.toBeVisible();
  });

  test('should validate PIN length in change PIN dialog', async ({ page }) => {
    await page.goto('/settings/profile');

    // Open change PIN dialog
    await page.getByRole('button', { name: /ganti pin/i }).click();

    // Fill PIN Lama (optional) - leave empty
    // Fill PIN Baru with invalid length (less than 6 digits)
    await page.getByLabel(/pin baru/i).fill('123');

    // Verify "Simpan PIN" button is disabled because PIN is not 6 digits
    const submitButton = page.getByRole('button', { name: /simpan pin/i });
    await expect(submitButton).toBeDisabled();

    // Fill with 6 digits
    await page.getByLabel(/pin baru/i).fill('123456');

    // Now button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should change PIN successfully', async ({ page }) => {
    await page.goto('/settings/profile');

    // Open change PIN dialog
    await page.getByRole('button', { name: /ganti pin/i }).click();

    // Fill with new PIN (6 digits)
    const newPin = '654321';
    await page.getByLabel(/pin baru/i).fill(newPin);

    // Submit
    await page.getByRole('button', { name: /simpan pin/i }).click();

    // Verify success toast
    await expect(page.getByText(/pin berhasil diubah/i)).toBeVisible();

    // Verify dialog is closed
    await expect(
      page.getByRole('heading', { name: /ganti pin/i }),
    ).not.toBeVisible();

    // Restore original PIN for other tests
    await page.getByRole('button', { name: /ganti pin/i }).click();
    await page.getByLabel(/pin lama/i).fill(newPin);
    await page.getByLabel(/pin baru/i).fill('123456');
    await page.getByRole('button', { name: /simpan pin/i }).click();
    await expect(page.getByText(/pin berhasil diubah/i)).toBeVisible();
  });
});
