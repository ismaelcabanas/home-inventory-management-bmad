import { db } from './database';
import type { Product } from '@/types/product';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

export class ShoppingService {
  async getShoppingListItems(): Promise<Product[]> {
    try {
      logger.debug('Fetching shopping list items from database');

      // Query products where isOnShoppingList is true
      // Story 3.3: Manual add allows Medium/High products, so NO stock level filtering here
      const items = await db.products
        .filter((product) => product.isOnShoppingList === true)
        .toArray();

      // Sort by updatedAt descending (most recently changed first)
      items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      logger.info('Shopping list items loaded', { count: items.length });
      return items;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to load shopping list items', appError.details);
      throw appError;
    }
  }

  async getShoppingListCount(): Promise<number> {
    try {
      // Query products where isOnShoppingList is true
      // Story 3.3: Manual add allows Medium/High products, so NO stock level filtering here
      // Must match the logic in getShoppingListItems()
      const items = await db.products
        .filter((product) => product.isOnShoppingList === true)
        .toArray();

      const count = items.length;

      logger.debug('Shopping list count', { count });
      return count;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to get shopping list count', appError.details);
      throw appError;
    }
  }

  async addToList(productId: string): Promise<void> {
    try {
      logger.debug('Adding product to shopping list', { productId });

      // Directly set isOnShoppingList to true without modifying stockLevel
      await db.products.update(productId, { isOnShoppingList: true });

      logger.info('Product added to shopping list', { productId });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to add product to shopping list', appError.details);
      throw appError;
    }
  }

  async removeFromList(productId: string): Promise<void> {
    try {
      logger.debug('Removing product from shopping list', { productId });

      // Directly set isOnShoppingList to false without modifying stockLevel
      await db.products.update(productId, { isOnShoppingList: false });

      logger.info('Product removed from shopping list', { productId });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to remove product from shopping list', appError.details);
      throw appError;
    }
  }

  // Story 4.1: Check Off Items While Shopping - updateCheckedState method
  async updateCheckedState(productId: string, isChecked: boolean): Promise<void> {
    try {
      logger.debug('Updating product checked state', { productId, isChecked });

      // Update only the isChecked flag
      // Does NOT modify isOnShoppingList (checked items stay on list)
      // Does NOT modify stockLevel
      await db.products.update(productId, { isChecked });

      logger.info('Product checked state updated', { productId, isChecked });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to update product checked state', appError.details);
      throw appError;
    }
  }

  // Story 4.4: Shopping Mode Toggle - Shopping Mode state management
  private readonly SHOPPING_MODE_KEY = 'shoppingMode';

  async getShoppingMode(): Promise<boolean> {
    try {
      const storedValue = localStorage.getItem(this.SHOPPING_MODE_KEY);

      // Default to false if not set (Planning Mode is default)
      if (storedValue === null) {
        logger.debug('Shopping mode not set, defaulting to false');
        return false;
      }

      // Parse and return boolean value
      const mode = storedValue === 'true';
      logger.debug('Shopping mode state retrieved', { mode });
      return mode;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to get shopping mode state', appError.details);
      // Default to false on error (safer default - Planning Mode)
      return false;
    }
  }

  async setShoppingMode(mode: boolean): Promise<void> {
    try {
      logger.debug('Setting shopping mode state', { mode });

      // Store as string in localStorage
      localStorage.setItem(this.SHOPPING_MODE_KEY, mode.toString());

      logger.info('Shopping mode state updated', { mode });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to set shopping mode state', appError.details);
      throw appError;
    }
  }
}

// Export singleton instance
export const shoppingService = new ShoppingService();
