import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shoppingService } from './shopping';
import { db } from './database';

// Mock database
vi.mock('./database', () => ({
  db: {
    products: {
      filter: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFilter = vi.mocked(db.products.filter);

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
    it('should return only Low and Empty products from shopping list', async () => {
      const mockToArray = vi.fn().mockResolvedValue(mockProducts);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListItems();

      // Should filter to only Low and Empty (defensive programming)
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.stockLevel === 'low' || p.stockLevel === 'empty')).toBe(true);
      expect(result).toEqual([mockProducts[0], mockProducts[1]]);
    });

    it('should exclude High and Medium products from results', async () => {
      const mockToArray = vi.fn().mockResolvedValue(mockProducts);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListItems();

      const highMediumProducts = result.filter(
        (p) => p.stockLevel === 'high' || p.stockLevel === 'medium'
      );
      expect(highMediumProducts).toHaveLength(0);
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
    it('should return count of Low and Empty products only (defensive filtering)', async () => {
      // Mock returns all products, but only Low/Empty should be counted
      const mockToArray = vi.fn().mockResolvedValue(mockProducts);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListCount();

      // Should count only Low (Milk) and Empty (Bread) = 2
      expect(result).toBe(2);
      expect(mockToArray).toHaveBeenCalled();
    });

    it('should exclude High products from count (Story 3.2 - auto-removal)', async () => {
      const productsWithHigh = [
        { ...mockProducts[0] }, // Low - should count
        { ...mockProducts[2] }, // High - should NOT count
      ];
      const mockToArray = vi.fn().mockResolvedValue(productsWithHigh);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListCount();

      // Only Low product should be counted
      expect(result).toBe(1);
    });

    it('should exclude Medium products from count', async () => {
      const productsWithMedium = [
        { ...mockProducts[1] }, // Empty - should count
        { ...mockProducts[3] }, // Medium - should NOT count
      ];
      const mockToArray = vi.fn().mockResolvedValue(productsWithMedium);
      mockFilter.mockReturnValue({
        toArray: mockToArray,
      } as never);

      const result = await shoppingService.getShoppingListCount();

      // Only Empty product should be counted
      expect(result).toBe(1);
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
});
