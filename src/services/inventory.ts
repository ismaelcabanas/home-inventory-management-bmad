import { db } from './database';
import type { Product } from '@/types/product';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

export class InventoryService {
  async getProducts(): Promise<Product[]> {
    try {
      logger.debug('Fetching all products from database');
      const products = await db.products.orderBy('updatedAt').reverse().toArray();
      logger.info('Products loaded successfully', { count: products.length });
      return products;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to load products', appError.details);
      throw appError;
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      logger.debug('Fetching product', { id });
      const product = await db.products.get(id);
      if (product) {
        logger.info('Product found', { id, name: product.name });
      } else {
        logger.warn('Product not found', { id });
      }
      return product;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to get product', appError.details);
      throw appError;
    }
  }

  async addProduct(name: string): Promise<Product> {
    try {
      logger.debug('Adding new product', { name });

      // Validate product name
      if (!name || name.trim().length === 0) {
        throw new Error('Product name cannot be empty');
      }

      if (name.length > 255) {
        throw new Error('Product name too long (max 255 characters)');
      }

      const product: Product = {
        id: crypto.randomUUID(),
        name: name.trim(),
        stockLevel: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnShoppingList: false,
        isChecked: false, // Story 4.1: Add isChecked field
      };

      await db.products.add(product);
      logger.info('Product added successfully', { id: product.id, name: product.name });
      return product;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to add product', appError.details);
      throw appError;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      logger.debug('Updating product', { id, updates });

      // Check if product exists
      const existing = await db.products.get(id);
      if (!existing) {
        throw new Error(`Product with id '${id}' not found`);
      }

      // Validate that immutable fields are not being updated
      if ('id' in updates || 'createdAt' in updates) {
        throw new Error('Cannot update immutable fields: id, createdAt');
      }

      // Validate stockLevel if provided
      if (updates.stockLevel) {
        const validLevels: string[] = ['high', 'medium', 'low', 'empty'];
        if (!validLevels.includes(updates.stockLevel)) {
          throw new Error(`Invalid stockLevel: ${updates.stockLevel}. Must be one of: ${validLevels.join(', ')}`);
        }
      }

      // Validate name if provided
      if (updates.name !== undefined) {
        if (!updates.name || updates.name.trim().length === 0) {
          throw new Error('Product name cannot be empty');
        }
        if (updates.name.length > 255) {
          throw new Error('Product name too long (max 255 characters)');
        }
        updates.name = updates.name.trim();
      }

      // Automatic shopping list management (FR11, FR12)
      // When stock level changes to low/empty, add to shopping list
      // When stock level changes to high, remove from shopping list
      const finalUpdates = { ...updates };
      if (updates.stockLevel) {
        if (updates.stockLevel === 'low' || updates.stockLevel === 'empty') {
          finalUpdates.isOnShoppingList = true;
        } else if (updates.stockLevel === 'high') {
          finalUpdates.isOnShoppingList = false;
        }
      }

      await db.products.update(id, {
        ...finalUpdates,
        updatedAt: new Date(),
      });
      logger.info('Product updated successfully', { id, updates: finalUpdates });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to update product', appError.details);
      throw appError;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      logger.debug('Deleting product', { id });
      await db.products.delete(id);
      logger.info('Product deleted successfully', { id });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to delete product', appError.details);
      throw appError;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      logger.debug('Searching products', { query });
      const lowerQuery = query.toLowerCase();
      const results = await db.products
        .filter((product) => product.name.toLowerCase().includes(lowerQuery))
        .toArray();
      logger.info('Product search completed', { query, count: results.length });
      return results;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to search products', appError.details);
      throw appError;
    }
  }

  // Story 6.1: Update Inventory from Confirmed Receipt Products
  async replenishStock(productNames: string[]): Promise<void> {
    try {
      logger.debug('Replenishing stock for products', { productNames });

      await db.transaction('rw', db.products, async () => {
        for (const name of productNames) {
          const existing = await this.findExistingProduct(name);

          if (existing) {
            // Update existing product to High
            await db.products.update(existing.id!, {
              stockLevel: 'high',
              updatedAt: new Date(),
              isOnShoppingList: false, // Remove from shopping list when replenished
            });
            logger.info(`Updated product to High: ${name}`);
          } else {
            // Add new product
            await this.addProductFromReceipt(name);
          }
        }
      });

      logger.info('Stock replenishment completed', { count: productNames.length });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to replenish stock', appError.details);
      throw appError;
    }
  }

  async findExistingProduct(name: string): Promise<Product | undefined> {
    try {
      const normalized = name.toLowerCase().trim();

      // Handle empty search term
      if (!normalized) {
        return undefined;
      }

      // Try exact match first
      const product = await db.products
        .filter((p) => p.name.toLowerCase().trim() === normalized)
        .first();

      if (product) return product;

      // Try partial match (one name contains the other)
      const allProducts = await db.products.toArray();
      return allProducts.find((p) => {
        const pName = p.name.toLowerCase().trim();
        return pName.includes(normalized) || normalized.includes(pName);
      });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to find existing product', appError.details);
      throw appError;
    }
  }

  async addProductFromReceipt(name: string): Promise<Product> {
    try {
      logger.debug('Adding product from receipt', { name });

      // Validate product name
      if (!name || name.trim().length === 0) {
        throw new Error('Product name cannot be empty');
      }

      if (name.length > 255) {
        throw new Error('Product name too long (max 255 characters)');
      }

      const product: Product = {
        id: crypto.randomUUID(),
        name: name.trim(),
        stockLevel: 'high',
        isOnShoppingList: false,
        isChecked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.products.add(product);
      logger.info('Product added from receipt', { id: product.id, name: product.name });
      return product;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to add product from receipt', appError.details);
      throw appError;
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
