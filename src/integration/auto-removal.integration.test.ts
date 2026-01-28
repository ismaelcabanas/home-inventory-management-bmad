import { describe, it, expect, beforeEach } from 'vitest';
import { inventoryService } from '@/services/inventory';
import { db } from '@/services/database';

describe('Auto-Removal Integration Tests (Story 3.2)', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.products.clear();
  });

  describe('Complete Automation Cycle', () => {
    it('should mark item as Low → appears on shopping list, then mark as High → disappears', async () => {
      // Arrange: Add a product
      const product = await inventoryService.addProduct('Milk');

      // Act & Assert: Mark as Low → appears on shopping list
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      let updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Get shopping list items
      const lowItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(lowItems).toHaveLength(1);
      if (lowItems[0]) {
        expect(lowItems[0].id).toBe(product.id);
      }

      // Act & Assert: Mark as High → disappears from shopping list
      await inventoryService.updateProduct(product.id, { stockLevel: 'high' });
      updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(false);

      // Get shopping list items
      const highItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(highItems).toHaveLength(0);
    });

    it('should handle multiple items: some removed, some remain', async () => {
      // Arrange: Add 3 products with different stock levels
      const milk = await inventoryService.addProduct('Milk');
      const bread = await inventoryService.addProduct('Bread');
      const eggs = await inventoryService.addProduct('Eggs');

      // Act: Mark Milk and Bread as Low, Eggs as Medium
      await inventoryService.updateProduct(milk.id, { stockLevel: 'low' });
      await inventoryService.updateProduct(bread.id, { stockLevel: 'low' });
      await inventoryService.updateProduct(eggs.id, { stockLevel: 'medium' });

      // Assert: 2 items on shopping list (Milk and Bread)
      let listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(listItems).toHaveLength(2);

      const listIds = listItems.map(p => p.id);
      expect(listIds).toContain(milk.id);
      expect(listIds).toContain(bread.id);
      expect(listIds).not.toContain(eggs.id);

      // Act: Mark Bread as High (removed from list)
      await inventoryService.updateProduct(bread.id, { stockLevel: 'high' });

      // Assert: Only Milk remains on shopping list
      listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(listItems).toHaveLength(1);
      if (listItems[0]) {
        expect(listItems[0].id).toBe(milk.id);
      }

      const breadItem = await db.products.get(bread.id);
      expect(breadItem?.isOnShoppingList).toBe(false);
    });

    it('should handle rapid stock level changes: low → high → low within short time', async () => {
      // Arrange: Add product and mark as Low
      const product = await inventoryService.addProduct('Rice');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      // Act: Mark as High (removed)
      await inventoryService.updateProduct(product.id, { stockLevel: 'high' });
      let updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(false);

      // Quickly mark as Low again (re-added)
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Assert: Product is back on shopping list
      const listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(listItems).toHaveLength(1);
      if (listItems[0]) {
        expect(listItems[0].id).toBe(product.id);
      }
    });
  });

  describe('Stock Level Transitions', () => {
    it('should handle: medium → low → high → empty → high transitions', async () => {
      const product = await inventoryService.addProduct('Juice');

      // Medium (not on list)
      await inventoryService.updateProduct(product.id, { stockLevel: 'medium' });
      let updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(false);

      // Low (added to list)
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // High (removed from list)
      await inventoryService.updateProduct(product.id, { stockLevel: 'high' });
      updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(false);

      // Empty (added to list)
      await inventoryService.updateProduct(product.id, { stockLevel: 'empty' });
      updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Back to High (removed from list again)
      await inventoryService.updateProduct(product.id, { stockLevel: 'high' });
      updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(false);
    });
  });
});
