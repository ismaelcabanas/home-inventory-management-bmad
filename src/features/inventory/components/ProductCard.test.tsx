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

describe('ProductCard (Story 7.1: Redesigned with tap-to-cycle and gradients)', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ShoppingProvider>{children}</ShoppingProvider>
  );

  describe('Basic Rendering', () => {
    it('should render product name', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('should render as MUI Card component', () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });
      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should render stock status text', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });
      expect(screen.getByText('In stock')).toBeInTheDocument();
    });
  });

  describe('Story 7.1 AC3-AC4: Gradient Backgrounds by Stock Level', () => {
    it('should render green gradient for high stock level', () => {
      const highProduct = { ...mockProduct, stockLevel: 'high' as const };
      const { container } = render(<ProductCard product={highProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

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
      const { container } = render(<ProductCard product={mediumProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      const styles = window.getComputedStyle(card);

      expect(styles.background).toContain('#fff8e1');
      expect(styles.background).toContain('#ffecb3');
    });

    it('should render orange/red gradient for low stock level', () => {
      const lowProduct = { ...mockProduct, stockLevel: 'low' as const };
      const { container } = render(<ProductCard product={lowProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      const styles = window.getComputedStyle(card);

      expect(styles.background).toContain('#fff3e0');
      expect(styles.background).toContain('#ffe0b2');
    });

    it('should render red gradient for empty stock level', () => {
      const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
      const { container } = render(<ProductCard product={emptyProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

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
        const { unmount } = render(<ProductCard product={product} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });
        expect(screen.getByText(expectedTexts[index])).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Story 7.1 AC5: Tap-to-Cycle Stock Level', () => {
    it('should call onCycleStockLevel when card is clicked', async () => {
      const onCycleStockLevel = vi.fn().mockResolvedValue(undefined);
      render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const card = screen.getByLabelText(/Milk, In stock. Tap to cycle stock level./i);
      fireEvent.click(card);

      await waitFor(() => {
        expect(onCycleStockLevel).toHaveBeenCalledWith('1');
      });
    });

    it('should not call onCycleStockLevel when menu icon is clicked', () => {
      const onCycleStockLevel = vi.fn();
      render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const menuButton = screen.getByLabelText(/Actions for Milk/i);
      fireEvent.click(menuButton);

      expect(onCycleStockLevel).not.toHaveBeenCalled();
    });

    it('should not call onCycleStockLevel when shopping list button is clicked', () => {
      const onCycleStockLevel = vi.fn();
      render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);
      fireEvent.click(addButton);

      expect(onCycleStockLevel).not.toHaveBeenCalled();
    });

    it('should show confirmation snackbar after successful cycle', async () => {
      const onCycleStockLevel = vi.fn().mockResolvedValue(undefined);
      render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const card = screen.getByLabelText(/Milk, In stock. Tap to cycle stock level./i);
      fireEvent.click(card);

      // Wait for state to update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(screen.queryByText('Stock level updated')).toBeInTheDocument();
    });

    it('should announce stock level change to screen readers', async () => {
      const onCycleStockLevel = vi.fn().mockResolvedValue(undefined);
      render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();

      const card = screen.getByLabelText(/Milk, In stock. Tap to cycle stock level./i);
      fireEvent.click(card);

      // Wait for state to update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(liveRegion?.textContent).toMatch(/Stock level changed/i);
    });
  });

  describe('Story 7.1 AC8: Touch Target Sizes', () => {
    it('should have 44x44px touch target for shopping list button', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);
      expect(addButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });

    it('should have 44x44px touch target for menu button', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const menuButton = screen.getByLabelText(/Actions for Milk/i);
      expect(menuButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });
  });

  describe('Story 7.1: Action Menu (3-dot menu)', () => {
    it('should render 3-dot menu icon', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const menuButton = screen.getByLabelText(/Actions for Milk/i);
      expect(menuButton).toBeInTheDocument();
    });

    it('should open menu when 3-dot icon is clicked', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const menuButton = screen.getByLabelText(/Actions for Milk/i);
      fireEvent.click(menuButton);

      // Menu should be visible
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should call onEdit when Edit is clicked', () => {
      const onEdit = vi.fn();
      render(<ProductCard product={mockProduct} onEdit={onEdit} onDelete={vi.fn()} />, { wrapper });

      const menuButton = screen.getByLabelText(/Actions for Milk/i);
      fireEvent.click(menuButton);

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockProduct);
    });

    it('should call onDelete when Delete is clicked', () => {
      const onDelete = vi.fn();
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={onDelete} />, { wrapper });

      const menuButton = screen.getByLabelText(/Actions for Milk/i);
      fireEvent.click(menuButton);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(mockProduct);
    });

    it('should close menu after Edit is clicked', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const menuButton = screen.getByLabelText(/Actions for Milk/i);
      fireEvent.click(menuButton);

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      // Menu should be closed (no longer visible)
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('Story 3.3: Shopping List Management', () => {
    it('should render shopping cart button when product is not on list', () => {
      const productNotOnList = { ...mockProduct, isOnShoppingList: false };
      render(<ProductCard product={productNotOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);
      expect(addButton).toBeInTheDocument();
    });

    it('should render remove shopping cart button when product is on list', () => {
      const productOnList = { ...mockProduct, isOnShoppingList: true };
      render(<ProductCard product={productOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const removeButton = screen.getByLabelText(/Remove Milk from shopping list/i);
      expect(removeButton).toBeInTheDocument();
    });

    it('should handle shopping list toggle without crashing', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);
      expect(() => fireEvent.click(addButton)).not.toThrow();
    });

    it('should show snackbar when adding to shopping list', async () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);

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
      render(<ProductCard product={productOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const removeButton = screen.getByLabelText(/Remove Milk from shopping list/i);

      fireEvent.click(removeButton);

      // Wait for state to update and snackbar to appear
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Check if snackbar message exists (may be multiple instances)
      expect(screen.getAllByText('Removed from shopping list').length).toBeGreaterThan(0);
    });
  });

  describe('Story 7.1 AC9: Visual Feedback', () => {
    it('should have smooth background transition', () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const card = container.querySelector('.MuiCard-root') as HTMLElement;
      const styles = window.getComputedStyle(card);

      // Check for transition property
      expect(styles.transition).toContain('background');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label for card', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const card = screen.getByLabelText(/Milk, In stock. Tap to cycle stock level./i);
      expect(card).toBeInTheDocument();
    });

    it('should have ARIA live region for announcements', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should have proper ARIA labels for all buttons', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      expect(screen.getByLabelText(/Add Milk to shopping list/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Actions for Milk/i)).toBeInTheDocument();
    });
  });
});
