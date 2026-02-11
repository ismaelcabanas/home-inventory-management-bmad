import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Receipt Scanning Feature (Story 5.4)
 *
 * These tests verify the happy path flow for receipt scanning with mocked OCR provider.
 * The mock provider (MockOCRProvider) returns predefined products without making API calls.
 *
 * Prerequisites:
 * - VITE_USE_MOCK_OCR=true environment variable must be set
 * - MockOCRProvider must be enabled in config.ts
 */

test.describe('Receipt Scanning - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between main pages', async ({ page }) => {
    // Start at inventory (use level: 1 for main heading)
    await expect(page.getByRole('heading', { name: /inventory/i, level: 1 })).toBeVisible();

    // Story 7.1: Navigate to shopping (only 2 tabs now - Scan removed)
    await page.getByRole('button', { name: 'Shopping', exact: true }).click();
    await expect(page).toHaveURL(/\/shopping/);

    // Navigate back to inventory
    await page.getByRole('button', { name: 'Inventory', exact: true }).click();
    await expect(page).toHaveURL(/\//);
  });
});

test.describe('Receipt Scanning - Integration with Shopping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add low stock products to shopping list automatically', async ({ page }) => {
    // Add a product (use "Add your first product" button from EmptyState)
    const productName = `Test Product ${Date.now()}`;
    await page.getByRole('button', { name: /Add your first product/i }).click();
    await page.getByLabel(/product name/i).fill(productName);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Story 7.1: Set stock level to low by tapping the card (tap-to-cycle)
    // Default is high, tap once to get medium, tap again for low
    const productCard = page.getByText(productName).locator('../..');
    // Tap card twice to cycle from high → medium → low
    await productCard.click();
    await productCard.click();

    // Navigate to shopping list using the bottom navigation
    await page.getByRole('button', { name: 'Shopping', exact: true }).click();

    // Verify product appears in shopping list (products with low stock are auto-added)
    await expect(page.getByText(productName)).toBeVisible();
  });

  test('should complete shopping flow with two products', async ({ page }) => {
    // Add first product (use "Add your first product" button from EmptyState)
    const product1Name = `Milk ${Date.now()}`;
    await page.getByRole('button', { name: /Add your first product/i }).click();
    await page.getByLabel(/product name/i).fill(product1Name);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Add second product (use FAB since products now exist)
    const product2Name = `Eggs ${Date.now()}`;
    await page.locator('[aria-label="Add product"]').click();
    await page.getByLabel(/product name/i).fill(product2Name);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Story 7.1: Set first product to low stock by tapping the card
    const product1Card = page.getByText(product1Name).locator('../..');
    // Tap card twice to cycle from high → medium → low
    await product1Card.click();
    await product1Card.click();

    // Navigate to shopping list
    await page.getByRole('button', { name: 'Shopping', exact: true }).click();

    // Verify first product appears in shopping list
    await expect(page.getByText(product1Name)).toBeVisible();
  });
});
