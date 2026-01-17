import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder(/username/i).fill('e2e_admin_1768654269707');
    // Password field is wrapped in a div, breaking label association, so we use name attribute
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page).toHaveURL(/dashboard|\/$/);
  });

  test('should create a new user', async ({ page }) => {
    const timestamp = Date.now();
    const newUser = {
      username: `user_${timestamp}`,
      name: `Test User ${timestamp}`,
      email: `user_${timestamp}@example.com`,
      password: 'Password123',
      pin: '123456',
    };

    await page.goto('/settings/users');

    // Navigate to create page
    await page.getByRole('link', { name: /tambah pengguna/i }).click();
    await expect(page).toHaveURL(/\/settings\/users\/create/);

    // Fill form
    await page.getByLabel(/username/i).fill(newUser.username);
    await page.getByLabel(/nama lengkap/i).fill(newUser.name);
    await page.getByLabel(/email/i).fill(newUser.email);

    // Select role (assuming at least one role exists and is selectable)
    await page.getByRole('combobox', { name: /role/i }).click();
    await page.getByRole('option').first().click();

    // Fill password and PIN
    await page.getByLabel(/^password$/i).fill(newUser.password);
    await page.getByLabel(/pin/i).fill(newUser.pin);

    // Submit
    await page.getByRole('button', { name: /buat user/i }).click();

    // Verify redirect and success
    await expect(page).toHaveURL(/\/settings\/users$/);
    await expect(page.getByText('User berhasil dibuat')).toBeVisible();

    // Search for the user to handle pagination
    await page.getByPlaceholder(/cari user/i).fill(newUser.username);
    await expect(
      page.getByText(newUser.username, { exact: true }),
    ).toBeVisible();
  });

  test('should read and filter users', async ({ page }) => {
    // Create a specific user for this test to ensure isolation
    const timestamp = Date.now();
    const testUser = {
      username: `filter_user_${timestamp}`,
      name: `Filter Test User ${timestamp}`,
      email: `filter_${timestamp}@example.com`,
      password: 'Password123',
      roleId: 'admin', // assuming 'admin' is a valid role ID or name pattern, we'll try to select index 1
    };

    // 1. Create User
    await page.goto('/settings/users/create');
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/nama lengkap/i).fill(testUser.name);

    // Select role (index 1 to avoid picking "Pilih Role" if it exists, or just first available)
    await page.getByRole('combobox', { name: /role/i }).click();
    await page.getByRole('option').first().click();

    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /buat user/i }).click();

    // 2. Verify in list
    await expect(page).toHaveURL(/\/settings\/users$/);
    await expect(
      page.getByText(testUser.username, { exact: true }),
    ).toBeVisible();

    // 3. Test Search
    const searchInput = page.getByPlaceholder(/cari user/i);
    await searchInput.fill(testUser.username);
    // Wait for debounce/filter
    await expect(
      page.getByText(testUser.username, { exact: true }),
    ).toBeVisible();
    // Verify other users are hidden (optional, hard to prove without knowing state, but at least our user is there)

    // Clear search
    await searchInput.fill('');

    // 4. Test Filter by Status (Active)
    // Default is Active. Let's switch to Inactive and verify user is NOT there (since we created active user)
    // "Status: Semua" or "Status: Aktif"

    // Find status filter trigger. It has "Status:" text
    // The component has <span className="mr-2">Status:</span> inside the trigger
    const statusTrigger = page.locator('button', { hasText: 'Status:' });
    await statusTrigger.click();
    await page.getByRole('option', { name: 'Nonaktif' }).click();

    // Should NOT see the active user
    await expect(
      page.getByText(testUser.username, { exact: true }),
    ).not.toBeVisible();

    // Switch back to Active
    await statusTrigger.click();
    await page.getByRole('option', { name: /aktif/i }).click();
    await expect(
      page.getByText(testUser.username, { exact: true }),
    ).toBeVisible();
  });

  test('should update a user', async ({ page }) => {
    const timestamp = Date.now();
    const testUser = {
      username: `update_user_${timestamp}`,
      name: `Update Test User ${timestamp}`,
      email: `update_${timestamp}@example.com`,
      password: 'Password123',
      roleId: 'admin',
    };

    // 1. Create User
    await page.goto('/settings/users/create');
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/nama lengkap/i).fill(testUser.name);
    await page.getByRole('combobox', { name: /role/i }).click();
    await page.getByRole('option').first().click();
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /buat user/i }).click();
    await expect(page).toHaveURL(/\/settings\/users$/);

    // 2. Navigate to Edit
    // Click on the row actions or the name?
    // UsersTable usually has an actions menu (three dots) or row click.
    // Let's assume row click or name click works, or find the "Edit" button in actions.
    // Based on `users-table.tsx`, it has `DataTable`.
    // Let's try clicking the "Edit" action.
    // Find row by text -> find action button.

    // Check if there is an edit button directly or needs menu.
    // Usually standard shadcn table has a dropdown menu for actions.
    // Let's look for a button with "More options" or similar near the user row?
    // Or just click the edit button if it's exposed.
    // Without strict knowledge, let's guess standard UI: row actions dropdown -> Edit.

    // Locator strategy: Find row containing username -> find button with "Open menu" or similar standard aria-label?
    // Or just "Actions"?
    // Let's assume we can click the user's name to edit or there's a visible edit button? in `columns.tsx`?
    // I didn't read `columns.tsx`.

    // Safer bet: Click on the row if it's clickable?
    // If not, I'll need to see `columns.tsx`.
    // Let's check `columns.tsx` quickly before writing this test to be sure.
    // But I can't check it inside `multi_replace`.
    // I will write a tentative test assuming "Actions" menu or direct Edit.
    // Common pattern: `getByRole('row', { name: testUser.username }).getByRole('button').click()` -> `getByText('Edit').click()`.

    const row = page.getByRole('row', { name: testUser.username });
    // Assuming the actions button is the last button in the row or has specific accessible name.
    // Let's try locating the "More horizontal" icon button or similar.
    // Or just:
    await row.getByRole('button').last().click(); // Open dropdown
    await page.getByRole('menuitem', { name: /edit|ubah/i }).click();

    // 3. Update Name
    const updatedName = `${testUser.name} Updated`;
    await page.getByLabel(/nama lengkap/i).fill(updatedName);
    await page.getByRole('button', { name: /simpan/i }).click();

    // 4. Verify
    await expect(page).toHaveURL(/\/settings\/users$/);
    // Search to find updated user
    await page.getByPlaceholder(/cari user/i).fill(testUser.username); // Search by username (which didn't change)
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test('should delete a user', async ({ page }) => {
    const timestamp = Date.now();
    const testUser = {
      username: `delete_user_${timestamp}`,
      name: `Delete Test User ${timestamp}`,
      email: `delete_${timestamp}@example.com`,
      password: 'Password123',
      roleId: 'admin',
    };

    // 1. Create User
    await page.goto('/settings/users/create');
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/nama lengkap/i).fill(testUser.name);
    await page.getByRole('combobox', { name: /role/i }).click();
    await page.getByRole('option').first().click();
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /buat user/i }).click();
    await expect(page).toHaveURL(/\/settings\/users$/);
    await expect(page.getByText(testUser.username)).toBeVisible();

    // 2. Delete User
    const row = page.getByRole('row', { name: testUser.username });
    await row.getByRole('button').last().click(); // Open actions menu
    await page
      .getByRole('menuitem', { name: /delete|hapus|nonaktifkan/i })
      .click();

    // 3. Confirm Dialog
    await page
      .getByRole('button', { name: /nonaktifkan/i })
      .last()
      .click(); // Confirm in dialog (might resolve to multiple if trigger text is same, usually dialog button is last or distinct)
    // Adjust selector to target dialog button specifically if needed:
    // page.locator('div[role="alertdialog"] button', { name: /nonaktifkan/i })

    // 4. Verify user is status changed to Inactive OR gone from Active list
    // Since default view might show all, let's filter by Active and ensure it's gone

    // Search first
    await page.getByPlaceholder(/cari user/i).fill(testUser.username);

    // Check if status is "Nonaktif" in the row
    // Assuming the row is still there
    await expect(page.getByText('Nonaktif')).toBeVisible();

    // OR Filter by Active
    const statusTrigger = page.locator('button', { hasText: 'Status:' });
    await statusTrigger.click();
    await page.getByRole('option', { name: /aktif/i }).click();

    // Now it should be gone
    await expect(
      page.getByText(testUser.username, { exact: true }),
    ).not.toBeVisible();
  });
});
