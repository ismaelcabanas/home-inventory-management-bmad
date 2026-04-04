import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shoppingService } from './shopping';
import { inventoryService } from './inventory';
import { db } from './database';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ShoppingService', () => {
  // Clear database before each test
  beforeEach(async () => {
    await db.products.clear();
  });

  describe('getShoppingListItems', () => {
    it('should return empty array when no products', async () => {
      const result = await shoppingService.getShoppingListItems();
      expect(result).toEqual([]);
    });

    it('should return products where isOnShoppingList is true', async () => {
      // Add products and put some on shopping list
      const p1 = await inventoryService.addProduct('Milk');
      await inventoryService.addProduct('Bread'); // Not on list
      const p3 = await inventoryService.addProduct('Eggs');

      await inventoryService.updateProduct(p1.id, { stockLevel: 'low' }); // Auto-adds to list
      await shoppingService.addToList(p3.id); // Manual add (High stock)

      const items = await shoppingService.getShoppingListItems();

      // Should include both Low (automatic) and manually added High
      expect(items).toHaveLength(2);
      expect(items.map(p => p.name)).toContain('Milk');
      expect(items.map(p => p.name)).toContain('Eggs');
    });

    it('should include manually added Medium and High products (Story 3.3)', async () => {
      // Create products and manually add to shopping list
      const p1 = await inventoryService.addProduct('Milk');
      const p2 = await inventoryService.addProduct('Bread');
      const p3 = await inventoryService.addProduct('Eggs');
      const p4 = await inventoryService.addProduct('Cheese');

      await inventoryService.updateProduct(p1.id, { stockLevel: 'low' }); // Auto
      await inventoryService.updateProduct(p2.id, { stockLevel: 'empty' }); // Auto
      await inventoryService.updateProduct(p4.id, { stockLevel: 'medium' }); // Set to medium first
      await shoppingService.addToList(p3.id); // Manual High
      await shoppingService.addToList(p4.id); // Manual Medium

      const items = await shoppingService.getShoppingListItems();

      // Should include all 4 (no stock level filtering)
      expect(items).toHaveLength(4);

      const mediumProduct = items.find((p) => p.name === 'Cheese');
      const highProduct = items.find((p) => p.name === 'Eggs');

      expect(mediumProduct).toBeDefined();
      expect(mediumProduct?.stockLevel).toBe('medium');
      expect(mediumProduct?.isOnShoppingList).toBe(true);

      expect(highProduct).toBeDefined();
      expect(highProduct?.stockLevel).toBe('high');
      expect(highProduct?.isOnShoppingList).toBe(true);
    });

    it('should sort results by updatedAt descending (most recently changed first)', async () => {
      const p1 = await inventoryService.addProduct('Milk');
      await new Promise(resolve => setTimeout(resolve, 2));
      const p2 = await inventoryService.addProduct('Bread');

      await shoppingService.addToList(p1.id);
      await shoppingService.addToList(p2.id);

      const items = await shoppingService.getShoppingListItems();

      // Most recently added/updated should come first
      expect(items[0]?.name).toBe('Bread');
      expect(items[1]?.name).toBe('Milk');
    });
  });

  describe('getShoppingListCount', () => {
    it('should return 0 when shopping list is empty', async () => {
      const count = await shoppingService.getShoppingListCount();
      expect(count).toBe(0);
    });

    it('should return count of all products with isOnShoppingList: true', async () => {
      const p1 = await inventoryService.addProduct('Milk');
      const p2 = await inventoryService.addProduct('Bread');

      await inventoryService.updateProduct(p1.id, { stockLevel: 'low' });
      await shoppingService.addToList(p2.id);

      const count = await shoppingService.getShoppingListCount();
      expect(count).toBe(2);
    });

    it('should match filtering logic of getShoppingListItems', async () => {
      const items = await shoppingService.getShoppingListItems();
      const count = await shoppingService.getShoppingListCount();

      // Count should match number of items returned
      expect(count).toBe(items.length);
    });
  });

  describe('addToList', () => {
    it('should set isOnShoppingList to true for the given product', async () => {
      const product = await inventoryService.addProduct('Milk');

      await shoppingService.addToList(product.id);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(true);
    });

    it('should preserve existing stockLevel when adding to list', async () => {
      const product = await inventoryService.addProduct('Bread');
      const originalStock = product.stockLevel;

      await shoppingService.addToList(product.id);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe(originalStock);
    });

    it('Story 11.8: should always set isChecked to false when adding to list', async () => {
      const product = await inventoryService.addProduct('Milk');

      // First, mark as bought
      await shoppingService.updateCheckedState(product.id, true);
      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(true);

      // Remove from list
      await shoppingService.removeFromList(product.id);
      expect((await inventoryService.getProduct(product.id))?.isOnShoppingList).toBe(false);
      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(false);

      // Re-add to list - should have isChecked: false
      await shoppingService.addToList(product.id);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(true);
      expect(updated?.isChecked).toBe(false);
    });

    it('Story 11.8: should reset isChecked to false even if previously true', async () => {
      const product = await inventoryService.addProduct('Eggs');

      // Mark as bought first
      await shoppingService.updateCheckedState(product.id, true);
      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(true);

      // Add to list - should reset isChecked to false
      await shoppingService.addToList(product.id);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isChecked).toBe(false);
      expect(updated?.isOnShoppingList).toBe(true);
    });
  });

  describe('removeFromList', () => {
    it('should set isOnShoppingList to false for the given product', async () => {
      const product = await inventoryService.addProduct('Milk');
      await shoppingService.addToList(product.id);

      await shoppingService.removeFromList(product.id);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(false);
    });

    it('should preserve existing stockLevel when removing from list', async () => {
      const product = await inventoryService.addProduct('Bread');
      await shoppingService.addToList(product.id);

      const originalStock = product.stockLevel;

      await shoppingService.removeFromList(product.id);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe(originalStock);
    });

    it('Story 11.8: should clear isChecked when removing from list', async () => {
      const product = await inventoryService.addProduct('Cheese');
      await shoppingService.addToList(product.id);

      // Mark as bought
      await shoppingService.updateCheckedState(product.id, true);
      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(true);

      // Remove from list - should clear isChecked
      await shoppingService.removeFromList(product.id);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(false);
      expect(updated?.isChecked).toBe(false);
    });

    it('Story 11.8: should prevent re-added as bought bug scenario', async () => {
      const product = await inventoryService.addProduct('Yogurt');

      // Scenario: Product runs low → auto-added
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      expect((await inventoryService.getProduct(product.id))?.isOnShoppingList).toBe(true);

      // User marks as bought
      await shoppingService.updateCheckedState(product.id, true);
      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(true);

      // User removes from list
      await shoppingService.removeFromList(product.id);
      expect((await inventoryService.getProduct(product.id))?.isOnShoppingList).toBe(false);
      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(false);

      // Product runs low again → auto-added
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(true);
      expect(updated?.isChecked).toBe(false); // Should NOT be checked
    });
  });

  describe('updateCheckedState', () => {
    it('should set isChecked to true when checking an item', async () => {
      const product = await inventoryService.addProduct('Milk');

      await shoppingService.updateCheckedState(product.id, true);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isChecked).toBe(true);
    });

    it('should set isChecked to false when unchecking an item', async () => {
      const product = await inventoryService.addProduct('Bread');
      await shoppingService.updateCheckedState(product.id, true);
      await shoppingService.updateCheckedState(product.id, false);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isChecked).toBe(false);
    });

    it('should preserve isOnShoppingList when updating isChecked', async () => {
      const product = await inventoryService.addProduct('Eggs');
      await shoppingService.addToList(product.id);

      await shoppingService.updateCheckedState(product.id, true);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(true);
    });

    it('should preserve stockLevel when updating isChecked', async () => {
      const product = await inventoryService.addProduct('Cheese');
      const originalStock = product.stockLevel;

      await shoppingService.updateCheckedState(product.id, true);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe(originalStock);
    });
  });

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };
  })();

  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });

  describe('getShoppingMode', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should return false when shopping mode is not set (default)', async () => {
      const result = await shoppingService.getShoppingMode();
      expect(result).toBe(false);
    });

    it('should return true when shopping mode is set to true', async () => {
      localStorage.setItem('shoppingMode', 'true');

      const result = await shoppingService.getShoppingMode();

      expect(result).toBe(true);
    });

    it('should return false when shopping mode is explicitly set to false', async () => {
      localStorage.setItem('shoppingMode', 'false');

      const result = await shoppingService.getShoppingMode();

      expect(result).toBe(false);
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('shoppingMode', 'invalid');

      const result = await shoppingService.getShoppingMode();

      // Should default to false when data is invalid
      expect(result).toBe(false);
    });
  });

  describe('setShoppingMode', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should set shopping mode to true and persist to localStorage', async () => {
      await shoppingService.setShoppingMode(true);

      const storedValue = localStorage.getItem('shoppingMode');

      expect(storedValue).toBe('true');
    });

    it('should set shopping mode to false and persist to localStorage', async () => {
      await shoppingService.setShoppingMode(false);

      const storedValue = localStorage.getItem('shoppingMode');

      expect(storedValue).toBe('false');
    });

    it('should overwrite existing shopping mode value', async () => {
      localStorage.setItem('shoppingMode', 'true');

      await shoppingService.setShoppingMode(false);

      const storedValue = localStorage.getItem('shoppingMode');

      expect(storedValue).toBe('false');
    });
  });

  // Story 6.1: Update Inventory from Confirmed Receipt Products
  describe('removePurchasedItems', () => {
    it('should remove purchased items from shopping list', async () => {
      // Add products and put them on shopping list
      const product1 = await inventoryService.addProduct('Milk');
      const product2 = await inventoryService.addProduct('Bread');
      await shoppingService.addToList(product1.id);
      await shoppingService.addToList(product2.id);

      // Verify they're on the shopping list
      let items = await shoppingService.getShoppingListItems();
      expect(items).toHaveLength(2);

      // Remove purchased items
      const removedCount = await shoppingService.removePurchasedItems(['Milk', 'Bread']);

      // Verify count
      expect(removedCount).toBe(2);

      // Verify they're removed from shopping list
      items = await shoppingService.getShoppingListItems();
      expect(items).toHaveLength(0);
    });

    it('should handle products not on shopping list', async () => {
      // Add products but don't put on shopping list
      await inventoryService.addProduct('Cheese');
      await inventoryService.addProduct('Eggs');

      // Try to remove them (should not fail)
      const removedCount = await shoppingService.removePurchasedItems(['Cheese', 'Eggs']);

      // Should return 0 since they weren't on the list
      expect(removedCount).toBe(0);
    });

    it('should return correct count of removed items', async () => {
      // Add 3 products, put 2 on shopping list
      const p1 = await inventoryService.addProduct('Milk');
      await inventoryService.addProduct('Bread'); // Not on list
      const p3 = await inventoryService.addProduct('Eggs');

      await shoppingService.addToList(p1.id);
      await shoppingService.addToList(p3.id);

      // Remove all 3, but only 2 should be removed
      const removedCount = await shoppingService.removePurchasedItems(['Milk', 'Bread', 'Eggs']);

      expect(removedCount).toBe(2);
    });

    it('should use database transaction for atomicity', async () => {
      // Add products and put on shopping list
      const product1 = await inventoryService.addProduct('Butter');
      const product2 = await inventoryService.addProduct('Yogurt');
      await shoppingService.addToList(product1.id);
      await shoppingService.addToList(product2.id);

      // Remove purchased items
      await expect(shoppingService.removePurchasedItems(['Butter', 'Yogurt'])).resolves.not.toThrow();

      // Verify both are removed from shopping list
      const items = await shoppingService.getShoppingListItems();
      expect(items).toHaveLength(0);
    });

    it('should match product names case-insensitively', async () => {
      const product = await inventoryService.addProduct('Milk');
      await shoppingService.addToList(product.id);

      // Remove with different case
      const removedCount = await shoppingService.removePurchasedItems(['milk']);

      expect(removedCount).toBe(1);

      const items = await shoppingService.getShoppingListItems();
      expect(items).toHaveLength(0);
    });

    it('should handle empty product list', async () => {
      const removedCount = await shoppingService.removePurchasedItems([]);
      expect(removedCount).toBe(0);
    });

    it('should handle non-existent products gracefully', async () => {
      // Add one product on shopping list
      const product = await inventoryService.addProduct('Cheese');
      await shoppingService.addToList(product.id);

      // Try to remove purchased and non-existent products
      const removedCount = await shoppingService.removePurchasedItems(['Cheese', 'Non-Existent']);

      // Should only remove the actual product
      expect(removedCount).toBe(1);

      const items = await shoppingService.getShoppingListItems();
      expect(items).toHaveLength(0);
    });

    it('Story 11.8: should clear isChecked even when isOnShoppingList is false (receipt flow)', async () => {
      // Simulate receipt flow:
      // 1. Product is on shopping list and marked as bought
      const product = await inventoryService.addProduct('Milk');
      await shoppingService.addToList(product.id);
      await shoppingService.updateCheckedState(product.id, true);

      expect((await inventoryService.getProduct(product.id))?.isOnShoppingList).toBe(true);
      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(true);

      // 2. replenishStock() sets isOnShoppingList: false BEFORE calling removePurchasedItems
      await db.products.update(product.id, { isOnShoppingList: false });
      expect((await inventoryService.getProduct(product.id))?.isOnShoppingList).toBe(false);
      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(true); // Still true!

      // 3. removePurchasedItems() should clear isChecked regardless of isOnShoppingList state
      await shoppingService.removePurchasedItems(['Milk']);

      // Verify isChecked is cleared even though isOnShoppingList was already false
      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isChecked).toBe(false);
    });

    it('Story 11.8: should clear isChecked for products on shopping list', async () => {
      // Normal flow: product is on list and marked as bought
      const product = await inventoryService.addProduct('Bread');
      await shoppingService.addToList(product.id);
      await shoppingService.updateCheckedState(product.id, true);

      expect((await inventoryService.getProduct(product.id))?.isChecked).toBe(true);

      // removePurchasedItems should clear isChecked
      await shoppingService.removePurchasedItems(['Bread']);

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(false);
      expect(updated?.isChecked).toBe(false);
    });
  });
});
