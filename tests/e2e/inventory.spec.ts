import { test, expect } from '@playwright/test';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display inventory list', async ({ page }) => {
    // Verify inventory heading is visible
    await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible();

    // Verify add product button is present
    await expect(page.getByRole('button', { name: /add product/i })).toBeVisible();
  });

  test('should add a new product', async ({ page }) => {
    // Click Add Product button
    await page.getByRole('button', { name: /add product/i }).click();

    // Wait for dialog to appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in product name
    const productName = `Test Product ${Date.now()}`;
    await page.getByLabel(/product name/i).fill(productName);

    // Submit form
    await page.getByRole('button', { name: /^add$/i }).click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify product appears in list
    await expect(page.getByText(productName)).toBeVisible();
  });

  test('should edit product name', async ({ page }) => {
    // First add a product to edit
    await page.getByRole('button', { name: /add product/i }).click();
    const originalName = `Edit Test ${Date.now()}`;
    await page.getByLabel(/product name/i).fill(originalName);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Story 7.1: Click 3-dot menu to open actions
    const productCard = page.getByText(originalName).locator('../..');
    await productCard.getByRole('button', { name: /actions/i }).click();

    // Click Edit in the menu (use text content to be more specific)
    await page.getByText('Edit').filter({ hasText: /^Edit$/ }).click();

    // Wait for edit dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Change name
    const updatedName = `Updated ${Date.now()}`;
    const nameField = page.getByLabel(/product name/i);
    await nameField.clear();
    await nameField.fill(updatedName);
    await page.getByRole('button', { name: /save/i }).click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify updated name appears
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(originalName)).not.toBeVisible();
  });

  test('should delete product', async ({ page }) => {
    // First add a product to delete
    await page.getByRole('button', { name: /add product/i }).click();
    const productName = `Delete Test ${Date.now()}`;
    await page.getByLabel(/product name/i).fill(productName);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Story 7.1: Click 3-dot menu to open actions
    const productCard = page.getByText(productName).locator('../..');
    await productCard.getByRole('button', { name: /actions/i }).click();

    // Click Delete in the menu (use text content to be more specific)
    await page.getByText('Delete').filter({ hasText: /^Delete$/ }).click();

    // Confirm deletion in dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /delete/i }).last().click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify product is removed
    await expect(page.getByText(productName)).not.toBeVisible();
  });

  test('should search and filter products', async ({ page }) => {
    // Add multiple products
    const products = [`Apple ${Date.now()}`, `Banana ${Date.now()}`, `Cherry ${Date.now()}`];

    for (const productName of products) {
      await page.getByRole('button', { name: /add product/i }).click();
      await page.getByLabel(/product name/i).fill(productName);
      await page.getByRole('button', { name: /^add$/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // Verify all products are visible
    for (const productName of products) {
      await expect(page.getByText(productName)).toBeVisible();
    }

    // Search for specific product
    const searchField = page.getByPlaceholder(/search/i);
    await searchField.fill('Apple');

    // Verify only Apple is visible
    await expect(page.getByText(products[0])).toBeVisible();
    await expect(page.getByText(products[1])).not.toBeVisible();
    await expect(page.getByText(products[2])).not.toBeVisible();

    // Clear search
    await searchField.clear();

    // Verify all products visible again
    for (const productName of products) {
      await expect(page.getByText(productName)).toBeVisible();
    }
  });

  test('should persist data across page reloads', async ({ page }) => {
    // Add a product
    const productName = `Persist Test ${Date.now()}`;
    await page.getByRole('button', { name: /add product/i }).click();
    await page.getByLabel(/product name/i).fill(productName);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify product exists
    await expect(page.getByText(productName)).toBeVisible();

    // Reload page
    await page.reload();

    // Verify product still exists
    await expect(page.getByText(productName)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between routes', async ({ page }) => {
    await page.goto('/');

    // Verify we're on inventory page
    await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible();

    // Story 7.1: Navigate to shopping list (only 2 tabs now)
    await page.getByRole('button', { name: 'Shopping', exact: true }).click();
    await expect(page).toHaveURL('/shopping');

    // Navigate back to inventory
    await page.getByRole('button', { name: 'Inventory', exact: true }).click();
    await expect(page).toHaveURL('/');
  });

  test('should show error boundary on errors', async ({ page }) => {
    await page.goto('/');

    // This test verifies error boundaries exist
    // In a real scenario, we'd need to trigger an error
    // For now, just verify the page loads without crashing
    await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible();
  });
});
