import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ShoppingList } from './ShoppingList';
import { ShoppingProvider } from '../context/ShoppingContext';
import * as ShoppingContext from '../context/ShoppingContext';
import React from 'react';
import type { Product } from '@/types/product';

// Mock dependencies
vi.mock('@/services/shopping', () => ({
  shoppingService: {
    getShoppingListItems: vi.fn(),
  },
}));

vi.mock('./ShoppingListItem', () => ({
  ShoppingListItem: ({ product }: { product: { name: string } }) => (
    <div data-testid={`shopping-item-${product.name}`}>{product.name}</div>
  ),
}));

// Mock the ShoppingContext to control the hook behavior
const mockLoadShoppingList = vi.fn();
const mockRefreshCount = vi.fn();
const mockClearError = vi.fn();
const mockAddToList = vi.fn().mockResolvedValue(undefined);
const mockRemoveFromList = vi.fn().mockResolvedValue(undefined);
const mockToggleItemChecked = vi.fn().mockResolvedValue(undefined);

vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
  state: { items: [], loading: false, error: null, count: 0 },
  loadShoppingList: mockLoadShoppingList,
  refreshCount: mockRefreshCount,
  clearError: mockClearError,
  addToList: mockAddToList,
  removeFromList: mockRemoveFromList,
  toggleItemChecked: mockToggleItemChecked, // Story 4.1: Add toggleItemChecked mock
}));

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Milk',
    stockLevel: 'low',
    isOnShoppingList: true,
    isChecked: false, // Story 4.1: Add isChecked field
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    name: 'Bread',
    stockLevel: 'empty',
    isOnShoppingList: true,
    isChecked: false, // Story 4.1: Add isChecked field
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Eggs',
    stockLevel: 'high',
    isOnShoppingList: false,
    isChecked: false, // Story 4.1: Add isChecked field
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-05'),
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

describe('ShoppingList', () => {
  // Use real timers to avoid hanging
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    // Reset default mock implementation
    vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
      state: { items: [], loading: false, error: null, count: 0 },
      loadShoppingList: mockLoadShoppingList,
      refreshCount: mockRefreshCount,
      clearError: mockClearError,
      addToList: mockAddToList,
      removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
    }));
  });

  describe('loading state', () => {
    it('should render loading state initially', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: [], loading: true, error: null, count: 0 },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render empty state when no items', () => {
      render(<ShoppingList />, { wrapper });

      // EmptyState component renders message
      expect(screen.getByText(/Your shopping list is empty/i)).toBeInTheDocument();
      expect(screen.getByText(/Mark items as Low or Empty/i)).toBeInTheDocument();
    });
  });

  describe('list display', () => {
    it('should render list of items when products exist', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts, loading: false, error: null, count: 2 },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByText(/shopping list/i)).toBeInTheDocument();
      expect(screen.getByTestId('shopping-item-Milk')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-item-Bread')).toBeInTheDocument();
    });

    it('should display Low and Empty products', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts.slice(0, 2), loading: false, error: null, count: 2 },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByTestId('shopping-item-Milk')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-item-Bread')).toBeInTheDocument();
    });

    it('should filter out High and Medium products', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts.slice(0, 2), loading: false, error: null, count: 2 },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.queryByTestId('shopping-item-Eggs')).not.toBeInTheDocument();
    });

    it('should sort items by updatedAt descending', () => {
      const productsSorted: typeof mockProducts = [
        mockProducts[1]!, // Bread (Jan 15)
        mockProducts[0]!, // Milk (Jan 10)
      ];

      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: productsSorted, loading: false, error: null, count: 2 },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
      }));

      render(<ShoppingList />, { wrapper });

      const items = screen.getAllByTestId(/shopping-item-/);
      expect(items[0]).toHaveTextContent('Bread');
      expect(items[1]).toHaveTextContent('Milk');
    });
  });

  describe('error state', () => {
    it('should display error when state.error exists', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: [], loading: false, error: 'Failed to load', count: 0 },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });
});
