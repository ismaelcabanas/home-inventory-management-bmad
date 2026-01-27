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
      // Setup mock chain
      const mockSort = vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockProducts),
      });
      mockFilter.mockReturnValue({ sort: mockSort } as unknown);

      const result = await shoppingService.getShoppingListItems();

      // Should filter to only Low and Empty (defensive programming)
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.stockLevel === 'low' || p.stockLevel === 'empty')).toBe(true);
      expect(result).toEqual([mockProducts[0], mockProducts[1]]);
    });

    it('should exclude High and Medium products from results', async () => {
      const mockSort = vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockProducts),
      });
      mockFilter.mockReturnValue({ sort: mockSort } as unknown);

      const result = await shoppingService.getShoppingListItems();

      const highMediumProducts = result.filter(
        (p) => p.stockLevel === 'high' || p.stockLevel === 'medium'
      );
      expect(highMediumProducts).toHaveLength(0);
    });

    it('should sort results by updatedAt descending (most recently changed first)', async () => {
      const mockSort = vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockProducts),
      });
      mockFilter.mockReturnValue({ sort: mockSort } as unknown);

      await shoppingService.getShoppingListItems();

      // Check sort was called with proper comparator
      expect(mockSort).toHaveBeenCalled();
      const sortCallback = mockSort.mock.calls[0][0];
      // For descending order: Bread (Jan 15) should come before Milk (Jan 10)
      // So when comparing Milk vs Bread, should return positive (Milk comes after Bread)
      expect(sortCallback(mockProducts[0], mockProducts[1])).toBeGreaterThan(0);
    });

    it('should return empty array when no products on shopping list', async () => {
      const mockSort = vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      });
      mockFilter.mockReturnValue({ sort: mockSort } as unknown);

      const result = await shoppingService.getShoppingListItems();

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      const mockSort = vi.fn().mockReturnValue({
        toArray: vi.fn().mockRejectedValue(mockError),
      });
      mockFilter.mockReturnValue({ sort: mockSort } as unknown);

      await expect(shoppingService.getShoppingListItems()).rejects.toThrow();
    });
  });

  describe('getShoppingListCount', () => {
    it('should return count of products on shopping list', async () => {
      const mockCount = vi.fn().mockResolvedValue(3);
      mockFilter.mockReturnValue({ count: mockCount } as unknown);

      const result = await shoppingService.getShoppingListCount();

      expect(result).toBe(3);
      expect(mockCount).toHaveBeenCalled();
    });

    it('should return 0 when shopping list is empty', async () => {
      const mockCount = vi.fn().mockResolvedValue(0);
      mockFilter.mockReturnValue({ count: mockCount } as unknown);

      const result = await shoppingService.getShoppingListCount();

      expect(result).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      const mockCount = vi.fn().mockRejectedValue(mockError);
      mockFilter.mockReturnValue({ count: mockCount } as unknown);

      await expect(shoppingService.getShoppingListCount()).rejects.toThrow();
    });
  });
});
