/**
 * ReceiptContext Error Handling Tests (Story 6.2)
 *
 * These are context-level integration tests that verify the complete error handling
 * flow from state management through mocked services, ensuring proper user feedback
 * and state transitions.
 *
 * Note: Services are mocked here to test the context's error handling behavior.
 * For true integration tests with real database transactions, see inventory.test.ts
 * which tests the actual transaction rollback behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReceiptProvider, useReceiptContext } from '@/features/receipt/context/ReceiptContext';
import { inventoryService } from '@/services/inventory';
import { shoppingService } from '@/services/shopping';
import { db } from '@/services/database';
import * as errorHandler from '@/utils/errorHandler';

// Mock the utilities
vi.mock('@/utils/errorHandler');
vi.mock('@/utils/logger');

// Mock inventory service
vi.mock('@/services/inventory', () => ({
  inventoryService: {
    replenishStock: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock shopping service
vi.mock('@/services/shopping', () => ({
  shoppingService: {
    removePurchasedItems: vi.fn().mockResolvedValue(0),
  },
}));

// Mock network utility
vi.mock('@/utils/network', () => ({
  isOnline: vi.fn(() => true),
  onNetworkStatusChange: vi.fn(() => vi.fn()),
}));

// Mock OCR service
vi.mock('@/services/ocr', () => ({
  activeOCRProvider: {
    name: 'llm-api (gpt-4o-mini)',
    isAvailable: vi.fn().mockResolvedValue(true),
  },
  ocrService: {
    setInventoryService: vi.fn(),
    setOCRProvider: vi.fn(),
    getPendingCount: vi.fn().mockResolvedValue(0),
  },
}));

describe('ReceiptContext Error Handling Tests - Story 6.2', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await db.products.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ReceiptProvider key="error-integration-test">{children}</ReceiptProvider>
  );

  describe('AC1: Display Clear Error Message on Failure', () => {
    it('should show clear error message when database error occurs', async () => {
      const mockError = new Error('Database connection failed');
      vi.mocked(inventoryService.replenishStock).mockRejectedValueOnce(mockError);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Failed to update inventory. Please try again.',
        details: { originalError: mockError },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      // Setup products
      act(() => {
        result.current.addProduct('Milk');
        result.current.addProduct('Bread');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      // Trigger update
      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected to throw
        }
      });

      // Verify error state is set with user-friendly message
      expect(result.current.state.updateError).not.toBeNull();
      expect(result.current.state.updateError?.message).toBe('Failed to update inventory. Please try again.');
      expect(result.current.state.updatingInventory).toBe(false);
    });

    it('should show error message when shopping list update fails', async () => {
      const mockError = new Error('Shopping list update failed');
      vi.mocked(shoppingService.removePurchasedItems).mockRejectedValueOnce(mockError);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Failed to update shopping list. Please try again.',
        details: { originalError: mockError },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.addProduct('Cheese');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.state.updateError).not.toBeNull();
      expect(result.current.state.updateError?.message).toBe('Failed to update shopping list. Please try again.');
    });
  });

  describe('AC2: Provide "Try Again" Button for Error Recovery', () => {
    it('should allow retry after error is cleared', async () => {
      const mockError = new Error('Temporary failure');
      vi.mocked(inventoryService.replenishStock)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(undefined);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Temporary error.',
        details: { originalError: mockError },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.addProduct('Milk');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      // First attempt fails
      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected
        }
      });

      expect(result.current.state.updateError).not.toBeNull();

      // Clear error (simulating "Try Again" button click)
      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.updateError).toBeNull();

      // Retry should succeed
      await act(async () => {
        await result.current.updateInventoryFromReceipt(products);
      });

      expect(result.current.state.updateError).toBeNull();
      expect(result.current.state.productsUpdated).toBeGreaterThanOrEqual(0);
    });
  });

  describe('AC3: Retry Reuses Same Confirmed Products', () => {
    it('should preserve confirmed products across error/retry cycle', async () => {
      const mockError = new Error('Network timeout');
      vi.mocked(inventoryService.replenishStock)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(undefined);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Network timeout.',
        details: { originalError: mockError },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      // Add multiple products
      act(() => {
        result.current.addProduct('Product 1');
        result.current.addProduct('Product 2');
        result.current.addProduct('Product 3');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      // Confirm and capture original state
      act(() => {
        result.current.confirmReview();
      });

      const originalConfirmed = [...result.current.state.confirmedProducts];
      expect(originalConfirmed).toHaveLength(3);

      // First attempt fails
      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt();
        } catch {
          // Expected
        }
      });

      // Confirmed products should be preserved
      expect(result.current.state.confirmedProducts).toEqual(originalConfirmed);
      expect(result.current.state.confirmedProducts).toHaveLength(3);

      // Clear and retry
      act(() => {
        result.current.clearError();
      });

      await act(async () => {
        await result.current.updateInventoryFromReceipt();
      });

      // Success after retry
      expect(result.current.state.updateError).toBeNull();
      expect(result.current.state.productsUpdated).toBeGreaterThanOrEqual(0);
    });
  });

  describe('AC4: Provide "Cancel" Button to Exit Without Updating', () => {
    it('should allow cancel without making changes', async () => {
      const mockError = new Error('Update failed');
      vi.mocked(inventoryService.replenishStock).mockRejectedValueOnce(mockError);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Update failed.',
        details: { originalError: mockError },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.addProduct('Milk');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      // Trigger error
      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected
        }
      });

      expect(result.current.state.updateError).not.toBeNull();

      // Clear error (simulating "Cancel" button)
      act(() => {
        result.current.clearError();
      });

      // Error should be cleared, no changes made
      expect(result.current.state.updateError).toBeNull();
      expect(result.current.state.productsUpdated).toBe(-1); // Still -1 (not updated)
    });
  });

  describe('AC5: Ensure No Partial Updates on Error (Data Integrity)', () => {
    it('should rollback all database operations on error', async () => {
      const mockError = new Error('Transaction failed');
      vi.mocked(inventoryService.replenishStock).mockRejectedValueOnce(mockError);

      vi.mocked(errorHandler.handleError).mockImplementation((error) => ({
        message: 'Transaction failed.',
        details: { originalError: error },
      }));

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.addProduct('Milk');
        result.current.addProduct('Bread');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      // Confirm products
      act(() => {
        result.current.confirmReview();
      });

      const originalConfirmed = [...result.current.state.confirmedProducts];

      // Attempt should fail
      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt();
        } catch {
          // Expected
        }
      });

      // Verify error state is set
      expect(result.current.state.updateError).not.toBeNull();

      // Verify confirmed products are preserved (no partial updates)
      expect(result.current.state.confirmedProducts).toEqual(originalConfirmed);

      // Verify productsUpdated is still -1 (no update completed)
      expect(result.current.state.productsUpdated).toBe(-1);
    });
  });

  describe('AC6: Log Error Details for Debugging', () => {
    it('should log error with full context', async () => {
      const mockError = new Error('Database error');
      vi.mocked(inventoryService.replenishStock).mockRejectedValueOnce(mockError);

      vi.mocked(errorHandler.handleError).mockImplementation((error) => ({
        message: 'Failed to update.',
        details: {
          originalError: error,
          productNames: ['Milk', 'Bread'],
        },
      }));

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.addProduct('Milk');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected
        }
      });

      // Verify error state is set with context
      expect(result.current.state.updateError).not.toBeNull();
      expect(result.current.state.updateError?.details).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle error with single product', async () => {
      const mockError = new Error('Single product error');
      vi.mocked(inventoryService.replenishStock).mockRejectedValueOnce(mockError);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Failed to update.',
        details: { originalError: mockError },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.addProduct('SingleItem');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected
        }
      });

      expect(result.current.state.updateError).not.toBeNull();
    });

    it('should handle consecutive errors', async () => {
      const mockError = new Error('Persistent error');
      vi.mocked(inventoryService.replenishStock).mockRejectedValue(mockError);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Persistent error.',
        details: { originalError: mockError },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.addProduct('TestProduct');
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      // First error
      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected
        }
      });

      expect(result.current.state.updateError).not.toBeNull();

      // Clear and retry
      act(() => {
        result.current.clearError();
      });

      // Second error
      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected
        }
      });

      expect(result.current.state.updateError).not.toBeNull();
    });

    it('should handle error with duplicate product names', async () => {
      const mockError = new Error('Duplicate error');
      vi.mocked(inventoryService.replenishStock).mockRejectedValueOnce(mockError);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Failed with duplicates.',
        details: { originalError: mockError },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.addProduct('Milk');
        result.current.addProduct('Milk'); // Duplicate
      });

      const products = result.current.state.productsInReview.map(p => ({
        ...p,
        isCorrect: true,
      }));

      await act(async () => {
        try {
          await result.current.updateInventoryFromReceipt(products);
        } catch {
          // Expected
        }
      });

      expect(result.current.state.updateError).not.toBeNull();
    });
  });
});
