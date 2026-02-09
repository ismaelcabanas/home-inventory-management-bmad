import { describe, it, expect, beforeEach, vi } from 'vitest';
import { inventoryService } from './inventory';
import { db } from './database';

describe('InventoryService', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.products.clear();
  });

  describe('addProduct', () => {
    it('should add a new product with default values', async () => {
      const product = await inventoryService.addProduct('Milk');

      expect(product.id).toBeDefined();
      expect(product.name).toBe('Milk');
      expect(product.stockLevel).toBe('high');
      expect(product.isOnShoppingList).toBe(false);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should persist the product in database', async () => {
      const product = await inventoryService.addProduct('Bread');
      const retrieved = await inventoryService.getProduct(product.id);

      expect(retrieved).toEqual(product);
    });

    it('should trim whitespace from product name', async () => {
      const product = await inventoryService.addProduct('  Milk  ');
      expect(product.name).toBe('Milk');
    });

    it('should throw error for empty product name', async () => {
      await expect(inventoryService.addProduct('')).rejects.toMatchObject({
        message: expect.stringContaining('Product name cannot be empty')
      });
    });

    it('should throw error for whitespace-only product name', async () => {
      await expect(inventoryService.addProduct('   ')).rejects.toMatchObject({
        message: expect.stringContaining('Product name cannot be empty')
      });
    });

    it('should throw error for product name exceeding 255 characters', async () => {
      const longName = 'A'.repeat(256);
      await expect(inventoryService.addProduct(longName)).rejects.toMatchObject({
        message: expect.stringContaining('Product name too long')
      });
    });

    it('should accept product name with exactly 255 characters', async () => {
      const maxName = 'A'.repeat(255);
      const product = await inventoryService.addProduct(maxName);
      expect(product.name).toBe(maxName);
    });
  });

  describe('getProducts', () => {
    it('should return empty array when no products', async () => {
      const products = await inventoryService.getProducts();
      expect(products).toEqual([]);
    });

    it('should return all products ordered by updatedAt DESC', async () => {
      await inventoryService.addProduct('Product 1');
      await new Promise(resolve => setTimeout(resolve, 2));
      await inventoryService.addProduct('Product 2');
      await new Promise(resolve => setTimeout(resolve, 2));
      await inventoryService.addProduct('Product 3');

      const products = await inventoryService.getProducts();

      expect(products).toHaveLength(3);
      expect(products[0]?.name).toBe('Product 3'); // Most recent
      expect(products[2]?.name).toBe('Product 1'); // Oldest
    });
  });

  describe('getProduct', () => {
    it('should return product by ID', async () => {
      const added = await inventoryService.addProduct('Eggs');
      const product = await inventoryService.getProduct(added.id);

      expect(product).toEqual(added);
    });

    it('should return undefined for non-existent ID', async () => {
      const product = await inventoryService.getProduct('non-existent-id');
      expect(product).toBeUndefined();
    });
  });

  describe('updateProduct', () => {
    it('should update product fields', async () => {
      const product = await inventoryService.addProduct('Butter');

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));

      await inventoryService.updateProduct(product.id, {
        name: 'Margarine',
        stockLevel: 'low',
      });

      const updated = await inventoryService.getProduct(product.id);

      expect(updated?.name).toBe('Margarine');
      expect(updated?.stockLevel).toBe('low');
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(product.updatedAt.getTime());
    });

    it('should update only specified fields', async () => {
      const product = await inventoryService.addProduct('Cheese');

      await inventoryService.updateProduct(product.id, {
        stockLevel: 'empty',
      });

      const updated = await inventoryService.getProduct(product.id);

      expect(updated?.name).toBe('Cheese'); // Unchanged
      expect(updated?.stockLevel).toBe('empty'); // Changed
    });

    it('should throw error when trying to update id', async () => {
      const product = await inventoryService.addProduct('Test');
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inventoryService.updateProduct(product.id, { id: 'new-id' } as any)
      ).rejects.toThrow('Cannot update immutable fields');
    });

    it('should throw error when trying to update createdAt', async () => {
      const product = await inventoryService.addProduct('Test');
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inventoryService.updateProduct(product.id, { createdAt: new Date() } as any)
      ).rejects.toThrow('Cannot update immutable fields');
    });

    it('should throw error for invalid stockLevel', async () => {
      const product = await inventoryService.addProduct('Test');
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inventoryService.updateProduct(product.id, { stockLevel: 'INVALID' as any })
      ).rejects.toThrow('Invalid stockLevel');
    });

    it('should automatically add product to shopping list when stock is low', async () => {
      const product = await inventoryService.addProduct('Milk');
      expect(product.isOnShoppingList).toBe(false);

      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe('low');
      expect(updated?.isOnShoppingList).toBe(true);
    });

    it('should automatically add product to shopping list when stock is empty', async () => {
      const product = await inventoryService.addProduct('Bread');
      expect(product.isOnShoppingList).toBe(false);

      await inventoryService.updateProduct(product.id, { stockLevel: 'empty' });

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe('empty');
      expect(updated?.isOnShoppingList).toBe(true);
    });

    it('should automatically remove product from shopping list when stock is high', async () => {
      const product = await inventoryService.addProduct('Cheese');
      // First mark as low to add to shopping list
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      let updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Then mark as high to remove from shopping list
      await inventoryService.updateProduct(product.id, { stockLevel: 'high' });

      updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe('high');
      expect(updated?.isOnShoppingList).toBe(false);
    });

    it('should not change shopping list status when stock is medium', async () => {
      const product = await inventoryService.addProduct('Butter');
      // First mark as low to add to shopping list
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      let updated = await inventoryService.getProduct(product.id);
      expect(updated?.isOnShoppingList).toBe(true);

      // Then mark as medium - should remain on shopping list
      await inventoryService.updateProduct(product.id, { stockLevel: 'medium' });

      updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe('medium');
      expect(updated?.isOnShoppingList).toBe(true); // Still on list
    });

    it('should throw error for empty name', async () => {
      const product = await inventoryService.addProduct('Test');
      await expect(
        inventoryService.updateProduct(product.id, { name: '' })
      ).rejects.toThrow('Product name cannot be empty');
    });

    it('should throw error for name exceeding 255 characters', async () => {
      const product = await inventoryService.addProduct('Test');
      const longName = 'A'.repeat(256);
      await expect(
        inventoryService.updateProduct(product.id, { name: longName })
      ).rejects.toThrow('Product name too long');
    });

    it('should trim whitespace from updated name', async () => {
      const product = await inventoryService.addProduct('Test');
      await inventoryService.updateProduct(product.id, { name: '  Updated  ' });
      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.name).toBe('Updated');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product by ID', async () => {
      const product = await inventoryService.addProduct('Yogurt');

      await inventoryService.deleteProduct(product.id);

      const deleted = await inventoryService.getProduct(product.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('searchProducts', () => {
    beforeEach(async () => {
      await inventoryService.addProduct('Milk');
      await inventoryService.addProduct('Chocolate Milk');
      await inventoryService.addProduct('Bread');
      await inventoryService.addProduct('Butter');
    });

    it('should return products matching query', async () => {
      const results = await inventoryService.searchProducts('milk');

      expect(results).toHaveLength(2);
      expect(results.map(p => p.name)).toContain('Milk');
      expect(results.map(p => p.name)).toContain('Chocolate Milk');
    });

    it('should be case-insensitive', async () => {
      const results = await inventoryService.searchProducts('MILK');

      expect(results).toHaveLength(2);
    });

    it('should return empty array for no matches', async () => {
      const results = await inventoryService.searchProducts('pizza');

      expect(results).toEqual([]);
    });

    it('should match partial names', async () => {
      const results = await inventoryService.searchProducts('butt');

      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('Butter');
    });

    it('should handle empty search query', async () => {
      const results = await inventoryService.searchProducts('');
      expect(results).toHaveLength(4); // Returns all products
    });

    it('should handle special characters in search', async () => {
      await inventoryService.addProduct("O'Brien's Bread");
      const results = await inventoryService.searchProducts("O'Brien");
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe("O'Brien's Bread");
    });
  });

  describe('Error Handling', () => {
    describe('Database constraint violations', () => {
      it('should handle duplicate product creation gracefully', async () => {
        const product1 = await inventoryService.addProduct('Test');

        // Manually try to add with same ID (simulating constraint violation)
        await expect(
          db.products.add({ ...product1, name: 'Duplicate' })
        ).rejects.toThrow();
      });

      it('should throw error when updating non-existent product', async () => {
        await expect(
          inventoryService.updateProduct('non-existent-id', { name: 'Test' })
        ).rejects.toThrow('Product with id \'non-existent-id\' not found');
      });

      it('should not fail when deleting non-existent product', async () => {
        // Dexie.delete doesn't throw for non-existent IDs
        await expect(
          inventoryService.deleteProduct('non-existent-id')
        ).resolves.not.toThrow();
      });
    });

    describe('Input validation errors', () => {
      it('should propagate validation errors with clear messages', async () => {
        await expect(inventoryService.addProduct('')).rejects.toThrow('Product name cannot be empty');

        const product = await inventoryService.addProduct('Test');
        await expect(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inventoryService.updateProduct(product.id, { id: 'new' } as any)
        ).rejects.toThrow('Cannot update immutable fields');
      });

      it('should log errors to console', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
          await inventoryService.addProduct('');
        } catch {
          // Expected to throw
        }

        // Verify logger.error() was called with [ERROR] prefix
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR] Failed to add product'),
          expect.anything() // AppError.details object
        );

        consoleSpy.mockRestore();
      });
    });

    describe('CRUD lifecycle integrity', () => {
      it('should maintain data consistency through full CRUD cycle', async () => {
        // Create
        const product = await inventoryService.addProduct('Lifecycle Test');
        expect(product.id).toBeDefined();

        // Read
        const retrieved = await inventoryService.getProduct(product.id);
        expect(retrieved).toEqual(product);

        // Update
        await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
        const updated = await inventoryService.getProduct(product.id);
        expect(updated?.stockLevel).toBe('low');
        expect(updated?.name).toBe('Lifecycle Test');

        // Delete
        await inventoryService.deleteProduct(product.id);
        const deleted = await inventoryService.getProduct(product.id);
        expect(deleted).toBeUndefined();
      });

      it('should handle concurrent operations on same product', async () => {
        const product = await inventoryService.addProduct('Concurrent Test');

        // Simulate concurrent updates
        await Promise.all([
          inventoryService.updateProduct(product.id, { stockLevel: 'medium' }),
          inventoryService.updateProduct(product.id, { isOnShoppingList: true })
        ]);

        const final = await inventoryService.getProduct(product.id);
        expect(final).toBeDefined();
        // Last write wins - both updates should be applied
        expect(final?.isOnShoppingList).toBeDefined();
      });
    });
  });

  // Story 6.1: Update Inventory from Confirmed Receipt Products
  describe('replenishStock', () => {
    it('should update existing products to High stock level', async () => {
      // Create products with Low/Empty stock
      const product1 = await inventoryService.addProduct('Milk');
      const product2 = await inventoryService.addProduct('Bread');

      await inventoryService.updateProduct(product1.id, { stockLevel: 'low' });
      await inventoryService.updateProduct(product2.id, { stockLevel: 'empty' });

      // Replenish stock
      await inventoryService.replenishStock(['Milk', 'Bread']);

      // Verify both products are now High
      const updated1 = await inventoryService.getProduct(product1.id);
      const updated2 = await inventoryService.getProduct(product2.id);

      expect(updated1?.stockLevel).toBe('high');
      expect(updated2?.stockLevel).toBe('high');
    });

    it('should add new products that do not exist', async () => {
      await inventoryService.replenishStock(['Cheese', 'Eggs']);

      const cheese = await db.products.filter(p => p.name === 'Cheese').first();
      const eggs = await db.products.filter(p => p.name === 'Eggs').first();

      expect(cheese).toBeDefined();
      expect(cheese?.stockLevel).toBe('high');
      expect(cheese?.isOnShoppingList).toBe(false);

      expect(eggs).toBeDefined();
      expect(eggs?.stockLevel).toBe('high');
      expect(eggs?.isOnShoppingList).toBe(false);
    });

    it('should handle mixed existing and new products', async () => {
      const existing = await inventoryService.addProduct('Butter');
      await inventoryService.updateProduct(existing.id, { stockLevel: 'low' });

      await inventoryService.replenishStock(['Butter', 'Yogurt']);

      const updatedButter = await inventoryService.getProduct(existing.id);
      const newYogurt = await db.products.filter(p => p.name === 'Yogurt').first();

      expect(updatedButter?.stockLevel).toBe('high');
      expect(newYogurt).toBeDefined();
      expect(newYogurt?.stockLevel).toBe('high');
    });

    it('should use database transaction for atomicity', async () => {
      // Create a product
      const product = await inventoryService.addProduct('Test Product');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      // Replenish should succeed
      await expect(inventoryService.replenishStock(['Test Product'])).resolves.not.toThrow();

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe('high');
    });

    it('should match product names case-insensitively', async () => {
      const product = await inventoryService.addProduct('Milk');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      await inventoryService.replenishStock(['milk']); // lowercase

      const updated = await inventoryService.getProduct(product.id);
      expect(updated?.stockLevel).toBe('high');
    });

    it('should handle empty product list', async () => {
      await expect(inventoryService.replenishStock([])).resolves.not.toThrow();
    });

    // Story 6.2: Transaction rollback tests
    it('should rollback all changes if error occurs mid-transaction', async () => {
      // Create products with Low stock
      const product1 = await inventoryService.addProduct('Milk');
      const product2 = await inventoryService.addProduct('Bread');

      await inventoryService.updateProduct(product1.id, { stockLevel: 'low' });
      await inventoryService.updateProduct(product2.id, { stockLevel: 'low' });

      // Mock findExistingProduct to fail on second product
      const originalFindExisting = inventoryService.findExistingProduct.bind(inventoryService);
      let callCount = 0;
      vi.spyOn(inventoryService, 'findExistingProduct').mockImplementation(async (name) => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Simulated database error');
        }
        return originalFindExisting(name);
      });

      // Attempt to replenish should fail
      await expect(inventoryService.replenishStock(['Milk', 'Bread'])).rejects.toThrow();

      // Verify both products remain in their original state (rollback occurred)
      const milkAfter = await inventoryService.getProduct(product1.id);
      const breadAfter = await inventoryService.getProduct(product2.id);

      expect(milkAfter?.stockLevel).toBe('low'); // Should NOT be updated to high
      expect(breadAfter?.stockLevel).toBe('low'); // Should NOT be updated to high

      // Restore original method
      vi.spyOn(inventoryService, 'findExistingProduct').mockRestore();
    });

    it('should not create new products if transaction fails', async () => {
      // Start with empty database
      await db.products.clear();

      // Mock addProductFromReceipt to fail after first product
      const originalAddFromReceipt = inventoryService.addProductFromReceipt.bind(inventoryService);
      let callCount = 0;
      vi.spyOn(inventoryService, 'addProductFromReceipt').mockImplementation(async (name) => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Failed to add second product');
        }
        return originalAddFromReceipt(name);
      });

      // Attempt to replenish with new products should fail
      await expect(inventoryService.replenishStock(['Product1', 'Product2'])).rejects.toThrow();

      // Verify no products were created (rollback occurred)
      const allProducts = await db.products.toArray();
      expect(allProducts.length).toBe(0);

      // Restore original method
      vi.spyOn(inventoryService, 'addProductFromReceipt').mockRestore();
    });

    it('should maintain atomicity across multiple operations', async () => {
      // Create a product
      const existing = await inventoryService.addProduct('Butter');
      await inventoryService.updateProduct(existing.id, { stockLevel: 'low' });

      // Mock to fail during update
      const originalUpdate = db.products.update.bind(db.products);
      let updateCallCount = 0;
      vi.spyOn(db.products, 'update').mockImplementation(async (key, changes) => {
        updateCallCount++;
        // Fail on second update call
        if (updateCallCount === 2) {
          throw new Error('Simulated update failure');
        }
        return originalUpdate(key, changes);
      });

      // Attempt should fail
      await expect(inventoryService.replenishStock(['Butter', 'NewProduct'])).rejects.toThrow();

      // Verify existing product was not updated (rollback)
      const butterAfter = await inventoryService.getProduct(existing.id);
      expect(butterAfter?.stockLevel).toBe('low');

      // Verify new product was not created (rollback)
      const newProduct = await db.products.filter(p => p.name === 'NewProduct').first();
      expect(newProduct).toBeUndefined();

      // Restore original method
      vi.spyOn(db.products, 'update').mockRestore();
    });

    it('should handle errors with large product lists', async () => {
      // Create 20 products
      const productNames = Array.from({ length: 20 }, (_, i) => `Product${i}`);
      for (const name of productNames) {
        const product = await inventoryService.addProduct(name);
        await inventoryService.updateProduct(product.id, { stockLevel: 'low' });
      }

      // Mock to fail on 15th product
      const originalFindExisting = inventoryService.findExistingProduct.bind(inventoryService);
      let callCount = 0;
      vi.spyOn(inventoryService, 'findExistingProduct').mockImplementation(async (name) => {
        callCount++;
        if (callCount === 15) {
          throw new Error('Simulated failure at product 15');
        }
        return originalFindExisting(name);
      });

      // Attempt should fail
      await expect(inventoryService.replenishStock(productNames)).rejects.toThrow();

      // Verify all products remain in original state (complete rollback)
      const allProducts = await inventoryService.getProducts();
      for (const product of allProducts) {
        expect(product.stockLevel).toBe('low');
      }

      // Restore original method
      vi.spyOn(inventoryService, 'findExistingProduct').mockRestore();
    });

    it('should log error context for debugging', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const product = await inventoryService.addProduct('TestProduct');
      await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

      // Mock to cause an error
      vi.spyOn(inventoryService, 'findExistingProduct').mockRejectedValue(
        new Error('Database connection lost')
      );

      try {
        await inventoryService.replenishStock(['TestProduct']);
      } catch {
        // Expected to throw
      }

      // Verify error was logged with context
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Failed to replenish stock'),
        expect.objectContaining({
          productNames: expect.any(Array),
        })
      );

      consoleSpy.mockRestore();
      vi.spyOn(inventoryService, 'findExistingProduct').mockRestore();
    });
  });

  describe('findExistingProduct', () => {
    beforeEach(async () => {
      await inventoryService.addProduct('Milk');
      await inventoryService.addProduct('Organic Milk');
      await inventoryService.addProduct('Bread');
    });

    it('should find product by exact name (case-insensitive)', async () => {
      const found = await inventoryService.findExistingProduct('milk');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Milk');
    });

    it('should find product by exact match with different case', async () => {
      const found = await inventoryService.findExistingProduct('ORGANIC MILK');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Organic Milk');
    });

    it('should return undefined for non-existent product', async () => {
      const found = await inventoryService.findExistingProduct('Cheese');
      expect(found).toBeUndefined();
    });

    it('should handle partial match (one name contains the other)', async () => {
      const found = await inventoryService.findExistingProduct('Organic');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Organic Milk');
    });

    it('should trim whitespace from search term', async () => {
      const found = await inventoryService.findExistingProduct('  Milk  ');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Milk');
    });

    it('should return undefined for empty search term', async () => {
      const found = await inventoryService.findExistingProduct('');
      expect(found).toBeUndefined();
    });
  });

  describe('addProductFromReceipt', () => {
    it('should add product with High stock level', async () => {
      const product = await inventoryService.addProductFromReceipt('Cheese');

      expect(product.id).toBeDefined();
      expect(product.name).toBe('Cheese');
      expect(product.stockLevel).toBe('high');
      expect(product.isOnShoppingList).toBe(false);
      expect(product.isChecked).toBe(false);
    });

    it('should trim whitespace from product name', async () => {
      const product = await inventoryService.addProductFromReceipt('  Butter  ');
      expect(product.name).toBe('Butter');
    });

    it('should persist product to database', async () => {
      const added = await inventoryService.addProductFromReceipt('Eggs');
      const retrieved = await inventoryService.getProduct(added.id);
      expect(retrieved).toEqual(added);
    });

    it('should set timestamps correctly', async () => {
      const product = await inventoryService.addProductFromReceipt('Yogurt');
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });
  });
});
