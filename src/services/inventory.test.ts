import { describe, it, expect, beforeEach } from 'vitest';
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
      await expect(inventoryService.addProduct('')).rejects.toThrow('Product name cannot be empty');
    });

    it('should throw error for whitespace-only product name', async () => {
      await expect(inventoryService.addProduct('   ')).rejects.toThrow('Product name cannot be empty');
    });

    it('should throw error for product name exceeding 255 characters', async () => {
      const longName = 'A'.repeat(256);
      await expect(inventoryService.addProduct(longName)).rejects.toThrow('Product name too long');
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
  });
});
