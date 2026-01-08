import { db } from './database';
import type { Product } from '@/types/product';

export class InventoryService {
  async getProducts(): Promise<Product[]> {
    try {
      // Return products ordered by most recently updated first
      return await db.products.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error('[InventoryService] Error getting products:', error);
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      return await db.products.get(id);
    } catch (error) {
      console.error('[InventoryService] Error getting product:', error);
      throw error;
    }
  }

  async addProduct(name: string): Promise<Product> {
    try {
      const product: Product = {
        id: crypto.randomUUID(),
        name,
        stockLevel: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnShoppingList: false,
      };

      await db.products.add(product);
      return product;
    } catch (error) {
      console.error('[InventoryService] Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      await db.products.update(id, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('[InventoryService] Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await db.products.delete(id);
    } catch (error) {
      console.error('[InventoryService] Error deleting product:', error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return await db.products
        .filter((product) => product.name.toLowerCase().includes(lowerQuery))
        .toArray();
    } catch (error) {
      console.error('[InventoryService] Error searching products:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
