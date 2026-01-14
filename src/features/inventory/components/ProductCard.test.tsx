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

  it('should render stock level chip', () => {
    render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should render high stock level correctly', () => {
    const highProduct = { ...mockProduct, stockLevel: 'high' as const };
    render(<ProductCard product={highProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should render medium stock level correctly', () => {
    const mediumProduct = { ...mockProduct, stockLevel: 'medium' as const };
    render(<ProductCard product={mediumProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('should render low stock level correctly', () => {
    const lowProduct = { ...mockProduct, stockLevel: 'low' as const };
    render(<ProductCard product={lowProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('should render empty stock level correctly', () => {
    const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
    render(<ProductCard product={emptyProduct} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
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
});
