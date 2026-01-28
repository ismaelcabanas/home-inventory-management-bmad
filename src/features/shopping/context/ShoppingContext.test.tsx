import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ShoppingProvider, useShoppingList } from './ShoppingContext';
import { shoppingService } from '@/services/shopping';
import React from 'react';

// Mock dependencies
vi.mock('@/services/shopping', () => ({
  shoppingService: {
    getShoppingListItems: vi.fn(),
    getShoppingListCount: vi.fn(),
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
});
