import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { ShoppingProvider } from '@/features/shopping/context/ShoppingContext';
import type { Product } from '@/types/product';

const mockProduct: Product = {
  id: '1',
  name: 'Milk',
  stockLevel: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOnShoppingList: false,
  isChecked: false,
};

describe('ProductCard (Improved UX with long-press to edit)', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ShoppingProvider>{children}</ShoppingProvider>
  );

  describe('Basic Rendering', () => {
    it('should render product name', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('should render as MUI Card component', () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });
      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render stock status text', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });
      expect(screen.getByText('In stock')).toBeInTheDocument();
    });
  });

  describe('Gradient Backgrounds by Stock Level', () => {
    it('should render green gradient for high stock level', () => {
      const highProduct = { ...mockProduct, stockLevel: 'high' as const };
      const { container } = render(<ProductCard product={highProduct} onEdit={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      const styles = window.getComputedStyle(card);

      // Check for gradient in background
      expect(styles.background).toContain('#e8f5e9');
      expect(styles.background).toContain('#c8e6c9');

      // Check for green border-left
      expect(card).toHaveStyle({ borderLeftWidth: '4px' });
    });

    it('should render yellow/orange gradient for medium stock level', () => {
      const mediumProduct = { ...mockProduct, stockLevel: 'medium' as const };
      const { container } = render(<ProductCard product={mediumProduct} onEdit={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      const styles = window.getComputedStyle(card);

      expect(styles.background).toContain('#fff8e1');
      expect(styles.background).toContain('#ffecb3');
    });

    it('should render orange/red gradient for low stock level', () => {
      const lowProduct = { ...mockProduct, stockLevel: 'low' as const };
      const { container } = render(<ProductCard product={lowProduct} onEdit={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      const styles = window.getComputedStyle(card);

      expect(styles.background).toContain('#fff3e0');
      expect(styles.background).toContain('#ffe0b2');
    });

    it('should render red gradient for empty stock level', () => {
      const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
      const { container } = render(<ProductCard product={emptyProduct} onEdit={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      const styles = window.getComputedStyle(card);

      expect(styles.background).toContain('#ffebee');
      expect(styles.background).toContain('#ffcdd2');
    });

    it('should display correct status text for each stock level', () => {
      const levels: Array<Product['stockLevel']> = ['high', 'medium', 'low', 'empty'];
      const expectedTexts = ['In stock', 'Running low', 'Almost empty', 'Empty'];

      levels.forEach((level, index) => {
        const product = { ...mockProduct, stockLevel: level };
        const { unmount } = render(<ProductCard product={product} onEdit={vi.fn()} />, { wrapper });
        expect(screen.getByText(expectedTexts[index])).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Tap-to-Cycle Stock Level', () => {
    it('should call onCycleStockLevel when card is clicked', async () => {
      const onCycleStockLevel = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      fireEvent.click(card);

      await waitFor(() => {
        expect(onCycleStockLevel).toHaveBeenCalledWith('1');
      });
    });

    it('should not call onCycleStockLevel when shopping list button is clicked', () => {
      const onCycleStockLevel = vi.fn();
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const addButton = container.querySelector('button[aria-label*="shopping list"]') as HTMLElement;
      fireEvent.click(addButton);

      expect(onCycleStockLevel).not.toHaveBeenCalled();
    });

    it('should show confirmation snackbar after successful cycle', async () => {
      const onCycleStockLevel = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      fireEvent.click(card);

      // Wait for state to update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(screen.queryByText('Stock level updated')).toBeInTheDocument();
    });

    it('should announce stock level change to screen readers', async () => {
      const onCycleStockLevel = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      fireEvent.click(card);

      // Wait for state to update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(liveRegion?.textContent).toMatch(/Stock level changed/i);
    });
  });

  describe('Long-Press to Edit', () => {
    it('should show edit hint on long press', async () => {
      vi.useFakeTimers();
      const onEdit = vi.fn();
      const { container } = render(<ProductCard product={mockProduct} onEdit={onEdit} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;

      // Start long press
      fireEvent.mouseDown(card);

      // Fast forward to trigger long press
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Should show edit hint
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should call onEdit after long press completes', async () => {
      vi.useFakeTimers();
      const onEdit = vi.fn();
      const { container } = render(<ProductCard product={mockProduct} onEdit={onEdit} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;

      // Start long press
      fireEvent.mouseDown(card);

      // Fast forward to trigger long press
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Release after long press
      fireEvent.mouseUp(card);

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith(mockProduct);
      });

      vi.useRealTimers();
    });

    it('should NOT call onEdit after short click', async () => {
      const onEdit = vi.fn();
      const onCycleStockLevel = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onEdit={onEdit}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const card = container.querySelector('.MuiCard-root') as HTMLElement;

      // Quick click (no long press)
      fireEvent.mouseDown(card);
      fireEvent.mouseUp(card);

      await waitFor(() => {
        expect(onEdit).not.toHaveBeenCalled();
        expect(onCycleStockLevel).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have 44x44px touch target for shopping list button', () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });

      const addButton = container.querySelector('button[aria-label*="shopping list"]') as HTMLElement;
      expect(addButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });
  });

  describe('Shopping List Management', () => {
    it('should render shopping cart button when product is not on list', () => {
      const productNotOnList = { ...mockProduct, isOnShoppingList: false };
      const { container } = render(<ProductCard product={productNotOnList} onEdit={vi.fn()} />, { wrapper });

      const addButton = container.querySelector('button[aria-label*="Add"]') as HTMLElement;
      expect(addButton).toBeInTheDocument();
    });

    it('should render remove shopping cart button when product is on list', () => {
      const productOnList = { ...mockProduct, isOnShoppingList: true };
      const { container } = render(<ProductCard product={productOnList} onEdit={vi.fn()} />, { wrapper });

      const removeButton = container.querySelector('button[aria-label*="Remove"]') as HTMLElement;
      expect(removeButton).toBeInTheDocument();
    });

    it('should handle shopping list toggle without crashing', () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });

      const addButton = container.querySelector('button[aria-label*="shopping list"]') as HTMLElement;
      expect(() => fireEvent.click(addButton)).not.toThrow();
    });

    it('should show snackbar when adding to shopping list', async () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });

      const addButton = container.querySelector('button[aria-label*="shopping list"]') as HTMLElement;

      fireEvent.click(addButton);

      // Wait for state to update and snackbar to appear
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Check if snackbar message exists (may be multiple instances)
      expect(screen.getAllByText('Added to shopping list').length).toBeGreaterThan(0);
    });

    it('should show snackbar when removing from shopping list', async () => {
      const productOnList = { ...mockProduct, isOnShoppingList: true };
      const { container } = render(<ProductCard product={productOnList} onEdit={vi.fn()} />, { wrapper });

      const removeButton = container.querySelector('button[aria-label*="shopping list"]') as HTMLElement;

      fireEvent.click(removeButton);

      // Wait for state to update and snackbar to appear
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Check if snackbar message exists (may be multiple instances)
      expect(screen.getAllByText('Removed from shopping list').length).toBeGreaterThan(0);
    });
  });

  describe('Visual Feedback', () => {
    it('should have smooth background transition', () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      const styles = window.getComputedStyle(card);

      // Check for transition property
      expect(styles.transition).toContain('background');
    });

    it('should have visual feedback during long press', async () => {
      vi.useFakeTimers();
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;

      // Start long press
      fireEvent.mouseDown(card);

      // Fast forward to trigger long press
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Card should have scale transform during long press
      await waitFor(() => {
        expect(card).toHaveStyle({ transform: 'scale(0.98)' });
      });

      vi.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have ARIA live region for announcements', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });

      const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });
});
