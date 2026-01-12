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

  it('should render high stock level correctly', () => {
    const highProduct = { ...mockProduct, stockLevel: 'high' as const };
    render(<ProductCard product={highProduct} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should render medium stock level correctly', () => {
    const mediumProduct = { ...mockProduct, stockLevel: 'medium' as const };
    render(<ProductCard product={mediumProduct} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('should render low stock level correctly', () => {
    const lowProduct = { ...mockProduct, stockLevel: 'low' as const };
    render(<ProductCard product={lowProduct} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('should render empty stock level correctly', () => {
    const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
    render(<ProductCard product={emptyProduct} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render product as MUI Card component', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });
});
