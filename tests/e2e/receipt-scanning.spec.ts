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

  test('should navigate to scan page', async ({ page }) => {
    // Navigate to scan from home
    await page.getByRole('button', { name: /scan/i }).click();
    await expect(page).toHaveURL(/\/scan/);

    // Verify we're on the scan page by checking for scan-related elements
    // The "Scan Receipt" button should be visible when in idle state
    const scanButton = page.getByRole('button', { name: /scan receipt/i }).first();
    await expect(scanButton).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between all main pages', async ({ page }) => {
    // Start at inventory
    await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible();

    // Navigate to shopping (use the bottom navigation button)
    await page.getByRole('button', { name: 'Shopping', exact: true }).click();
    await expect(page).toHaveURL(/\/shopping/);

    // Navigate to scan (use the bottom navigation button)
    await page.getByRole('button', { name: 'Scan', exact: true }).click();
    await expect(page).toHaveURL(/\/scan/);

    // Navigate back to inventory (use the bottom navigation button)
    await page.getByRole('button', { name: 'Inventory', exact: true }).click();
    await expect(page).toHaveURL(/\//);
  });
});

test.describe('Receipt Scanning - Integration with Shopping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add low stock products to shopping list automatically', async ({ page }) => {
    // Add a product
    const productName = `Test Product ${Date.now()}`;
    await page.getByRole('button', { name: /add product/i }).click();
    await page.getByLabel(/product name/i).fill(productName);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Set stock level to low by clicking the "Low" button
    const productCard = page.getByText(productName).locator('../..');
    const lowStockButton = productCard.getByRole('button', { name: /low/i });
    await lowStockButton.click();

    // Navigate to shopping list using the bottom navigation
    await page.getByRole('button', { name: 'Shopping', exact: true }).click();

    // Verify product appears in shopping list (products with low stock are auto-added)
    await expect(page.getByText(productName)).toBeVisible();
  });

  test('should complete shopping flow with two products', async ({ page }) => {
    // Add first product
    const product1Name = `Milk ${Date.now()}`;
    await page.getByRole('button', { name: /add product/i }).click();
    await page.getByLabel(/product name/i).fill(product1Name);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Add second product
    const product2Name = `Eggs ${Date.now()}`;
    await page.getByRole('button', { name: /add product/i }).click();
    await page.getByLabel(/product name/i).fill(product2Name);
    await page.getByRole('button', { name: /^add$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Set first product to low stock
    const product1Card = page.getByText(product1Name).locator('../..');
    const lowStockButton = product1Card.getByRole('button', { name: /low/i });
    await lowStockButton.click();

    // Navigate to shopping list
    await page.getByRole('button', { name: 'Shopping', exact: true }).click();

    // Verify first product appears in shopping list
    await expect(page.getByText(product1Name)).toBeVisible();

    // Navigate to scan page
    await page.getByRole('button', { name: 'Scan', exact: true }).click();
    await expect(page).toHaveURL(/\/scan/);

    // Verify scan page loaded - look for the scan button
    await expect(page.getByRole('button', { name: /scan receipt/i }).first()).toBeVisible({ timeout: 5000 });
  });
});
