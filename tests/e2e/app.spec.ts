import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')

  // Check page title
  await expect(page).toHaveTitle(/home-inventory-management/i)

  // Verify app renders with inventory heading
  const heading = page.getByRole('heading', { name: /inventory/i })
  await expect(heading).toBeVisible()

  // Verify "Add Product" button is present
  const addButton = page.getByRole('button', { name: /add product/i })
  await expect(addButton).toBeVisible()
})

test('PWA manifest is accessible', async ({ page }) => {
  const response = await page.goto('/manifest.webmanifest')
  expect(response?.status()).toBe(200)
})
