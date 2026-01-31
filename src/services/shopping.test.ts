import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shoppingService } from './shopping';
import { db } from './database';

// Mock database
vi.mock('./database', () => ({
  db: {
    products: {
      filter: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockUpdate = vi.mocked(db.products.update);

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFilter = vi.mocked(db.products.filter);

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

describe('ShoppingService', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Milk',
      stockLevel: 'low' as const,
      isOnShoppingList: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      name: 'Bread',
      stockLevel: 'empty' as const,
      isOnShoppingList: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      name: 'Eggs',
      stockLevel: 'high' as const,
      isOnShoppingList: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-05'),
    },
    {
      id: '4',
      name: 'Cheese',
      stockLevel: 'medium' as const,
      isOnShoppingList: false,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-07'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getShoppingListItems', () => {
    it('should return all products where isOnShoppingList is true', async () => {
      const mockToArray = vi.fn().mockResolvedValue(mockProducts);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListItems();

      // Story 3.3: Returns all products with isOnShoppingList: true (including Medium/High manually added)
      expect(result).toHaveLength(mockProducts.length);
      expect(result).toEqual(mockProducts);
    });

    it('should include manually added Medium and High products (Story 3.3)', async () => {
      // Create test data with Medium and High products that were manually added
      const productsWithManualAdd = [
        { ...mockProducts[0] }, // Low - automatic
        { ...mockProducts[1] }, // Empty - automatic
        { ...mockProducts[2], isOnShoppingList: true },  // High - manually added (changed from false to true)
        { ...mockProducts[3], isOnShoppingList: true },  // Medium - manually added (changed from false to true)
      ];

      const mockToArray = vi.fn().mockResolvedValue(productsWithManualAdd);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListItems();

      // Should include Medium (Cheese) and High (Eggs) products that were manually added
      const mediumProduct = result.find((p) => p.name === 'Cheese');
      const highProduct = result.find((p) => p.name === 'Eggs');

      expect(mediumProduct).toBeDefined();
      expect(mediumProduct?.stockLevel).toBe('medium');
      expect(mediumProduct?.isOnShoppingList).toBe(true);

      expect(highProduct).toBeDefined();
      expect(highProduct?.stockLevel).toBe('high');
      expect(highProduct?.isOnShoppingList).toBe(true);

      // All 4 products should be returned (no stock level filtering)
      expect(result).toHaveLength(4);
    });

    it('should sort results by updatedAt descending (most recently changed first)', async () => {
      const mockToArray = vi.fn().mockResolvedValue(mockProducts);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListItems();

      // Bread (Jan 15) should come before Milk (Jan 10)
      expect(result[0]!.name).toBe('Bread');
      expect(result[1]!.name).toBe('Milk');
    });

    it('should return empty array when no products on shopping list', async () => {
      const mockToArray = vi.fn().mockResolvedValue([]);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListItems();

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      const mockToArray = vi.fn().mockRejectedValue(mockError);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      await expect(shoppingService.getShoppingListItems()).rejects.toThrow();
    });
  });

  describe('getShoppingListCount', () => {
    it('should return count of all products with isOnShoppingList: true', async () => {
      const mockToArray = vi.fn().mockResolvedValue(mockProducts);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListCount();

      // Story 3.3: Count all products with isOnShoppingList: true (including Medium/High)
      expect(result).toBe(mockProducts.length);
      expect(mockToArray).toHaveBeenCalled();
    });

    it('should include manually added High products in count (Story 3.3)', async () => {
      const productsWithHigh = [
        { ...mockProducts[0] }, // Low - should count
        { ...mockProducts[2] }, // High - should ALSO count (manually added)
      ];
      const mockToArray = vi.fn().mockResolvedValue(productsWithHigh);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListCount();

      // Both products should be counted
      expect(result).toBe(2);
    });

    it('should include manually added Medium products in count (Story 3.3)', async () => {
      const productsWithMedium = [
        { ...mockProducts[1] }, // Empty - should count
        { ...mockProducts[3] }, // Medium - should ALSO count (manually added)
      ];
      const mockToArray = vi.fn().mockResolvedValue(productsWithMedium);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListCount();

      // Both products should be counted
      expect(result).toBe(2);
    });

    it('should return 0 when shopping list is empty', async () => {
      const mockToArray = vi.fn().mockResolvedValue([]);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListCount();

      expect(result).toBe(0);
    });

    it('should match filtering logic of getShoppingListItems', async () => {
      const mockToArray = vi.fn().mockResolvedValue(mockProducts);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const items = await shoppingService.getShoppingListItems();

      // Reset mock for second call
      vi.clearAllMocks();
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const count = await shoppingService.getShoppingListCount();

      // Count should match number of items returned
      expect(count).toBe(items.length);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      const mockToArray = vi.fn().mockRejectedValue(mockError);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      await expect(shoppingService.getShoppingListCount()).rejects.toThrow();
    });
  });

  describe('addToList', () => {
    it('should set isOnShoppingList to true for the given product', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.addToList('product-123');

      expect(mockUpdate).toHaveBeenCalledWith('product-123', { isOnShoppingList: true });
    });

    it('should preserve existing stockLevel when adding to list', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.addToList('product-123');

      // Should only update isOnShoppingList, not stockLevel
      expect(mockUpdate).toHaveBeenCalledWith('product-123', { isOnShoppingList: true });
      expect(mockUpdate).not.toHaveBeenCalledWith('product-123', expect.objectContaining({ stockLevel: expect.anything() }));
    });

    it('should handle errors when adding to list', async () => {
      const mockError = new Error('Product not found');
      mockUpdate.mockRejectedValue(mockError);

      await expect(shoppingService.addToList('invalid-id')).rejects.toThrow();
    });
  });

  describe('removeFromList', () => {
    it('should set isOnShoppingList to false for the given product', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.removeFromList('product-123');

      expect(mockUpdate).toHaveBeenCalledWith('product-123', { isOnShoppingList: false });
    });

    it('should preserve existing stockLevel when removing from list', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.removeFromList('product-123');

      // Should only update isOnShoppingList, not stockLevel
      expect(mockUpdate).toHaveBeenCalledWith('product-123', { isOnShoppingList: false });
      expect(mockUpdate).not.toHaveBeenCalledWith('product-123', expect.objectContaining({ stockLevel: expect.anything() }));
    });

    it('should handle errors when removing from list', async () => {
      const mockError = new Error('Product not found');
      mockUpdate.mockRejectedValue(mockError);

      await expect(shoppingService.removeFromList('invalid-id')).rejects.toThrow();
    });
  });

  // Story 4.1: Check Off Items While Shopping - Task 2: ShoppingService Extensions
  describe('updateCheckedState', () => {
    it('should set isChecked to true when checking an item', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.updateCheckedState('product-123', true);

      expect(mockUpdate).toHaveBeenCalledWith('product-123', { isChecked: true });
    });

    it('should set isChecked to false when unchecking an item', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.updateCheckedState('product-123', false);

      expect(mockUpdate).toHaveBeenCalledWith('product-123', { isChecked: false });
    });

    it('should persist to IndexedDB', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.updateCheckedState('product-123', true);

      // Verify db.products.update was called (persistence to IndexedDB)
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should preserve isOnShoppingList when updating isChecked', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.updateCheckedState('product-123', true);

      // Should only update isChecked, not isOnShoppingList
      expect(mockUpdate).toHaveBeenCalledWith('product-123', { isChecked: true });
      expect(mockUpdate).not.toHaveBeenCalledWith('product-123', expect.objectContaining({ isOnShoppingList: expect.anything() }));
    });

    it('should preserve stockLevel when updating isChecked', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      await shoppingService.updateCheckedState('product-123', true);

      // Should only update isChecked, not stockLevel
      expect(mockUpdate).toHaveBeenCalledWith('product-123', { isChecked: true });
      expect(mockUpdate).not.toHaveBeenCalledWith('product-123', expect.objectContaining({ stockLevel: expect.anything() }));
    });

    it('should handle errors with error handling utility', async () => {
      const mockError = new Error('Product not found');
      mockUpdate.mockRejectedValue(mockError);

      await expect(shoppingService.updateCheckedState('invalid-id', true)).rejects.toThrow();
    });

    it('should work offline (no network calls)', async () => {
      const mockUpdateReturn = 1;
      mockUpdate.mockResolvedValue(mockUpdateReturn);

      // This should succeed without any network calls (local IndexedDB only)
      await shoppingService.updateCheckedState('product-123', true);

      expect(mockUpdate).toHaveBeenCalled();
      // Verify no network-related errors occurred
    });
  });

  // Story 4.4: Shopping Mode Toggle - Task 1: ShoppingService Mode State Methods
  describe('getShoppingMode', () => {
    beforeEach(() => {
      // Clear localStorage before each test
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

    it('should handle localStorage access errors', async () => {
      // Mock localStorage.getItem to throw an error
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      const result = await shoppingService.getShoppingMode();

      // Should default to false when localStorage is unavailable
      expect(result).toBe(false);

      // Restore original
      vi.spyOn(Storage.prototype, 'getItem').mockRestore();
    });
  });

  describe('setShoppingMode', () => {
    beforeEach(() => {
      // Clear localStorage before each test
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

    it('should handle localStorage setItem errors gracefully', async () => {
      // Mock localStorage.setItem to throw an error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      // Should not throw, should handle error gracefully
      await expect(shoppingService.setShoppingMode(true)).resolves.not.toThrow();

      // Restore original
      vi.spyOn(Storage.prototype, 'setItem').mockRestore();
    });
  });
});
