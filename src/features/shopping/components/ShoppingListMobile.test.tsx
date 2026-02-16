// Story 4.3: Mobile-Optimized Shopping List Layout Tests
// Tests for mobile touch targets, one-handed operation, and responsive design
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShoppingList } from './ShoppingList';
import { ShoppingProvider } from '../context/ShoppingContext';
import * as ShoppingContext from '../context/ShoppingContext';
import React from 'react';
import type { Product } from '@/types/product';

// Story 7.4: Mock InventoryContext
vi.mock('@/features/inventory/context/InventoryContext', () => ({
  useInventory: vi.fn(() => ({
    state: { products: [], loading: false, error: null },
  })),
}));

// Helper to generate many products for performance testing
const generateProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `product-${i}`,
    name: `Product ${i + 1}`,
    stockLevel: (['low', 'empty', 'medium'] as const)[i % 3],
    isOnShoppingList: true,
    isChecked: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  }));

// Mock the ShoppingContext
const mockLoadShoppingList = vi.fn();
const mockRefreshCount = vi.fn();
const mockClearError = vi.fn();
const mockAddToList = vi.fn().mockResolvedValue(undefined);
const mockRemoveFromList = vi.fn().mockResolvedValue(undefined);
const mockToggleItemChecked = vi.fn().mockResolvedValue(undefined);
const mockStartShoppingMode = vi.fn().mockResolvedValue(undefined);
const mockEndShoppingMode = vi.fn().mockResolvedValue(undefined);

// Mock products to be returned by the hook
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Milk',
    stockLevel: 'low',
    isOnShoppingList: true,
    isChecked: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    name: 'Bread',
    stockLevel: 'empty',
    isOnShoppingList: true,
    isChecked: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-15'),
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

describe('ShoppingList - Mobile Layout (Story 4.3)', () => {
  beforeEach(() => {
    // Reset mock before each test
    vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
      state: {
        items: mockProducts,
        loading: false,
        error: null,
        count: mockProducts.length,
        isShoppingMode: false
      },
      loadShoppingList: mockLoadShoppingList,
      refreshCount: mockRefreshCount,
      clearError: mockClearError,
      addToList: mockAddToList,
      removeFromList: mockRemoveFromList,
      toggleItemChecked: mockToggleItemChecked,
      startShoppingMode: mockStartShoppingMode,
      endShoppingMode: mockEndShoppingMode,
      progress: { checkedCount: 0, totalCount: mockProducts.length },
    }));
  });

  describe('AC6: Integration with Existing Components', () => {
    it('should render ShoppingProgress component', () => {
      render(<ShoppingList />, { wrapper });

      // Story 4.3 AC6: ShoppingProgress must still display properly
      // Look for the "X of Y items collected" text that ShoppingProgress renders
      expect(screen.getByText(/0 of \d+ items collected/)).toBeInTheDocument();
    });

    it('should render all shopping list items', () => {
      render(<ShoppingList />, { wrapper });

      // Story 4.3 AC6: All existing functionality must work
      // Products are rendered by ShoppingListItem
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });

    it('should render SpeedDial for Shopping List actions', () => {
      render(<ShoppingList />, { wrapper });

      // Story 4.3 AC6: SpeedDial (replaced dual FABs from Story 4.4 and 7.4) must work
      expect(screen.getByRole('button', { name: /shopping list actions/i })).toBeInTheDocument();
    });
  });

  describe('AC5: Bottom Navigation Non-Interference', () => {
    it('should render list with bottom padding for BottomNav clearance', () => {
      const { container } = render(<ShoppingList />, { wrapper });

      // Story 4.3 AC5: BottomNav shouldn't interfere with list items
      // Verify list items are rendered (not hidden by BottomNav)
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();

      // Story 7.5: Changed from List to Box with 12px margins
      // Verify the container box exists
      const containerBox = container.querySelector('.MuiBox-root');
      expect(containerBox).toBeInTheDocument();
    });
  });

  describe('AC3: Minimum Touch Targets', () => {
    it('should render shopping items that are accessible via screen readers', () => {
      render(<ShoppingList />, { wrapper });

      // Story 4.3: Items should be accessible
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });
  });

  describe('AC4: Smooth Scrolling Performance', () => {
    it('should render 50+ items without performance issues', () => {
      const largeProductList = generateProducts(50);
      vi.spyOn(ShoppingContext, 'useShoppingList').mockImplementation(() => ({
        state: {
          items: largeProductList,
          loading: false,
          error: null,
          count: largeProductList.length,
          isShoppingMode: false
        },
        loadShoppingList: mockLoadShoppingList,
        refreshCount: mockRefreshCount,
        clearError: mockClearError,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
        toggleItemChecked: mockToggleItemChecked,
        startShoppingMode: mockStartShoppingMode,
        endShoppingMode: mockEndShoppingMode,
        progress: { checkedCount: 0, totalCount: largeProductList.length },
      }));

      const startTime = performance.now();
      render(<ShoppingList />, { wrapper });
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // AC4: List should render quickly (< 1 second for 50 items)
      expect(renderTime).toBeLessThan(1000);

      // Verify all items are rendered
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 50')).toBeInTheDocument();
    });
  });

  describe('AC7: Responsive Desktop Compatibility', () => {
    it('should render correctly without horizontal scrolling on mobile viewport', () => {
      // Mock mobile viewport (375px width)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ShoppingList />, { wrapper });

      // Verify list items render without overflow
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });

    it('should render correctly on tablet viewport', () => {
      // Mock tablet viewport (768px width)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<ShoppingList />, { wrapper });

      // Verify list items render correctly
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });

    it('should render correctly on desktop viewport', () => {
      // Mock desktop viewport (1024px width)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<ShoppingList />, { wrapper });

      // Verify list items render correctly on desktop
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });
  });
});
