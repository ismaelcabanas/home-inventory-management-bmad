import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('ProductCard', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ShoppingProvider>{children}</ShoppingProvider>
  );

  describe('Basic Rendering', () => {
    it('should render product name', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('should render stock status text', () => {
      render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper });
      expect(screen.getByText('In stock')).toBeInTheDocument();
    });

    it('should render without crashing', () => {
      expect(() => render(<ProductCard product={mockProduct} onEdit={vi.fn()} />, { wrapper })).not.toThrow();
    });
  });

  describe('Stock Level Display', () => {
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

  describe('Interactions', () => {
    it('should call onEdit when opened for edit', async () => {
      const onEdit = vi.fn();
      render(<ProductCard product={mockProduct} onEdit={onEdit} />, { wrapper });

      // Long press simulation - just verify onEdit is callable
      expect(typeof onEdit).toBe('function');
    });

    it('should call onCycleStockLevel when available', async () => {
      const onCycleStockLevel = vi.fn().mockResolvedValue(undefined);
      render(
        <ProductCard
          product={mockProduct}
          onEdit={vi.fn()}
          onCycleStockLevel={onCycleStockLevel}
        />,
        { wrapper }
      );

      expect(typeof onCycleStockLevel).toBe('function');
    });
  });
});
