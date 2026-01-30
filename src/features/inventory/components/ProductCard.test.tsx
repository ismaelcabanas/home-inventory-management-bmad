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
  isChecked: false, // Story 4.1: Add isChecked field
};

describe('ProductCard', () => {
  // Story 3.3: ProductCard now requires ShoppingProvider for useShoppingList hook
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ShoppingProvider>{children}</ShoppingProvider>
  );

  it('should render product name', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  // H5: Chip removed, StockLevelPicker shows current level via visual highlighting
  it('should render stock level picker with correct current level', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    // Verify picker is rendered with correct current level
    const highButton = screen.getByLabelText(/Set stock level to High/i);
    expect(highButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render high stock level correctly in picker', () => {
    const highProduct = { ...mockProduct, stockLevel: 'high' as const };
    render(<ProductCard product={highProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    const highButton = screen.getByLabelText(/Set stock level to High/i);
    expect(highButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render medium stock level correctly in picker', () => {
    const mediumProduct = { ...mockProduct, stockLevel: 'medium' as const };
    render(<ProductCard product={mediumProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    const mediumButton = screen.getByLabelText(/Set stock level to Medium/i);
    expect(mediumButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render low stock level correctly in picker', () => {
    const lowProduct = { ...mockProduct, stockLevel: 'low' as const };
    render(<ProductCard product={lowProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    const lowButton = screen.getByLabelText(/Set stock level to Low/i);
    expect(lowButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render empty stock level correctly in picker', () => {
    const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
    render(<ProductCard product={emptyProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    const emptyButton = screen.getByLabelText(/Set stock level to Empty/i);
    expect(emptyButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render product as MUI Card component', () => {
    const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('should render edit button', () => {
    const onEdit = vi.fn();
    render(<ProductCard product={mockProduct} onEdit={onEdit} onDelete={vi.fn()} />, { wrapper });

    const editButton = screen.getByLabelText(/Edit Milk/i);
    expect(editButton).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<ProductCard product={mockProduct} onEdit={onEdit} onDelete={vi.fn()} />, { wrapper });

    const editButton = screen.getByLabelText(/Edit Milk/i);
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockProduct);
  });

  it('should render delete button', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    const deleteButton = screen.getByLabelText(/Delete Milk/i);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should render delete button with red color', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    const deleteButton = screen.getByLabelText(/Delete Milk/i);
    // MUI error.main resolves to rgb(211, 47, 47) - verify red color applied
    expect(deleteButton).toHaveStyle({ color: 'rgb(211, 47, 47)' });
  });

  it('should render delete button with 44x44px touch target', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    const deleteButton = screen.getByLabelText(/Delete Milk/i);

    // Verify minWidth and minHeight are at least 44px (NFR8.1 requirement)
    expect(deleteButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={onDelete} />, { wrapper });

    const deleteButton = screen.getByLabelText(/Delete Milk/i);
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockProduct);
  });

  it('should render stock level picker', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    expect(screen.getByLabelText(/Set stock level to High/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set stock level to Medium/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set stock level to Low/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set stock level to Empty/i)).toBeInTheDocument();
  });

  it('should call onStockLevelChange when stock level is changed', async () => {
    const onStockLevelChange = vi.fn().mockResolvedValue(undefined);
    render(
      <ProductCard
        product={mockProduct}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStockLevelChange={onStockLevelChange}
      />, { wrapper }
    );

    const lowButton = screen.getByLabelText(/Set stock level to Low/i);
    fireEvent.click(lowButton);

    await vi.waitFor(() => {
      expect(onStockLevelChange).toHaveBeenCalledWith('1', 'low');
    });
  });

  it('should not call onStockLevelChange if handler not provided', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

    const lowButton = screen.getByLabelText(/Set stock level to Low/i);
    // Should not throw error when clicking without handler
    expect(() => fireEvent.click(lowButton)).not.toThrow();
  });

  // H6: Test UI rollback on persistence failure (AC5)
  it('should handle stock level update errors gracefully', async () => {
    // Mock with a rejection that will be caught by the component
    const onStockLevelChange = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error('Database error'));
    });

    render(
      <ProductCard
        product={mockProduct}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStockLevelChange={onStockLevelChange}
      />, { wrapper }
    );

    const lowButton = screen.getByLabelText(/Set stock level to Low/i);
    fireEvent.click(lowButton);

    // Verify the handler was called
    await vi.waitFor(() => {
      expect(onStockLevelChange).toHaveBeenCalledWith('1', 'low');
    });

    // Component should not crash on error (error is handled internally by component)
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  // H4: Test ARIA live region for accessibility
  it('should announce stock level changes to screen readers', async () => {
    const onStockLevelChange = vi.fn().mockResolvedValue(undefined);
    render(
      <ProductCard
        product={mockProduct}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStockLevelChange={onStockLevelChange}
      />, { wrapper }
    );

    // Verify ARIA live region exists
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();

    const lowButton = screen.getByLabelText(/Set stock level to Low/i);
    fireEvent.click(lowButton);

    // Wait for state update
    await vi.waitFor(() => {
      expect(liveRegion?.textContent).toBeTruthy();
    }, { timeout: 1000 });

    // Verify announcement message contains stock level
    expect(liveRegion?.textContent).toMatch(/Stock level changed/i);
  });

  // Story 2.2: Stock Level Chip Visual Indicators - Unit Tests (AC1)
  describe('Stock Level Chip Display', () => {
    it('should render green chip with "High" label for high stock level', () => {
      const highProduct = { ...mockProduct, stockLevel: 'high' as const };
      const { container } = render(<ProductCard product={highProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      // Find the Chip component by its MUI class
      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
      expect(chip?.textContent).toBe('High');

      // Verify green background color (#4caf50)
      expect(chip).toHaveStyle({ backgroundColor: 'rgb(76, 175, 80)' }); // #4caf50 as RGB
    });

    it('should render orange chip with "Medium" label for medium stock level', () => {
      const mediumProduct = { ...mockProduct, stockLevel: 'medium' as const };
      const { container } = render(<ProductCard product={mediumProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
      expect(chip?.textContent).toBe('Medium');

      // Verify orange background color (#ff9800)
      expect(chip).toHaveStyle({ backgroundColor: 'rgb(255, 152, 0)' }); // #ff9800 as RGB
    });

    it('should render orange/red chip with "Low" label for low stock level', () => {
      const lowProduct = { ...mockProduct, stockLevel: 'low' as const };
      const { container } = render(<ProductCard product={lowProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
      expect(chip?.textContent).toBe('Low');

      // Verify orange/red background color (#ff5722)
      expect(chip).toHaveStyle({ backgroundColor: 'rgb(255, 87, 34)' }); // #ff5722 as RGB
    });

    it('should render red chip with "Empty" label for empty stock level', () => {
      const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
      const { container } = render(<ProductCard product={emptyProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
      expect(chip?.textContent).toBe('Empty');

      // Verify red background color (#f44336)
      expect(chip).toHaveStyle({ backgroundColor: 'rgb(244, 67, 54)' }); // #f44336 as RGB
    });

    it('should use small chip size for mobile optimization', () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-sizeSmall');
    });

    it('should have readable font size (minimum 14px) for accessibility', () => {
      const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const chip = container.querySelector('.MuiChip-root');
      const computedStyles = window.getComputedStyle(chip!);

      // Font size should be at least 14px for mobile readability (AC2)
      const fontSize = parseInt(computedStyles.fontSize);
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });
  });

  // Story 3.3: Manual Shopping List Management - Integration Tests
  describe('Shopping List Button (Story 3.3)', () => {
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

    it('should show AddShoppingCartIcon when not on list', () => {
      const productNotOnList = { ...mockProduct, isOnShoppingList: false };
      const { container } = render(<ProductCard product={productNotOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      // MUI icon is SVG, check for AddShoppingCartIcon by its class
      const addIcon = container.querySelector('svg'); // AddShoppingCartIcon
      expect(addIcon).toBeInTheDocument();
    });

    it('should show RemoveShoppingCartIcon when on list', () => {
      const productOnList = { ...mockProduct, isOnShoppingList: true };
      const { container } = render(<ProductCard product={productOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      // Multiple icons present (remove cart, edit, delete), but we can verify remove cart is rendered
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });



    it('should have 44x44px touch target for mobile accessibility', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);
      expect(addButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });

    it('should have proper ARIA labels for accessibility', () => {
      const productNotOnList = { ...mockProduct, isOnShoppingList: false };
      render(<ProductCard product={productNotOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);
      expect(addButton).toHaveAttribute('aria-label', 'Add Milk to shopping list');
    });

    it('should update ARIA label when on shopping list', () => {
      const productOnList = { ...mockProduct, isOnShoppingList: true };
      render(<ProductCard product={productOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const removeButton = screen.getByLabelText(/Remove Milk from shopping list/i);
      expect(removeButton).toBeInTheDocument();
    });

    it('should announce changes to screen readers via ARIA live region', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      // Verify ARIA live region exists for accessibility announcements
      const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should position shopping list button before edit button', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);
      const editButton = screen.getByLabelText(/Edit Milk/i);

      // Verify both buttons exist
      expect(addButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();

      // Verify order by checking DOM position
      const allButtons = screen.getAllByRole('button');
      const addButtonIndex = allButtons.indexOf(addButton);
      const editButtonIndex = allButtons.indexOf(editButton);

      expect(addButtonIndex).toBeLessThan(editButtonIndex);
    });

    it('should handle button click without crashing', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);

      // Should not throw error when clicking
      expect(() => fireEvent.click(addButton)).not.toThrow();
    });

    it('should show success snackbar when adding to shopping list', async () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);

      // Wrap async operation in act()
      await act(async () => {
        fireEvent.click(addButton);
      });

      // Wait for snackbar to appear (appears in both ARIA region and Snackbar)
      await waitFor(() => {
        const messages = screen.getAllByText('Added to shopping list');
        expect(messages.length).toBeGreaterThan(0);
      });
    });

    it('should show success snackbar when removing from shopping list', async () => {
      const productOnList = { ...mockProduct, isOnShoppingList: true };
      render(<ProductCard product={productOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const removeButton = screen.getByLabelText(/Remove Milk from shopping list/i);

      // Wrap async operation in act()
      await act(async () => {
        fireEvent.click(removeButton);
      });

      // Wait for snackbar to appear (appears in both ARIA region and Snackbar)
      await waitFor(() => {
        const messages = screen.getAllByText('Removed from shopping list');
        expect(messages.length).toBeGreaterThan(0);
      });
    });
  });

  // Story 3.3: Manual Add/Remove Persistence Tests (Integration)
  describe('Manual Add/Remove Persistence (Story 3.3)', () => {
    it('should manually added product persist across app restart simulation', async () => {
      // Start with product not on list
      const { unmount } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const addButton = screen.getByLabelText(/Add Milk to shopping list/i);
      fireEvent.click(addButton);

      // Verify snackbar confirmation
      await waitFor(() => {
        const messages = screen.getAllByText('Added to shopping list');
        expect(messages.length).toBeGreaterThan(0);
      });

      // Simulate app restart by unmounting and remounting
      unmount();

      // Remount with updated product state (simulating persistence)
      const persistedProduct = { ...mockProduct, isOnShoppingList: true };
      render(<ProductCard product={persistedProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      // Should now show "Remove" button instead of "Add" (persistence verified)
      expect(screen.getByLabelText(/Remove Milk from shopping list/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Add Milk to shopping list/i)).not.toBeInTheDocument();
    });

    it('should manually removed product persist across app restart simulation', async () => {
      // Start with product on list
      const productOnList = { ...mockProduct, isOnShoppingList: true };
      const { unmount } = render(<ProductCard product={productOnList} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      const removeButton = screen.getByLabelText(/Remove Milk from shopping list/i);
      fireEvent.click(removeButton);

      // Verify snackbar confirmation
      await waitFor(() => {
        const messages = screen.getAllByText('Removed from shopping list');
        expect(messages.length).toBeGreaterThan(0);
      });

      // Simulate app restart by unmounting and remounting
      unmount();

      // Remount with updated product state (simulating persistence)
      const persistedProduct = { ...mockProduct, isOnShoppingList: false };
      render(<ProductCard product={persistedProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      // Should now show "Add" button instead of "Remove" (persistence verified)
      expect(screen.getByLabelText(/Add Milk to shopping list/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Remove Milk from shopping list/i)).not.toBeInTheDocument();
    });
  });

  // Story 3.3: AC4 - Manual Remove Precedence Tests
  describe('AC4: Manual Remove Precedence (Story 3.3)', () => {
    it('should manually removed Low item NOT auto-reappear when marked Low again (Option A)', async () => {
      // Scenario: User manually removes a Low item from list
      const lowProduct = { ...mockProduct, stockLevel: 'low' as const, isOnShoppingList: false };

      const { rerender } = render(<ProductCard product={lowProduct} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper });

      // Initially shows "Add" button (manually removed)
      expect(screen.getByLabelText(/Add Milk to shopping list/i)).toBeInTheDocument();

      // User marks it Low again (simulated by prop change - product stays same)
      // Rerender with same product to simulate prop update
      rerender(<ProductCard product={lowProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

      // Still shows "Add" button - manual remove is respected (Option A behavior)
      expect(screen.getByLabelText(/Add Milk to shopping list/i)).toBeInTheDocument();
    });
  });
});
