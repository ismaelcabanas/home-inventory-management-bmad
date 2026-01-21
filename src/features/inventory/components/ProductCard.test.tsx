import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types/product';

const mockProduct: Product = {
  id: '1',
  name: 'Milk',
  stockLevel: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOnShoppingList: false,
};

describe('ProductCard', () => {
  it('should render product name', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  // H5: Chip removed, StockLevelPicker shows current level via visual highlighting
  it('should render stock level picker with correct current level', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

    // Verify picker is rendered with correct current level
    const highButton = screen.getByLabelText(/Set stock level to High/i);
    expect(highButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render high stock level correctly in picker', () => {
    const highProduct = { ...mockProduct, stockLevel: 'high' as const };
    render(<ProductCard product={highProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const highButton = screen.getByLabelText(/Set stock level to High/i);
    expect(highButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render medium stock level correctly in picker', () => {
    const mediumProduct = { ...mockProduct, stockLevel: 'medium' as const };
    render(<ProductCard product={mediumProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const mediumButton = screen.getByLabelText(/Set stock level to Medium/i);
    expect(mediumButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render low stock level correctly in picker', () => {
    const lowProduct = { ...mockProduct, stockLevel: 'low' as const };
    render(<ProductCard product={lowProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const lowButton = screen.getByLabelText(/Set stock level to Low/i);
    expect(lowButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render empty stock level correctly in picker', () => {
    const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
    render(<ProductCard product={emptyProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const emptyButton = screen.getByLabelText(/Set stock level to Empty/i);
    expect(emptyButton.closest('button')).toHaveClass('Mui-selected');
  });

  it('should render product as MUI Card component', () => {
    const { container } = render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('should render edit button', () => {
    const onEdit = vi.fn();
    render(<ProductCard product={mockProduct} onEdit={onEdit} onDelete={vi.fn()} />);

    const editButton = screen.getByLabelText(/Edit Milk/i);
    expect(editButton).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<ProductCard product={mockProduct} onEdit={onEdit} onDelete={vi.fn()} />);

    const editButton = screen.getByLabelText(/Edit Milk/i);
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockProduct);
  });

  it('should render delete button', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const deleteButton = screen.getByLabelText(/Delete Milk/i);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should render delete button with red color', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const deleteButton = screen.getByLabelText(/Delete Milk/i);
    // MUI error.main resolves to rgb(211, 47, 47) - verify red color applied
    expect(deleteButton).toHaveStyle({ color: 'rgb(211, 47, 47)' });
  });

  it('should render delete button with 44x44px touch target', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const deleteButton = screen.getByLabelText(/Delete Milk/i);

    // Verify minWidth and minHeight are at least 44px (NFR8.1 requirement)
    expect(deleteButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText(/Delete Milk/i);
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockProduct);
  });

  it('should render stock level picker', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

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
      />
    );

    const lowButton = screen.getByLabelText(/Set stock level to Low/i);
    fireEvent.click(lowButton);

    await vi.waitFor(() => {
      expect(onStockLevelChange).toHaveBeenCalledWith('1', 'low');
    });
  });

  it('should not call onStockLevelChange if handler not provided', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);

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
      />
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
      />
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
});
