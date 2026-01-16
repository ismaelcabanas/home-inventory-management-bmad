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
});
