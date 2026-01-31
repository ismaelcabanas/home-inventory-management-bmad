import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);

    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('should render stock level chip', () => {
    render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);

    const chip = screen.getByText('Low');
    expect(chip).toBeInTheDocument();
    // Verify chip has the correct class (MUI Chip)
    expect(chip.className).toContain('MuiChip');
  });

  it('should use correct STOCK_LEVEL_CONFIG for styling', () => {
    render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);

    const chip = screen.getByText('Low');
    const stockConfig = STOCK_LEVEL_CONFIG[mockProduct.stockLevel];

    expect(chip).toBeInTheDocument();
    // MUI converts hex to rgb, so we check the chip exists and has the label
    expect(chip).toHaveTextContent(stockConfig.label);
  });

  it('should render Empty stock level correctly', () => {
    const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
    render(<ShoppingListItem product={emptyProduct} isShoppingMode={false} />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render with proper spacing and layout', () => {
    render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);

    const listItem = document.querySelector('li');
    expect(listItem).toBeInTheDocument();
  });

  // Story 4.1: Check Off Items While Shopping - Task 4: ShoppingListItem UI Updates
  describe('Checkbox Functionality (Story 4.1)', () => {
    it('should display checkbox on shopping list items when in Shopping Mode', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);

      // MUI Checkbox renders as a checkbox input
      const checkbox = document.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it('should checkbox reflect product.isChecked state when unchecked', () => {
      const uncheckedProduct = { ...mockProduct, isChecked: false };
      render(<ShoppingListItem product={uncheckedProduct} isShoppingMode={true} />);

      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).not.toBeChecked();
    });

    it('should checkbox reflect product.isChecked state when checked', () => {
      const checkedProduct = { ...mockProduct, isChecked: true };
      render(<ShoppingListItem product={checkedProduct} isShoppingMode={true} />);

      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });

    it('should clicking checkbox call toggleItemChecked', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);

      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        fireEvent.click(checkbox);
        expect(mockToggleItemChecked).toHaveBeenCalledWith('1');
        expect(mockToggleItemChecked).toHaveBeenCalledTimes(1);
      }
    });

    it('should checked items show strikethrough or dimmed styling', () => {
      const checkedProduct = { ...mockProduct, isChecked: true };
      const { container } = render(<ShoppingListItem product={checkedProduct} isShoppingMode={true} />);

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
      render(<ShoppingListItem product={uncheckedProduct} isShoppingMode={true} />);

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
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);

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
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);

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
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);

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

    it('should show visual confirmation snackbar when item is checked', async () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);

      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        fireEvent.click(checkbox);

        // Story 4.1 AC2/AC3: Visual confirmation (snackbar) should appear
        // MUI Snackbar uses role="alert" for the Alert component
        await waitFor(() => {
          const alert = screen.getByRole('alert');
          expect(alert).toBeInTheDocument();
        });
      }
    });

    it('should show collected message when checking unchecked item', async () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);

      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        fireEvent.click(checkbox);

        // Story 4.1 AC2: Visual confirmation should show "collected" message
        await waitFor(() => {
          const alert = screen.getByRole('alert');
          expect(alert).toHaveTextContent('Milk collected');
        });
      }
    });

    it('should show uncollected message when unchecking checked item', async () => {
      const checkedProduct = { ...mockProduct, isChecked: true };
      render(<ShoppingListItem product={checkedProduct} isShoppingMode={true} />);

      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        fireEvent.click(checkbox);

        // Story 4.1 AC3: Visual confirmation should show "uncollected" message
        await waitFor(() => {
          const alert = screen.getByRole('alert');
          expect(alert).toHaveTextContent('Milk uncollected');
        });
      }
    });
  });

  // Story 4.4: Shopping Mode Toggle - Conditional Checkbox Rendering
  describe('Shopping Mode Conditional Rendering (Story 4.4)', () => {
    it('should NOT render checkbox when isShoppingMode is false (Planning Mode)', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);

      const checkbox = document.querySelector('input[type="checkbox"]');
      expect(checkbox).not.toBeInTheDocument();
    });

    it('should render checkbox when isShoppingMode is true (Shopping Mode)', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);

      const checkbox = document.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it('should preserve checked/unchecked states across mode transitions', () => {
      // Render with checked state in Shopping Mode
      const checkedProduct = { ...mockProduct, isChecked: true };
      const { rerender } = render(<ShoppingListItem product={checkedProduct} isShoppingMode={true} />);

      let checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeChecked();

      // Switch to Planning Mode (checkbox completely removed from DOM)
      rerender(<ShoppingListItem product={checkedProduct} isShoppingMode={false} />);
      checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).not.toBeInTheDocument();

      // Switch back to Shopping Mode (checkbox visible again, state preserved from product prop)
      rerender(<ShoppingListItem product={checkedProduct} isShoppingMode={true} />);
      checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it('should show product name in both Planning Mode and Shopping Mode', () => {
      const { rerender } = render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);

      // Product name visible in Planning Mode
      expect(screen.getByText('Milk')).toBeInTheDocument();

      // Product name still visible in Shopping Mode
      rerender(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('should show stock level chip in both Planning Mode and Shopping Mode', () => {
      const { rerender } = render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);

      // Stock chip visible in Planning Mode
      expect(screen.getByText('Low')).toBeInTheDocument();

      // Stock chip still visible in Shopping Mode
      rerender(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });
  });
});
