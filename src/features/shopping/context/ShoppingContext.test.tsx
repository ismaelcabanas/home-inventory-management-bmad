import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ShoppingProvider, useShoppingList } from './ShoppingContext';
import { shoppingService } from '@/services/shopping';
import React from 'react';
import type { Product } from '@/types/product';

// Mock dependencies
vi.mock('@/services/shopping', () => ({
  shoppingService: {
    getShoppingListItems: vi.fn(),
    getShoppingListCount: vi.fn(),
    addToList: vi.fn(),
    removeFromList: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mockShoppingService = vi.mocked(shoppingService);

describe('ShoppingContext', () => {
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
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ShoppingProvider>{children}</ShoppingProvider>
  );

  describe('ShoppingProvider', () => {
    it('should render children without errors', () => {
      const { result } = renderHook(() => useShoppingList(), { wrapper });

      expect(result.current).toBeDefined();
    });
  });

  describe('useShoppingList hook', () => {
    it('should return correct context value structure', () => {
      const { result } = renderHook(() => useShoppingList(), { wrapper });

      expect(result.current).toHaveProperty('state');
      expect(result.current).toHaveProperty('loadShoppingList');
      expect(result.current).toHaveProperty('refreshCount');
      expect(result.current).toHaveProperty('clearError');
    });

    it('should have initial state with empty items, no loading, no error, and count 0', () => {
      const { result } = renderHook(() => useShoppingList(), { wrapper });

      expect(result.current.state.items).toEqual([]);
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.count).toBe(0);
    });

    it('should throw error when used outside ShoppingProvider', () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useShoppingList());
      }).toThrow('useShoppingList must be used within a ShoppingProvider');

      console.error = consoleError;
    });

    it('should expose addToList and removeFromList methods', () => {
      const { result } = renderHook(() => useShoppingList(), { wrapper });

      expect(result.current).toHaveProperty('addToList');
      expect(result.current).toHaveProperty('removeFromList');
      expect(typeof result.current.addToList).toBe('function');
      expect(typeof result.current.removeFromList).toBe('function');
    });
  });

  describe('loadShoppingList', () => {
    it('should fetch and set items from shoppingService', async () => {
      mockShoppingService.getShoppingListItems.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        await result.current.loadShoppingList();
      });

      expect(result.current.state.items).toEqual(mockProducts);
      expect(result.current.state.count).toBe(2);
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.error).toBeNull();
    });

    it('should set loading state correctly during fetch', async () => {
      mockShoppingService.getShoppingListItems.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockProducts), 10))
      );

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      act(() => {
        result.current.loadShoppingList();
      });

      // Loading should be true immediately after calling
      expect(result.current.state.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });

    it('should set error state on failure', async () => {
      const mockError = new Error('Failed to load shopping list');
      mockShoppingService.getShoppingListItems.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        try {
          await result.current.loadShoppingList();
        } catch {
          // Expected
        }
      });

      expect(result.current.state.error).toBeTruthy();
      expect(result.current.state.loading).toBe(false);
    });
  });

  describe('refreshCount', () => {
    it('should update count from shoppingService', async () => {
      mockShoppingService.getShoppingListCount.mockResolvedValue(5);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        await result.current.refreshCount();
      });

      expect(result.current.state.count).toBe(5);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const mockError = new Error('Test error');
      mockShoppingService.getShoppingListItems.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      // Set error state
      await act(async () => {
        try {
          await result.current.loadShoppingList();
        } catch {
          // Expected
        }
      });

      expect(result.current.state.error).toBeTruthy();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe('Auto-Remove Functionality (Story 3.2)', () => {
    it('should loadShoppingList exclude products where isOnShoppingList is false', async () => {
      const mockProductsWithHighStock = [
        {
          id: '1',
          name: 'Milk',
          stockLevel: 'low' as const,
          isOnShoppingList: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-10'),
        },
      ];

      // Note: Bread would have isOnShoppingList: false, so it would be filtered out
      // by ShoppingService.getShoppingListItems() and never returned by this mock
      mockShoppingService.getShoppingListItems.mockResolvedValue(mockProductsWithHighStock);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        await result.current.loadShoppingList();
      });

      // Should only return Low stock items (isOnShoppingList: true)
      expect(result.current.state.items).toHaveLength(1);
      const firstItem = result.current.state.items[0];
      expect(firstItem?.name).toBe('Milk');
      expect(firstItem?.isOnShoppingList).toBe(true);
      expect(result.current.state.count).toBe(1);
    });

    it('should handle empty list when all items are High stock (removed)', async () => {
      // When all items are High stock (isOnShoppingList: false),
      // ShoppingService.getShoppingListItems() returns an empty array
      const mockHighStockProducts: Product[] = [];

      mockShoppingService.getShoppingListItems.mockResolvedValue(mockHighStockProducts);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        await result.current.loadShoppingList();
      });

      expect(result.current.state.items).toHaveLength(0);
      expect(result.current.state.count).toBe(0);
    });

    it('should count badge decrease when items are auto-removed', async () => {
      // First load: 2 items on list
      mockShoppingService.getShoppingListItems.mockResolvedValue(mockProducts);
      mockShoppingService.getShoppingListCount.mockResolvedValue(2);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        await result.current.loadShoppingList();
      });

      expect(result.current.state.count).toBe(2);

      // Simulate item removed: now 1 item on list
      mockShoppingService.getShoppingListCount.mockResolvedValue(1);

      await act(async () => {
        await result.current.refreshCount();
      });

      expect(result.current.state.count).toBe(1);
    });
  });

  describe('Manual Add/Remove Functionality (Story 3.3)', () => {
    it('should addToList call shoppingService.addToList and dispatch action', async () => {
      mockShoppingService.addToList.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        await result.current.addToList('product-123');
      });

      expect(mockShoppingService.addToList).toHaveBeenCalledWith('product-123');
      expect(mockShoppingService.addToList).toHaveBeenCalledTimes(1);
    });

    it('should removeFromList call shoppingService.removeFromList', async () => {
      mockShoppingService.removeFromList.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        await result.current.removeFromList('product-123');
      });

      expect(mockShoppingService.removeFromList).toHaveBeenCalledWith('product-123');
      expect(mockShoppingService.removeFromList).toHaveBeenCalledTimes(1);
    });

    it('should addToList handle errors and set error state', async () => {
      const mockError = new Error('Failed to add to list');
      mockShoppingService.addToList.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        try {
          await result.current.addToList('invalid-id');
        } catch {
          // Expected - error is re-thrown for component-level handling
        }
      });

      expect(result.current.state.error).toBeTruthy();
    });

    it('should removeFromList handle errors and set error state', async () => {
      const mockError = new Error('Failed to remove from list');
      mockShoppingService.removeFromList.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        try {
          await result.current.removeFromList('invalid-id');
        } catch {
          // Expected - error is re-thrown for component-level handling
        }
      });

      expect(result.current.state.error).toBeTruthy();
    });

    it('should addToList set loading state during operation', async () => {
      mockShoppingService.addToList.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(undefined), 10))
      );

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      act(() => {
        result.current.addToList('product-123');
      });

      // Loading should be true during operation
      expect(result.current.state.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });
    });

    it('should include manually added Medium/High products in shopping list (Story 3.3)', async () => {
      // Story 3.3: Manual add allows Medium/High products on list
      const productsWithMedium = [
        {
          id: '1',
          name: 'Milk',
          stockLevel: 'medium' as const,  // Medium stock, manually added
          isOnShoppingList: true,          // Manually added
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-10'),
        },
      ];

      mockShoppingService.getShoppingListItems.mockResolvedValue(productsWithMedium);
      mockShoppingService.getShoppingListCount.mockResolvedValue(1);

      const { result } = renderHook(() => useShoppingList(), { wrapper });

      await act(async () => {
        await result.current.loadShoppingList();
      });

      // Medium stock product should appear because it was manually added
      expect(result.current.state.items).toHaveLength(1);
      expect(result.current.state.items[0]?.stockLevel).toBe('medium');
      expect(result.current.state.count).toBe(1);
    });
  });
});
