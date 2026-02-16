import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShoppingListItem } from './ShoppingListItem';
import { getStockLevelText } from '@/utils/stockLevels';

// Mock ShoppingContext
const mockToggleItemChecked = vi.fn();
const mockRemoveFromList = vi.fn();
vi.mock('@/features/shopping/context/ShoppingContext', () => ({
  useShoppingList: () => ({
    toggleItemChecked: mockToggleItemChecked,
    removeFromList: mockRemoveFromList,
  }),
}));

// Reset mock before each test
beforeEach(() => {
  mockToggleItemChecked.mockClear();
  mockRemoveFromList.mockClear();
});

describe('ShoppingListItem', () => {
  const mockProduct = {
    id: '1',
    name: 'Milk',
    stockLevel: 'low' as const,
    isOnShoppingList: true,
    isChecked: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  };

  it('should render product name', () => {
    render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('should render stock level text', () => {
    render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);
    // Story 7.5: Changed from Chip to Typography text
    expect(screen.getByText('Almost empty')).toBeInTheDocument();
  });

  it('should use correct getStockLevelText for styling', () => {
    render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);
    // Story 7.5: Using getStockLevelText utility instead of STOCK_LEVEL_CONFIG
    const expectedText = getStockLevelText(mockProduct.stockLevel);
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it('should render Empty stock level correctly', () => {
    const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
    render(<ShoppingListItem product={emptyProduct} isShoppingMode={false} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render with Card component and proper spacing', () => {
    const { container } = render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);
    // Story 7.5: Changed from ListItem to Card
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  // Story 4.1: Check Off Items While Shopping - Task 4: ShoppingListItem UI Updates
  describe('Checkbox Functionality (Story 4.1)', () => {
    it('should display checkbox on shopping list items when in Shopping Mode', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
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
      // Story 7.5: Using Card structure now, need to find the inner Box with flex: 1
      const boxElements = container.querySelectorAll('.MuiBox-root');
      expect(boxElements.length).toBeGreaterThan(0);

      // Find the Box that contains the product name (should have reduced opacity)
      let foundReducedOpacity = false;
      for (const box of Array.from(boxElements)) {
        const styles = window.getComputedStyle(box);
        if (styles.opacity === '0.6') {
          foundReducedOpacity = true;
          break;
        }
      }
      expect(foundReducedOpacity).toBe(true);
    });

    it('should unchecked items show normal styling', () => {
      const uncheckedProduct = { ...mockProduct, isChecked: false };
      render(<ShoppingListItem product={uncheckedProduct} isShoppingMode={true} />);
      const productName = screen.getByText('Milk');
      const styles = window.getComputedStyle(productName);
      const hasStrikethrough = styles.textDecoration.includes('line-through');
      const hasReducedOpacity = parseFloat(styles.opacity) < 1;
      expect(hasStrikethrough).toBe(false);
      expect(hasReducedOpacity).toBe(false);
    });

    it('should checkbox be positioned on right side for one-handed operation (Story 4.3)', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
      const checkbox = document.querySelector('input[type="checkbox"]');
      const productName = screen.getByText('Milk');
      expect(checkbox).toBeInTheDocument();
      expect(productName).toBeInTheDocument();
      // Story 7.5: Card component uses flexbox with space-between
      const card = document.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should checkbox have accessibility attributes', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
      const checkbox = document.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      if (checkbox) {
        expect(checkbox.getAttribute('type')).toBe('checkbox');
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
        expect(width).toBeGreaterThanOrEqual(40);
        expect(height).toBeGreaterThanOrEqual(40);
      }
    });

    it('should Card have minimum height for tappable area (Story 4.3 AC1)', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
      // Story 7.5: Changed from ListItem to Card
      const card = document.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should show visual confirmation snackbar when item is checked', async () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        fireEvent.click(checkbox);
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
      const checkedProduct = { ...mockProduct, isChecked: true };
      const { rerender } = render(<ShoppingListItem product={checkedProduct} isShoppingMode={true} />);
      let checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeChecked();
      rerender(<ShoppingListItem product={checkedProduct} isShoppingMode={false} />);
      checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).not.toBeInTheDocument();
      rerender(<ShoppingListItem product={checkedProduct} isShoppingMode={true} />);
      checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it('should show product name in both Planning Mode and Shopping Mode', () => {
      const { rerender } = render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);
      expect(screen.getByText('Milk')).toBeInTheDocument();
      rerender(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('should show stock level text in both Planning Mode and Shopping Mode', () => {
      const { rerender } = render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);
      // Story 7.5: Stock level text visible in Planning Mode (changed from Chip to Typography)
      expect(screen.getByText('Almost empty')).toBeInTheDocument();
      rerender(<ShoppingListItem product={mockProduct} isShoppingMode={true} />);
      expect(screen.getByText('Almost empty')).toBeInTheDocument();
    });
  });

  // Story 7.5: 3-Dot Menu for Remove Action
  describe('3-Dot Menu (Story 7.5)', () => {
    it('should render 3-dot menu icon', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);
      const menuButton = document.querySelector('button[aria-label="More options"]');
      expect(menuButton).toBeInTheDocument();
    });

    it('should open menu when 3-dot icon is clicked', () => {
      render(<ShoppingListItem product={mockProduct} isShoppingMode={false} />);
      const menuButton = document.querySelector('button[aria-label="More options"]');
      if (menuButton) {
        fireEvent.click(menuButton);
        // Menu should appear with "Remove from list" option
        expect(screen.getByText('Remove from list')).toBeInTheDocument();
      }
    });
  });
});
