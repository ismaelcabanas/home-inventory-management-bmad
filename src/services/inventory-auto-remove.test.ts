import { describe, it, expect, beforeEach } from 'vitest';
import { inventoryService } from './inventory';
import { db } from './database';
import type { Product } from '@/types/product';

describe('InventoryService - Auto Remove Logic', () => {
  let testProduct: Product;

  beforeEach(async () => {
    // Clear database
    await db.products.clear();

    // Create a test product
    testProduct = await inventoryService.addProduct('Test Product');
  });

  describe('updateProduct - Auto remove from shopping list', () => {
    it('should set isOnShoppingList to false when stockLevel is set to high', async () => {
      // Arrange: Product with Low stock (on shopping list)
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'low' });
      let updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Act: Mark as High
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'high' });

      // Assert: isOnShoppingList should be false
      updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(false);
      expect(updated?.stockLevel).toBe('high');
    });

    it('should preserve isOnShoppingList when stockLevel is not high', async () => {
      // Arrange: Product with Low stock
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'low' });
      let updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Act: Mark as Medium (not high)
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'medium' });

      // Assert: isOnShoppingList should still be true (was true, not changed)
      updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(true);
      expect(updated?.stockLevel).toBe('medium');
    });

    it('should handle edge case: empty -> high transition', async () => {
      // Arrange: Product with Empty stock
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'empty' });
      let updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Act: Mark as High
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'high' });

      // Assert
      updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(false);
      expect(updated?.stockLevel).toBe('high');
    });

    it('should handle edge case: low -> high transition', async () => {
      // Arrange: Product with Low stock
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'low' });
      let updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Act: Mark as High
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'high' });

      // Assert
      updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(false);
      expect(updated?.stockLevel).toBe('high');
    });

    it('should handle edge case: medium -> high transition (not on list)', async () => {
      // Arrange: Product with Medium stock (not on list)
      const mediumProduct = await inventoryService.addProduct('Medium Product');
      await inventoryService.updateProduct(mediumProduct.id, { stockLevel: 'medium' });
      let updated = await db.products.get(mediumProduct.id);
      expect(updated?.isOnShoppingList).toBe(false);

      // Act: Mark as High
      await inventoryService.updateProduct(mediumProduct.id, { stockLevel: 'high' });

      // Assert: isOnShoppingList should remain false
      updated = await db.products.get(mediumProduct.id);
      expect(updated?.isOnShoppingList).toBe(false);
      expect(updated?.stockLevel).toBe('high');
    });

    it('should set isOnShoppingList to true when going from high to low', async () => {
      // Arrange: Product with High stock
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'high' });
      let updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(false);

      // Act: Mark as Low
      await inventoryService.updateProduct(testProduct.id, { stockLevel: 'low' });

      // Assert: Should be added to shopping list
      updated = await db.products.get(testProduct.id);
      expect(updated?.isOnShoppingList).toBe(true);
      expect(updated?.stockLevel).toBe('low');
    });
  });
});
