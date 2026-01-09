import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { InventoryProvider, useInventory } from './InventoryContext';
import { inventoryService } from '@/services/inventory';
import type { Product } from '@/types/product';

// Mock the inventory service
vi.mock('@/services/inventory', () => ({
  inventoryService: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    searchProducts: vi.fn(),
  },
}));

const mockProduct: Product = {
  id: '1',
  name: 'Milk',
  stockLevel: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOnShoppingList: false,
};

describe('InventoryContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useInventory hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useInventory());
      }).toThrow('useInventory must be used within an InventoryProvider');
    });

    it('should return context value when used inside provider', () => {
      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.state).toBeDefined();
      expect(result.current.loadProducts).toBeInstanceOf(Function);
    });
  });

  describe('loadProducts', () => {
    it('should load products successfully', async () => {
      const mockProducts = [mockProduct];
      vi.mocked(inventoryService.getProducts).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
      });

      await waitFor(() => {
        expect(result.current.state.products).toEqual(mockProducts);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should set loading state during load', async () => {
      vi.mocked(inventoryService.getProducts).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      act(() => {
        result.current.loadProducts();
      });

      expect(result.current.state.loading).toBe(true);
    });

    it('should handle load errors', async () => {
      vi.mocked(inventoryService.getProducts).mockRejectedValue(
        new Error('Load failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
      });

      await waitFor(() => {
        expect(result.current.state.error).toBe('Load failed');
        expect(result.current.state.loading).toBe(false);
      });
    });
  });

  describe('addProduct', () => {
    it('should add product successfully', async () => {
      vi.mocked(inventoryService.addProduct).mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.addProduct('Milk');
      });

      await waitFor(() => {
        expect(result.current.state.products).toContainEqual(mockProduct);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should add product to beginning of array', async () => {
      const product1 = { ...mockProduct, id: '1', name: 'Product 1' };
      const product2 = { ...mockProduct, id: '2', name: 'Product 2' };

      vi.mocked(inventoryService.getProducts).mockResolvedValue([product1]);
      vi.mocked(inventoryService.addProduct).mockResolvedValue(product2);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
        await result.current.addProduct('Product 2');
      });

      await waitFor(() => {
        expect(result.current.state.products[0]).toEqual(product2);
        expect(result.current.state.products[1]).toEqual(product1);
      });
    });

    it('should handle add errors', async () => {
      vi.mocked(inventoryService.addProduct).mockRejectedValue(
        new Error('Add failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      let caughtError: Error | null = null;

      // Verify the error is re-thrown AND stored in state
      await act(async () => {
        try {
          await result.current.addProduct('Milk');
        } catch (error) {
          caughtError = error as Error;
        }
      });

      // Verify error was re-thrown to component (allows component-level handling)
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe('Add failed');

      // Verify error was ALSO stored in context state (dual error handling pattern)
      await waitFor(() => {
        expect(result.current.state.error).toBe('Add failed');
        expect(result.current.state.loading).toBe(false);
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const initialProduct = { ...mockProduct, stockLevel: 'high' as const };
      vi.mocked(inventoryService.getProducts).mockResolvedValue([initialProduct]);
      vi.mocked(inventoryService.updateProduct).mockResolvedValue();

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
        await result.current.updateProduct('1', { stockLevel: 'low' });
      });

      await waitFor(() => {
        const updatedProduct = result.current.state.products.find(p => p.id === '1');
        expect(updatedProduct?.stockLevel).toBe('low');
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should maintain immutability when updating', async () => {
      const initialProduct = { ...mockProduct };
      vi.mocked(inventoryService.getProducts).mockResolvedValue([initialProduct]);
      vi.mocked(inventoryService.updateProduct).mockResolvedValue();

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
      });

      const productsBefore = result.current.state.products;

      await act(async () => {
        await result.current.updateProduct('1', { stockLevel: 'low' });
      });

      const productsAfter = result.current.state.products;

      // Arrays should be different references (immutable)
      expect(productsBefore).not.toBe(productsAfter);
    });

    it('should handle update errors', async () => {
      vi.mocked(inventoryService.updateProduct).mockRejectedValue(
        new Error('Update failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      let caughtError: Error | null = null;

      // Verify the error is re-thrown AND stored in state
      await act(async () => {
        try {
          await result.current.updateProduct('1', { stockLevel: 'low' });
        } catch (error) {
          caughtError = error as Error;
        }
      });

      // Verify error was re-thrown to component (allows component-level handling)
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe('Update failed');

      // Verify error was ALSO stored in context state (dual error handling pattern)
      await waitFor(() => {
        expect(result.current.state.error).toBe('Update failed');
        expect(result.current.state.loading).toBe(false);
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
      vi.mocked(inventoryService.deleteProduct).mockResolvedValue();

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
        await result.current.deleteProduct('1');
      });

      await waitFor(() => {
        expect(result.current.state.products).toHaveLength(0);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should maintain immutability when deleting', async () => {
      vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
      vi.mocked(inventoryService.deleteProduct).mockResolvedValue();

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
      });

      const productsBefore = result.current.state.products;

      await act(async () => {
        await result.current.deleteProduct('1');
      });

      const productsAfter = result.current.state.products;

      // Arrays should be different references (immutable)
      expect(productsBefore).not.toBe(productsAfter);
    });

    it('should handle delete errors', async () => {
      vi.mocked(inventoryService.deleteProduct).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      let caughtError: Error | null = null;

      // Verify the error is re-thrown AND stored in state
      await act(async () => {
        try {
          await result.current.deleteProduct('1');
        } catch (error) {
          caughtError = error as Error;
        }
      });

      // Verify error was re-thrown to component (allows component-level handling)
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe('Delete failed');

      // Verify error was ALSO stored in context state (dual error handling pattern)
      await waitFor(() => {
        expect(result.current.state.error).toBe('Delete failed');
        expect(result.current.state.loading).toBe(false);
      });
    });
  });

  describe('searchProducts', () => {
    it('should search products successfully', async () => {
      const searchResults = [mockProduct];
      vi.mocked(inventoryService.searchProducts).mockResolvedValue(searchResults);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.searchProducts('milk');
      });

      await waitFor(() => {
        expect(result.current.state.products).toEqual(searchResults);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should handle search errors', async () => {
      vi.mocked(inventoryService.searchProducts).mockRejectedValue(
        new Error('Search failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      let caughtError: Error | null = null;

      // Verify the error is re-thrown AND stored in state
      await act(async () => {
        try {
          await result.current.searchProducts('milk');
        } catch (error) {
          caughtError = error as Error;
        }
      });

      // Verify error was re-thrown to component (allows component-level handling)
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe('Search failed');

      // Verify error was ALSO stored in context state (dual error handling pattern)
      await waitFor(() => {
        expect(result.current.state.error).toBe('Search failed');
        expect(result.current.state.loading).toBe(false);
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      vi.mocked(inventoryService.getProducts).mockRejectedValue(
        new Error('Load failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      // First trigger an error
      await act(async () => {
        await result.current.loadProducts();
      });

      await waitFor(() => {
        expect(result.current.state.error).toBe('Load failed');
      });

      // Then clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.error).toBeNull();
    });

    it('should allow retrying after clearing error', async () => {
      const mockProducts = [mockProduct];
      vi.mocked(inventoryService.getProducts)
        .mockRejectedValueOnce(new Error('Load failed'))
        .mockResolvedValueOnce(mockProducts);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      // First attempt fails
      await act(async () => {
        await result.current.loadProducts();
      });

      await waitFor(() => {
        expect(result.current.state.error).toBe('Load failed');
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.error).toBeNull();

      // Retry succeeds
      await act(async () => {
        await result.current.loadProducts();
      });

      await waitFor(() => {
        expect(result.current.state.products).toEqual(mockProducts);
        expect(result.current.state.error).toBeNull();
      });
    });
  });
});
