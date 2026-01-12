import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('should render stock level chip', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should render different stock levels correctly', () => {
    const mediumProduct = { ...mockProduct, stockLevel: 'medium' as const };
    const { rerender } = render(<ProductCard product={mediumProduct} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    const lowProduct = { ...mockProduct, stockLevel: 'low' as const };
    rerender(<ProductCard product={lowProduct} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
