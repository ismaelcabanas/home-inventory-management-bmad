import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingList } from './ShoppingList';
import { ShoppingProvider } from '../context/ShoppingContext';
import * as ShoppingContext from '../context/ShoppingContext';
import React from 'react';
import type { Product } from '@/types/product';

// Mock dependencies
vi.mock('@/services/shopping', () => ({
  shoppingService: {
    getShoppingListItems: vi.fn(),
    getShoppingMode: vi.fn().mockResolvedValue(false), // Story 4.4: Shopping Mode
    setShoppingMode: vi.fn().mockResolvedValue(undefined), // Story 4.4: Shopping Mode
  },
}));

vi.mock('./ShoppingListItem', () => ({
  ShoppingListItem: ({ product, isShoppingMode }: { product: { name: string }; isShoppingMode?: boolean }) => (
    <div data-testid={`shopping-item-${product.name}`} data-mode={isShoppingMode ? 'shopping' : 'planning'}>
      {product.name}
    </div>
  ),
}));

vi.mock('./ShoppingProgress', () => ({
  ShoppingProgress: ({ checkedCount, totalCount }: { checkedCount: number; totalCount: number }) => (
    <div data-testid="shopping-progress" data-checked={checkedCount} data-total={totalCount}>
      {checkedCount} of {totalCount} items collected
    </div>
  ),
}));

// Mock the ShoppingContext to control the hook behavior
const mockLoadShoppingList = vi.fn();
const mockRefreshCount = vi.fn();
const mockClearError = vi.fn();
const mockAddToList = vi.fn().mockResolvedValue(undefined);
const mockRemoveFromList = vi.fn().mockResolvedValue(undefined);
const mockToggleItemChecked = vi.fn().mockResolvedValue(undefined);
const mockStartShoppingMode = vi.fn().mockResolvedValue(undefined);
const mockEndShoppingMode = vi.fn().mockResolvedValue(undefined);

vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
  state: { items: [], loading: false, error: null, count: 0, isShoppingMode: false },
  loadShoppingList: mockLoadShoppingList,
  refreshCount: mockRefreshCount,
  clearError: mockClearError,
  addToList: mockAddToList,
  removeFromList: mockRemoveFromList,
  toggleItemChecked: mockToggleItemChecked,
  startShoppingMode: mockStartShoppingMode, // Story 4.4
  endShoppingMode: mockEndShoppingMode, // Story 4.4
  progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
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
      state: { items: [], loading: false, error: null, count: 0, isShoppingMode: false },
      loadShoppingList: mockLoadShoppingList,
      refreshCount: mockRefreshCount,
      clearError: mockClearError,
      addToList: mockAddToList,
      removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
      startShoppingMode: mockStartShoppingMode,
      endShoppingMode: mockEndShoppingMode,
      progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
    }));
  });

  describe('loading state', () => {
    it('should render loading state initially', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: [], loading: true, error: null, count: 0, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
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
        state: { items: mockProducts, loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByText(/shopping list/i)).toBeInTheDocument();
      expect(screen.getByTestId('shopping-item-Milk')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-item-Bread')).toBeInTheDocument();
    });

    it('should display Low and Empty products', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts.slice(0, 2), loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByTestId('shopping-item-Milk')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-item-Bread')).toBeInTheDocument();
    });

    it('should filter out High and Medium products', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts.slice(0, 2), loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
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
        state: { items: productsSorted, loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
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
        state: { items: [], loading: false, error: 'Failed to load', count: 0, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  // Story 4.4: Shopping Mode Toggle Button Tests
  describe('Shopping Mode Toggle (Story 4.4)', () => {
    it('should render Shopping Mode FAB button', () => {
      render(<ShoppingList />, { wrapper });

      expect(screen.getByRole('button', { name: /start shopping mode/i })).toBeInTheDocument();
    });

    it('should show Shopping cart icon FAB when in Planning Mode', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: [], loading: false, error: null, count: 0, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      // FAB with shopping cart icon
      expect(screen.getByRole('button', { name: /start shopping mode/i })).toBeInTheDocument();
      expect(screen.getByTestId('ShoppingCartIcon')).toBeInTheDocument();
      expect(screen.queryByTestId('CheckroomIcon')).not.toBeInTheDocument();
    });

    it('should show Checkroom icon FAB when in Shopping Mode', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: [], loading: false, error: null, count: 0, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      // FAB with checkroom icon
      expect(screen.getByRole('button', { name: /end shopping mode/i })).toBeInTheDocument();
      expect(screen.getByTestId('CheckroomIcon')).toBeInTheDocument();
    });

    it('should call startShoppingMode when FAB is clicked in Planning Mode', async () => {
      const user = userEvent.setup();

      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: [], loading: false, error: null, count: 0, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      await user.click(screen.getByRole('button', { name: /start shopping mode/i }));

      expect(mockStartShoppingMode).toHaveBeenCalledTimes(1);
    });

    it('should call endShoppingMode when FAB is clicked in Shopping Mode', async () => {
      const user = userEvent.setup();

      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: [], loading: false, error: null, count: 0, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      await user.click(screen.getByRole('button', { name: /end shopping mode/i }));

      expect(mockEndShoppingMode).toHaveBeenCalledTimes(1);
    });

    it('should pass isShoppingMode prop to ShoppingListItem components', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts, loading: false, error: null, count: 2, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByTestId('shopping-item-Milk')).toHaveAttribute('data-mode', 'shopping');
      expect(screen.getByTestId('shopping-item-Bread')).toHaveAttribute('data-mode', 'shopping');
    });
  });

  // Story 4.2: Shopping Progress Indicator - Integration Tests
  describe('Shopping Progress Indicator (Story 4.2)', () => {
    it('should render ShoppingProgress at top of list when items exist', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts, loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 1, totalCount: 2 }, // Story 4.2: Shopping progress
      }));

      render(<ShoppingList />, { wrapper });

      expect(screen.getByTestId('shopping-progress')).toBeInTheDocument();
      // ShoppingProgress should appear before shopping items
      const progress = screen.getByTestId('shopping-progress');
      const milkItem = screen.getByTestId('shopping-item-Milk');
      expect(progress).toBeInTheDocument();
      expect(milkItem).toBeInTheDocument();
    });

    it('should pass correct progress props to ShoppingProgress', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts, loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 1, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      const progress = screen.getByTestId('shopping-progress');
      expect(progress).toHaveAttribute('data-checked', '1');
      expect(progress).toHaveAttribute('data-total', '2');
    });

    it('should show 0 of 0 when list is empty', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: [], loading: false, error: null, count: 0, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 0 },
      }));

      render(<ShoppingList />, { wrapper });

      // Empty state shown, no progress indicator needed
      expect(screen.queryByTestId('shopping-progress')).not.toBeInTheDocument();
      expect(screen.getByText(/Your shopping list is empty/i)).toBeInTheDocument();
    });

    it('should show progress with all checked (completion)', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts, loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 2, totalCount: 2 }, // All checked
      }));

      render(<ShoppingList />, { wrapper });

      const progress = screen.getByTestId('shopping-progress');
      expect(progress).toHaveAttribute('data-checked', '2');
      expect(progress).toHaveAttribute('data-total', '2');
    });
  });
});
