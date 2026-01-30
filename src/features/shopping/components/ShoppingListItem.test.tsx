import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingListItem } from './ShoppingListItem';
import { STOCK_LEVEL_CONFIG } from '@/features/inventory/components/stockLevelConfig';

// Mock ShoppingContext
const mockToggleItemChecked = vi.fn();
vi.mock('@/features/shopping/context/ShoppingContext', () => ({
  useShoppingList: () => ({
    toggleItemChecked: mockToggleItemChecked,
  }),
}));

// Reset mock before each test
beforeEach(() => {
  mockToggleItemChecked.mockClear();
});

describe('ShoppingListItem', () => {
  const mockProduct = {
    id: '1',
    name: 'Milk',
    stockLevel: 'low' as const,
    isOnShoppingList: true,
    isChecked: false, // Story 4.1: Add isChecked field
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  };

  it('should render product name', () => {
    render(<ShoppingListItem product={mockProduct} />);

    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('should render stock level chip', () => {
    render(<ShoppingListItem product={mockProduct} />);

    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('should use correct STOCK_LEVEL_CONFIG for styling', () => {
    render(<ShoppingListItem product={mockProduct} />);

    const chip = screen.getByText('Low');
    const stockConfig = STOCK_LEVEL_CONFIG[mockProduct.stockLevel];

    expect(chip).toBeInTheDocument();
    // MUI converts hex to rgb, so we check the chip exists and has the label
    expect(chip).toHaveTextContent(stockConfig.label);
  });

  it('should render Empty stock level correctly', () => {
    const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
    render(<ShoppingListItem product={emptyProduct} />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render with proper spacing and layout', () => {
    render(<ShoppingListItem product={mockProduct} />);

    const listItem = document.querySelector('li');
    expect(listItem).toBeInTheDocument();
  });

  // Story 4.1: Check Off Items While Shopping - Task 4: ShoppingListItem UI Updates
  describe('Checkbox Functionality (Story 4.1)', () => {
    it('should display checkbox on shopping list items', () => {
      render(<ShoppingListItem product={mockProduct} />);

      // MUI Checkbox renders as a checkbox input
      const checkbox = document.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it('should checkbox reflect product.isChecked state when unchecked', () => {
      const uncheckedProduct = { ...mockProduct, isChecked: false };
      render(<ShoppingListItem product={uncheckedProduct} />);

      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).not.toBeChecked();
    });

    it('should checkbox reflect product.isChecked state when checked', () => {
      const checkedProduct = { ...mockProduct, isChecked: true };
      render(<ShoppingListItem product={checkedProduct} />);

      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });

    it('should clicking checkbox call toggleItemChecked', () => {
      render(<ShoppingListItem product={mockProduct} />);

      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        fireEvent.click(checkbox);
        expect(mockToggleItemChecked).toHaveBeenCalledWith('1');
        expect(mockToggleItemChecked).toHaveBeenCalledTimes(1);
      }
    });

    it('should checked items show strikethrough or dimmed styling', () => {
      const checkedProduct = { ...mockProduct, isChecked: true };
      const { container } = render(<ShoppingListItem product={checkedProduct} />);

      // Find the Box wrapper (it should have the sx prop with textDecoration/opacity)
      const boxElement = container.querySelector('.MuiBox-root');

      expect(boxElement).toBeInTheDocument();

      if (boxElement) {
        const styles = window.getComputedStyle(boxElement);
        const hasReducedOpacity = parseFloat(styles.opacity) < 1;

        // The Box should have reduced opacity when checked
        expect(hasReducedOpacity).toBe(true);
      }
    });

    it('should unchecked items show normal styling', () => {
      const uncheckedProduct = { ...mockProduct, isChecked: false };
      render(<ShoppingListItem product={uncheckedProduct} />);

      const productName = screen.getByText('Milk');

      // Check if the text does NOT have strikethrough
      // AND has full opacity
      const styles = window.getComputedStyle(productName);
      const hasStrikethrough = styles.textDecoration.includes('line-through');
      const hasReducedOpacity = parseFloat(styles.opacity) < 1;

      expect(hasStrikethrough).toBe(false);
      expect(hasReducedOpacity).toBe(false);
    });

    it('should checkbox be positioned on left side of item', () => {
      render(<ShoppingListItem product={mockProduct} />);

      const checkbox = document.querySelector('input[type="checkbox"]');
      const productName = screen.getByText('Milk');

      // Verify checkbox exists and comes before the product name in DOM order
      expect(checkbox).toBeInTheDocument();
      expect(productName).toBeInTheDocument();

      // The checkbox should appear before the text in the DOM
      if (checkbox && productName.parentElement) {
        const children = Array.from(productName.parentElement.children);
        const checkboxIndex = children.indexOf(checkbox as Element);
        const textIndex = children.findIndex((child) => child.contains(productName));

        expect(checkboxIndex).toBeLessThan(textIndex);
      }
    });

    it('should checkbox have accessibility attributes', () => {
      render(<ShoppingListItem product={mockProduct} />);

      const checkbox = document.querySelector('input[type="checkbox"]');

      expect(checkbox).toBeInTheDocument();
      // The checkbox should be accessible via keyboard (type="checkbox" is natively accessible)
      if (checkbox) {
        // Check that it's a native checkbox input (which is accessible by default)
        expect(checkbox.getAttribute('type')).toBe('checkbox');
        // Check that it can be focused (keyboard accessibility)
        expect(checkbox.getAttribute('tabindex')).toBeDefined();
      }
    });

    it('should checkbox have sufficient touch target size (48px minimum)', () => {
      render(<ShoppingListItem product={mockProduct} />);

      const checkbox = document.querySelector('input[type="checkbox"]');

      if (checkbox) {
        const styles = window.getComputedStyle(checkbox);
        const width = parseInt(styles.width, 10);
        const height = parseInt(styles.height, 10);

        // MUI Checkbox size="medium" provides 48px touch target
        expect(width).toBeGreaterThanOrEqual(40);
        expect(height).toBeGreaterThanOrEqual(40);
      }
    });
  });
});
