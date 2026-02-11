import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')

  // Check page title
  await expect(page).toHaveTitle(/home-inventory-management/i)

  // Verify app renders with inventory heading (use level: 1 for main h1, not empty state h5)
  const heading = page.getByRole('heading', { name: /inventory/i, level: 1 })
  await expect(heading).toBeVisible()

  // When empty, EmptyState has "Add your first product" button (not "add product" FAB)
  const addButton = page.getByRole('button', { name: /Add your first product/i })
  await expect(addButton).toBeVisible()
})

test('PWA manifest is accessible', async ({ page }) => {
  const response = await page.goto('/manifest.webmanifest')
  expect(response?.status()).toBe(200)
})
