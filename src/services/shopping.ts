import { db } from './database';
import type { Product } from '@/types/product';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

export class ShoppingService {
  async getShoppingListItems(): Promise<Product[]> {
    try {
      logger.debug('Fetching shopping list items from database');

      // Query products where isOnShoppingList is true
      const items = await db.products
        .filter((product) => product.isOnShoppingList === true)
        .toArray();

      // Sort by updatedAt descending (most recently changed first)
      items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      // Defensive: Double-check stock level (in case DB inconsistency)
      const filteredItems = items.filter(
        (product) => product.stockLevel === 'low' || product.stockLevel === 'empty'
      );

      logger.info('Shopping list items loaded', { count: filteredItems.length });
      return filteredItems;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to load shopping list items', appError.details);
      throw appError;
    }
  }

  async getShoppingListCount(): Promise<number> {
    try {
      // Query products where isOnShoppingList is true
      const items = await db.products
        .filter((product) => product.isOnShoppingList === true)
        .toArray();

      // Defensive: Double-check stock level (in case DB inconsistency)
      // Must match the filtering logic in getShoppingListItems()
      const filteredItems = items.filter(
        (product) => product.stockLevel === 'low' || product.stockLevel === 'empty'
      );

      const count = filteredItems.length;

      logger.debug('Shopping list count', { count });
      return count;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to get shopping list count', appError.details);
      throw appError;
    }
  }
}

// Export singleton instance
export const shoppingService = new ShoppingService();
