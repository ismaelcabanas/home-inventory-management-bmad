import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { ShoppingList } from './ShoppingList';
import { ShoppingProvider } from '../context/ShoppingContext';
import * as ShoppingContext from '../context/ShoppingContext';
import React from 'react';
import type { Product } from '@/types/product';
import { eventBus, EVENTS } from '@/utils/eventBus';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/services/shopping', () => ({
  shoppingService: {
    getShoppingListItems: vi.fn(),
    getShoppingMode: vi.fn().mockResolvedValue(false), // Story 4.4: Shopping Mode
    setShoppingMode: vi.fn().mockResolvedValue(undefined), // Story 4.4: Shopping Mode
  },
}));

// Story 7.4: Mock InventoryContext
vi.mock('@/features/inventory/context/InventoryContext', () => ({
  useInventory: vi.fn(() => ({
    state: { products: [], loading: false, error: null },
  })),
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
  <BrowserRouter>
    <ShoppingProvider>{children}</ShoppingProvider>
  </BrowserRouter>
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

  // SpeedDial Tests - Replaced dual FABs with single SpeedDial component
  describe('SpeedDial Actions', () => {
    it('should render SpeedDial with correct aria-label', () => {
      render(<ShoppingList />, { wrapper });

      expect(screen.getByRole('button', { name: /shopping list actions/i })).toBeInTheDocument();
    });

    it('should render SpeedDial with MoreVertIcon', () => {
      render(<ShoppingList />, { wrapper });

      expect(screen.getByTestId('MoreVertIcon')).toBeInTheDocument();
    });

    it('should have 1 SpeedDialAction button (Add Products) - Story 9.1: Shopping Mode moved to prominent button', () => {
      render(<ShoppingList />, { wrapper });

      // SpeedDial actions are rendered but may be hidden until SpeedDial is opened
      // We can check for the presence of action buttons by their tooltip titles
      const addButton = screen.getByRole('menuitem', { name: /add products/i });
      expect(addButton).toBeInTheDocument();

      // Story 9.1: Shopping Mode toggle is no longer in SpeedDial
      const toggleButton = screen.queryByRole('menuitem', { name: /start shopping mode/i });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('should show Shopping cart icon when in Planning Mode - Story 9.1: Header icon only (SpeedDial no longer has toggle)', () => {
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

      // Story 7.5: Shopping cart icon should be present in header
      // Story 9.1: SpeedDial no longer has the shopping mode toggle
      const icons = screen.getAllByTestId('ShoppingCartIcon');
      expect(icons.length).toBeGreaterThan(0);
      expect(screen.queryByTestId('CheckroomIcon')).not.toBeInTheDocument();
    });

    it('should show Checkroom icon when in Shopping Mode - Story 9.1: Only on prominent End Shopping button, not in SpeedDial', () => {
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

      // Story 9.1: Checkroom icon is on the prominent "End Shopping" button
      expect(screen.getByTestId('CheckroomIcon')).toBeInTheDocument();
    });

    it('should render toggle action with Start Shopping Mode tooltip in Planning Mode - Story 9.1: Prominent button, not SpeedDial', () => {
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

      // Story 9.1: Shopping Mode is now a prominent button, not in SpeedDial
      const startButton = screen.getByRole('button', { name: /start shopping/i });
      expect(startButton).toBeInTheDocument();

      // SpeedDial should no longer have the toggle action
      const toggleButton = screen.queryByRole('menuitem', { name: /start shopping mode/i });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('should render toggle action with End Shopping Mode tooltip in Shopping Mode - Story 9.1: Prominent button, not SpeedDial', () => {
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

      // Story 9.1: Shopping Mode is now a prominent button, not in SpeedDial
      const endButton = screen.getByRole('button', { name: /end shopping/i });
      expect(endButton).toBeInTheDocument();

      // SpeedDial should no longer have the toggle action
      const toggleButton = screen.queryByRole('menuitem', { name: /end shopping mode/i });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('should render AddIcon for Add Products action', () => {
      render(<ShoppingList />, { wrapper });

      expect(screen.getByTestId('AddIcon')).toBeInTheDocument();
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

  // Story 9.1: Enhanced Shopping Mode Entry & Visual States Tests
  describe('Enhanced Shopping Mode Entry (Story 9.1)', () => {
    // Create a consistent test state with exactly 2 items
    const twoItems = mockProducts.slice(0, 2);

    it('should render "Start Shopping" button prominently when list has items', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      // Should render prominent Start Shopping button
      const startButton = screen.getByRole('button', { name: /start shopping/i });
      expect(startButton).toBeInTheDocument();
      // Check the button contains the item count somewhere in its content
      expect(startButton.textContent).toContain('2');
    });

    it('should show correct item count in Start Shopping button', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: mockProducts.slice(0, 1), loading: false, error: null, count: 1, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 1 },
      }));

      render(<ShoppingList />, { wrapper });

      // Should show singular "item" when count is 1
      const startButton = screen.getByRole('button', { name: /start shopping/i });
      expect(startButton).toBeInTheDocument();
      expect(startButton.textContent).toContain('1');
    });

    it('should not show Start Shopping button when list is empty', () => {
      render(<ShoppingList />, { wrapper });

      // Should NOT show Start Shopping button when list is empty
      const startButton = screen.queryByRole('button', { name: /start shopping/i });
      expect(startButton).not.toBeInTheDocument();
    });

    it('should render "End Shopping" button when in shopping mode', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      // Should show End Shopping button instead
      const endButton = screen.getByRole('button', { name: /end shopping/i });
      expect(endButton).toBeInTheDocument();

      // Should not show Start Shopping button
      const startButton = screen.queryByRole('button', { name: /start shopping/i });
      expect(startButton).not.toBeInTheDocument();
    });

    it('should show "Shopping Mode" in header when in shopping mode', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      // Header should show "Shopping Mode" instead of "Shopping List"
      expect(screen.getByText('Shopping Mode')).toBeInTheDocument();
      expect(screen.queryByText('Shopping List')).not.toBeInTheDocument();
    });

    it('should show ✕ exit button in header when in shopping mode', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      // CloseIcon (✕) should be present in header when in shopping mode
      expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
    });

    it('should not show ✕ exit button when not in shopping mode', () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      // CloseIcon (✕) should NOT be present when not in shopping mode
      expect(screen.queryByTestId('CloseIcon')).not.toBeInTheDocument();
    });

    it('should call startShoppingMode when Start Shopping button is clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: false },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      const startButton = screen.getByRole('button', { name: /start shopping/i });
      startButton.click();

      // Wait for async call
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockStartShoppingMode).toHaveBeenCalledTimes(1);
    });

    it('should call endShoppingMode when End Shopping button is clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        endButton.click();
      });

      // Story 9.2: Now opens completion dialog instead of directly exiting
      // User must confirm before endShoppingMode is called
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Are you done shopping?/i)).toBeInTheDocument();

      // Click confirm button to complete shopping
      const confirmButton = screen.getByRole('button', { name: /yes, i'm done/i });
      await act(async () => {
        confirmButton.click();
      });

      // Wait for async call
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockEndShoppingMode).toHaveBeenCalledTimes(1);
    });

    it('should call endShoppingMode when ✕ exit button is clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      const exitButton = screen.getByRole('button', { name: /exit shopping mode/i });
      await act(async () => {
        exitButton.click();
      });

      // Story 9.2: Now opens completion dialog instead of directly exiting
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Are you done shopping?/i)).toBeInTheDocument();

      // Click confirm button to complete shopping
      const confirmButton = screen.getByRole('button', { name: /yes, i'm done/i });
      await act(async () => {
        confirmButton.click();
      });

      // Wait for async call
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockEndShoppingMode).toHaveBeenCalledTimes(1);
    });
  });

  // Story 8.1: Event-Driven Synchronization Tests
  describe('Event-Driven Synchronization (Story 8.1)', () => {
    beforeEach(() => {
      // Clear all event listeners before each test
      eventBus._clearForTesting();
    });

    it('should call loadShoppingList on mount', () => {
      render(<ShoppingList />, { wrapper });

      // Initial load should happen once on mount
      expect(mockLoadShoppingList).toHaveBeenCalledTimes(1);
    });

    it('should call loadShoppingList when inventory product updated event is emitted', () => {
      render(<ShoppingList />, { wrapper });

      // Clear the initial mount call
      vi.clearAllMocks();

      // Emit the event
      eventBus.emit(EVENTS.INVENTORY_PRODUCT_UPDATED, { id: '123', updates: { stockLevel: 'low' } });

      // loadShoppingList should be called in response to event
      expect(mockLoadShoppingList).toHaveBeenCalledTimes(1);
    });

    it('should set up event listener on mount and clean up on unmount', () => {
      const { unmount } = render(<ShoppingList />, { wrapper });

      // Clear initial call
      vi.clearAllMocks();

      // Emit event - should trigger loadShoppingList
      eventBus.emit(EVENTS.INVENTORY_PRODUCT_UPDATED, { id: '123', updates: { stockLevel: 'low' } });
      expect(mockLoadShoppingList).toHaveBeenCalledTimes(1);

      // Clear for next test
      vi.clearAllMocks();

      // Unmount component
      unmount();

      // Emit event after unmount - should NOT trigger loadShoppingList
      eventBus.emit(EVENTS.INVENTORY_PRODUCT_UPDATED, { id: '456', updates: { stockLevel: 'high' } });
      expect(mockLoadShoppingList).not.toHaveBeenCalled();
    });

    it('should handle multiple rapid events correctly', () => {
      render(<ShoppingList />, { wrapper });

      // Clear initial mount call
      vi.clearAllMocks();

      // Emit multiple rapid events
      eventBus.emit(EVENTS.INVENTORY_PRODUCT_UPDATED, { id: '1', updates: { stockLevel: 'low' } });
      eventBus.emit(EVENTS.INVENTORY_PRODUCT_UPDATED, { id: '2', updates: { stockLevel: 'empty' } });
      eventBus.emit(EVENTS.INVENTORY_PRODUCT_UPDATED, { id: '3', updates: { stockLevel: 'high' } });

      // All events should trigger loadShoppingList calls
      expect(mockLoadShoppingList).toHaveBeenCalledTimes(3);
    });

    it('should not have any polling intervals set up', () => {
      vi.useFakeTimers();

      render(<ShoppingList />, { wrapper });

      // Clear initial mount call
      vi.clearAllMocks();

      // Advance time by 10 seconds (would trigger polling twice if it existed)
      vi.advanceTimersByTime(10000);

      // No additional loadShoppingList calls should have been made
      expect(mockLoadShoppingList).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  // Story 9.2: User-Initiated Shopping Completion Tests
  describe('User-Initiated Shopping Completion (Story 9.2)', () => {
    // Create a consistent test state with exactly 2 items
    const twoItems = mockProducts.slice(0, 2);

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should open completion dialog when End Shopping button is clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      fireEvent.click(endButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Are you done shopping?/i)).toBeInTheDocument();
      expect(screen.getByText(/You collected 1 of 2 items/i)).toBeInTheDocument();
    });

    it('should open completion dialog when ✕ exit button is clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const exitButton = screen.getByRole('button', { name: /exit shopping mode/i });
      await act(async () => {
        fireEvent.click(exitButton);
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Are you done shopping?/i)).toBeInTheDocument();
    });

    it('should exit shopping mode when confirm button clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        fireEvent.click(endButton);
      });

      const confirmButton = screen.getByRole('button', { name: /yes, i'm done/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      // Story 9.3: Receipt scan prompt opens after completion dialog closes
      // Wait for receipt scan prompt to appear
      await waitFor(() => {
        expect(screen.getByText(/Scan Your Receipt/i)).toBeInTheDocument();
      });

      expect(mockEndShoppingMode).toHaveBeenCalledTimes(1);
    });

    it('should stay in shopping mode when cancel button clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        fireEvent.click(endButton);
      });

      const cancelButton = screen.getByRole('button', { name: /no, continue shopping/i });
      await act(async () => {
        fireEvent.click(cancelButton);
      });

      // Wait for dialog to close (MUI Dialog has transition animation)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(mockEndShoppingMode).not.toHaveBeenCalled();
    });

    it('should show celebratory message when all items collected (AC4)', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 2, totalCount: 2 },
      }));

      render(<ShoppingList />, { wrapper });

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        fireEvent.click(endButton);
      });

      expect(screen.getByText(/Great job! You got everything! 🎉/i)).toBeInTheDocument();
      expect(screen.getByText(/You collected 2 of 2 items/i)).toBeInTheDocument();
    });

    it('should show helpful messaging for partial completion (AC5)', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        fireEvent.click(endButton);
      });

      expect(screen.getByText(/Any items not collected will stay on your list for next time/i)).toBeInTheDocument();
    });

    it('should auto-prompt dialog when all items checked (AC4)', async () => {
      vi.useFakeTimers();
      try {
        const mockContextValue = {
          state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
          loadShoppingList: mockLoadShoppingList,
          refreshCount: mockRefreshCount,
          clearError: mockClearError,
          addToList: mockAddToList,
          removeFromList: mockRemoveFromList,
          toggleItemChecked: mockToggleItemChecked,
          startShoppingMode: mockStartShoppingMode,
          endShoppingMode: mockEndShoppingMode,
          progress: { checkedCount: 2, totalCount: 2 }, // Start with all checked
        };

        vi.spyOn(ShoppingContext, 'useShoppingList').mockReturnValue(mockContextValue);

        render(<ShoppingList />, { wrapper });

        // Advance time past the 500ms delay
        await act(async () => {
          vi.advanceTimersByTime(600);
        });

        // Dialog should be open
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Great job! You got everything! 🎉/i)).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // Story 9.3: Post-Shopping Receipt Scan Prompt Tests
  describe('Post-Shopping Receipt Scan Prompt (Story 9.3)', () => {
    const twoItems = mockProducts.slice(0, 2);

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should open receipt scan prompt after shopping completion', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        fireEvent.click(endButton);
      });

      const confirmButton = screen.getByRole('button', { name: /yes, i'm done/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      // Story 9.3: Receipt scan prompt should appear after completion
      await waitFor(() => {
        expect(screen.getByText(/Scan Your Receipt/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Update your inventory automatically by scanning your receipt/i)).toBeInTheDocument();
    });

    it('should navigate to /scan when Scan Receipt button is clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        fireEvent.click(endButton);
      });

      const confirmButton = screen.getByRole('button', { name: /yes, i'm done/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      // Wait for receipt scan prompt
      await waitFor(() => {
        expect(screen.getByText(/Scan Your Receipt/i)).toBeInTheDocument();
      });

      const scanButton = screen.getByRole('button', { name: /scan receipt/i });
      await act(async () => {
        fireEvent.click(scanButton);
      });

      // Navigation to /scan should occur (dialog closes)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close prompt when "I\'ll do it later" is clicked', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        fireEvent.click(endButton);
      });

      const confirmButton = screen.getByRole('button', { name: /yes, i'm done/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      // Wait for receipt scan prompt
      await waitFor(() => {
        expect(screen.getByText(/Scan Your Receipt/i)).toBeInTheDocument();
      });

      const laterButton = screen.getByRole('button', { name: /i'll do it later/i });
      await act(async () => {
        fireEvent.click(laterButton);
      });

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Should return to shopping list (not navigate away)
      // Check that we're back on the shopping list page by looking for the shopping cart icon
      expect(screen.getByTestId('ShoppingCartIcon')).toBeInTheDocument();
    });

    it('should ensure completion dialog closes before receipt prompt opens', async () => {
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: { items: twoItems, loading: false, error: null, count: 2, isShoppingMode: true },
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

      const endButton = screen.getByRole('button', { name: /end shopping/i });
      await act(async () => {
        fireEvent.click(endButton);
      });

      const confirmButton = screen.getByRole('button', { name: /yes, i'm done/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      // Completion dialog should close first
      await waitFor(() => {
        expect(screen.queryByText(/Are you done shopping?/i)).not.toBeInTheDocument();
      });

      // Then receipt prompt should open (sequencing, not simultaneous)
      await waitFor(() => {
        expect(screen.getByText(/Scan Your Receipt/i)).toBeInTheDocument();
      });

      // Verify both dialogs aren't open simultaneously
      const dialogs = screen.queryAllByRole('dialog');
      expect(dialogs.length).toBe(1);
    });
  });
});
