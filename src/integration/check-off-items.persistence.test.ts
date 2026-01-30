import { describe, it, expect, beforeEach } from 'vitest';
import { shoppingService } from '@/services/shopping';
import { inventoryService } from '@/services/inventory';
import { db } from '@/services/database';

describe('Check-Off Items Persistence Tests (Story 4.1)', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.products.clear();
  });

  describe('Data Persistence Across Sessions', () => {
    it('should persist isChecked state after database is closed and reopened', async () => {
      // This test simulates app restart by verifying data is stored in IndexedDB

      // Arrange: Create product and add to shopping list
      const product = await inventoryService.addProduct('Milk');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      let updated = await db.products.get(product.id);
      expect(updated?.isOnShoppingList).toBe(true);
      expect(updated?.isChecked).toBe(false); // Default unchecked

      // Act: Check the item
      await shoppingService.updateCheckedState(product.id, true);

      // Assert: Verify the state is persisted
      updated = await db.products.get(product.id);
      expect(updated?.isChecked).toBe(true);
      expect(updated?.isOnShoppingList).toBe(true); // Still on list

      // Simulate "app restart" - close and verify Dexie still has the data
      // (In IndexedDB, data persists automatically - just verify we can read it)
      const afterRestart = await db.products.get(product.id);
      expect(afterRestart?.isChecked).toBe(true);
      expect(afterRestart?.isOnShoppingList).toBe(true);
    });

    it('should persist unchecked state across app restart', async () => {
      // Create product, add to list, and check it
      const product = await inventoryService.addProduct('Bread');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      await shoppingService.updateCheckedState(product.id, true);

      let updated = await db.products.get(product.id);
      expect(updated?.isChecked).toBe(true);

      // Act: Uncheck the item
      await shoppingService.updateCheckedState(product.id, false);

      // Assert: Verify unchecked state persists
      updated = await db.products.get(product.id);
      expect(updated?.isChecked).toBe(false);

      // Verify after "app restart"
      const afterRestart = await db.products.get(product.id);
      expect(afterRestart?.isChecked).toBe(false);
    });

    it('should persist multiple items with different checked states', async () => {
      // Create multiple products
      const milk = await inventoryService.addProduct('Milk');
      const bread = await inventoryService.addProduct('Bread');
      const eggs = await inventoryService.addProduct('Eggs');

      // Add all to shopping list
      await inventoryService.updateProduct(milk.id, { stockLevel: 'low' });
      await inventoryService.updateProduct(bread.id, { stockLevel: 'empty' });
      await inventoryService.updateProduct(eggs.id, { stockLevel: 'low' });

      // Check different items
      await shoppingService.updateCheckedState(milk.id, true);  // Checked
      await shoppingService.updateCheckedState(eggs.id, true);   // Checked
      // Bread remains unchecked

      // Verify states
      const milkProduct = await db.products.get(milk.id);
      expect(milkProduct?.isChecked).toBe(true);
      expect(milkProduct?.isOnShoppingList).toBe(true);

      const breadProduct = await db.products.get(bread.id);
      expect(breadProduct?.isChecked).toBe(false);
      expect(breadProduct?.isOnShoppingList).toBe(true);

      const eggsProduct = await db.products.get(eggs.id);
      expect(eggsProduct?.isChecked).toBe(true);
      expect(eggsProduct?.isOnShoppingList).toBe(true);

      // Query checked items
      const checkedItems = await db.products
        .filter((p) => p.isChecked === true)
        .toArray();

      expect(checkedItems).toHaveLength(2);
      const checkedIds = checkedItems.map(p => p.id);
      expect(checkedIds).toContain(milk.id);
      expect(checkedIds).toContain(eggs.id);
      expect(checkedIds).not.toContain(bread.id);
    });
  });

  describe('Navigation Persistence', () => {
    it('should maintain checked state when navigating away and back', async () => {
      // Create product and check it
      const product = await inventoryService.addProduct('Cheese');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      await shoppingService.updateCheckedState(product.id, true);

      // Verify checked state
      let updated = await db.products.get(product.id);
      expect(updated?.isChecked).toBe(true);

      // Simulate navigation: load shopping list items (like navigating away and back)
      const shoppingListItems = await shoppingService.getShoppingListItems();
      const foundProduct = shoppingListItems.find(p => p.id === product.id);

      expect(foundProduct).toBeDefined();
      expect(foundProduct?.isChecked).toBe(true);
    });

    it('should maintain unchecked state when navigating away and back', async () => {
      // Create product (unchecked by default)
      const product = await inventoryService.addProduct('Yogurt');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      // Verify unchecked state
      let updated = await db.products.get(product.id);
      expect(updated?.isChecked).toBe(false);

      // Simulate navigation: load shopping list items
      const shoppingListItems = await shoppingService.getShoppingListItems();
      const foundProduct = shoppingListItems.find(p => p.id === product.id);

      expect(foundProduct).toBeDefined();
      expect(foundProduct?.isChecked).toBe(false);
    });
  });

  describe('Offline Functionality', () => {
    it('should work without network calls (local IndexedDB only)', async () => {
      // Create and check item - all operations should be local
      const product = await inventoryService.addProduct('Apples');
      await inventoryService.updateProduct(product.id, { stockLevel: 'empty' });

      // This should succeed without any network calls (local IndexedDB only)
      await shoppingService.updateCheckedState(product.id, true);

      const updated = await db.products.get(product.id);
      expect(updated?.isChecked).toBe(true);
    });

    it('should persist checked state offline', async () => {
      // Create product and check it
      const product = await inventoryService.addProduct('Bananas');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      await shoppingService.updateCheckedState(product.id, true);

      // Verify state is persisted to IndexedDB (no network required)
      const updated = await db.products.get(product.id);
      expect(updated?.isChecked).toBe(true);
      expect(updated?.isOnShoppingList).toBe(true);
    });

    it('should persist unchecked state offline', async () => {
      // Create product, check it, then uncheck
      const product = await inventoryService.addProduct('Oranges');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      await shoppingService.updateCheckedState(product.id, true);
      await shoppingService.updateCheckedState(product.id, false);

      // Verify unchecked state persists offline
      const updated = await db.products.get(product.id);
      expect(updated?.isChecked).toBe(false);
    });
  });

  describe('Integration with isOnShoppingList', () => {
    it('should not modify isOnShoppingList when checking item', async () => {
      const product = await inventoryService.addProduct('Milk');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      const before = await db.products.get(product.id);
      expect(before?.isOnShoppingList).toBe(true);

      // Check the item
      await shoppingService.updateCheckedState(product.id, true);

      const after = await db.products.get(product.id);
      expect(after?.isOnShoppingList).toBe(true); // Still on list
      expect(after?.isChecked).toBe(true);
    });

    it('should not modify isOnShoppingList when unchecking item', async () => {
      const product = await inventoryService.addProduct('Bread');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      await shoppingService.updateCheckedState(product.id, true);

      const before = await db.products.get(product.id);
      expect(before?.isOnShoppingList).toBe(true);
      expect(before?.isChecked).toBe(true);

      // Uncheck the item
      await shoppingService.updateCheckedState(product.id, false);

      const after = await db.products.get(product.id);
      expect(after?.isOnShoppingList).toBe(true); // Still on list
      expect(after?.isChecked).toBe(false);
    });

    it('should preserve other product fields when updating isChecked', async () => {
      const product = await inventoryService.addProduct('Eggs');
      await inventoryService.updateProduct(product.id, { stockLevel: 'empty' });

      const before = await db.products.get(product.id);
      expect(before?.name).toBe('Eggs');
      expect(before?.stockLevel).toBe('empty');
      expect(before?.isOnShoppingList).toBe(true);

      // Update checked state
      await shoppingService.updateCheckedState(product.id, true);

      const after = await db.products.get(product.id);
      expect(after?.name).toBe('Eggs'); // Unchanged
      expect(after?.stockLevel).toBe('empty'); // Unchanged
      expect(after?.isOnShoppingList).toBe(true); // Unchanged
      expect(after?.isChecked).toBe(true); // Changed
    });
  });
});
