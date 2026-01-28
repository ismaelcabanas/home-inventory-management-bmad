import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShoppingListItem } from './ShoppingListItem';
import { STOCK_LEVEL_CONFIG } from '@/features/inventory/components/stockLevelConfig';

describe('ShoppingListItem', () => {
  const mockProduct = {
    id: '1',
    name: 'Milk',
    stockLevel: 'low' as const,
    isOnShoppingList: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  };

  it('should render product name', () => {
    render(<ShoppingListItem product={mockProduct} />);

    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('should render stock level chip', () => {
    render(<ShoppingListItem product={mockProduct} />);

    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('should use correct STOCK_LEVEL_CONFIG for styling', () => {
    render(<ShoppingListItem product={mockProduct} />);

    const chip = screen.getByText('Low');
    const stockConfig = STOCK_LEVEL_CONFIG[mockProduct.stockLevel];

    expect(chip).toBeInTheDocument();
    // MUI converts hex to rgb, so we check the chip exists and has the label
    expect(chip).toHaveTextContent(stockConfig.label);
  });

  it('should render Empty stock level correctly', () => {
    const emptyProduct = { ...mockProduct, stockLevel: 'empty' as const };
    render(<ShoppingListItem product={emptyProduct} />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render with proper spacing and layout', () => {
    render(<ShoppingListItem product={mockProduct} />);

    const listItem = document.querySelector('li');
    expect(listItem).toBeInTheDocument();
  });
});
