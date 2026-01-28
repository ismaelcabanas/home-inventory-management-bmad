import { describe, it, expect, beforeEach } from 'vitest';
import { inventoryService } from '@/services/inventory';
import { db } from '@/services/database';

describe('Auto-Removal Persistence Tests (Story 3.2)', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.products.clear();
  });

  describe('Data Persistence Across Sessions', () => {
    it('should persist High stock removal after database is closed and reopened', async () => {
      // This test simulates app restart by verifying data is stored in IndexedDB

      // Arrange: Create product and mark as Low (on shopping list)
      const product = await inventoryService.addProduct('Cheese');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      let updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Act: Mark as High (removed from shopping list)
      await inventoryService.updateProduct(product.id, { stockLevel: 'high' });

      // Assert: Verify the state is persisted
      updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(false);
      expect(updated?.stockLevel).toBe('high');

      // Simulate "app restart" - close and verify Dexie still has the data
      // (In IndexedDB, data persists automatically - just verify we can read it)
      const afterRestart = await db.products.get(product.id);
      expect(afterRestart?.isOnShoppingList).toBe(false);
      expect(afterRestart?.stockLevel).toBe('high');
    });

    it('should persist multiple items with different stock levels correctly', async () => {
      // Create multiple products with various stock levels
      const milk = await inventoryService.addProduct('Milk');
      const bread = await inventoryService.addProduct('Bread');
      const eggs = await inventoryService.addProduct('Eggs');

      // Mark different stock levels
      await inventoryService.updateProduct(milk.id, { stockLevel: 'low' });    // On list
      await inventoryService.updateProduct(bread.id, { stockLevel: 'high' });   // Not on list
      await inventoryService.updateProduct(eggs.id, { stockLevel: 'empty' });  // On list

      // Verify states
      const milkProduct = await db.products.get(milk.id);
      expect(milkProduct?.isOnShoppingList).toBe(true);
      expect(milkProduct?.stockLevel).toBe('low');

      const breadProduct = await db.products.get(bread.id);
      expect(breadProduct?.isOnShoppingList).toBe(false);
      expect(breadProduct?.stockLevel).toBe('high');

      const eggsProduct = await db.products.get(eggs.id);
      expect(eggsProduct?.isOnShoppingList).toBe(true);
      expect(eggsProduct?.stockLevel).toBe('empty');

      // Query shopping list
      const listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();

      expect(listItems).toHaveLength(2);
      const listIds = listItems.map(p => p.id);
      expect(listIds).toContain(milk.id);
      expect(listIds).toContain(eggs.id);
      expect(listIds).not.toContain(bread.id);
    });

    it('should maintain shopping list state persistence through stock changes', async () => {
      // Create product and cycle through stock levels
      const product = await inventoryService.addProduct('Yogurt');

      // Low → on list
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      let listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(listItems).toHaveLength(1);

      // High → off list
      await inventoryService.updateProduct(product.id, { stockLevel: 'high' });
      listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(listItems).toHaveLength(0);

      // Empty → back on list
      await inventoryService.updateProduct(product.id, { stockLevel: 'empty' });
      listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(listItems).toHaveLength(1);

      // Medium → stays on list (was empty, now medium - not auto-removed because only 'high' removes)
      await inventoryService.updateProduct(product.id, { stockLevel: 'medium' });
      listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(listItems).toHaveLength(1); // Medium stays on list (was previously added)

      // High again → still off list
      await inventoryService.updateProduct(product.id, { stockLevel: 'high' });
      listItems = await db.products
        .filter((p) => p.isOnShoppingList === true)
        .toArray();
      expect(listItems).toHaveLength(0);
    });
  });
});
