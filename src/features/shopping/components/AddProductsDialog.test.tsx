import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddProductsDialog } from './AddProductsDialog';
import type { Product } from '@/types/product';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Milk',
    stockLevel: 'low',
    isOnShoppingList: false,
    isChecked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Bread',
    stockLevel: 'high',
    isOnShoppingList: false,
    isChecked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('AddProductsDialog', () => {
  const mockOnAddProduct = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open is true', () => {
      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      expect(screen.getByText('Add Products to Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      render(
        <AddProductsDialog
          open={false}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      expect(screen.queryByText('Add Products to Shopping List')).not.toBeInTheDocument();
    });

    it('should show empty state when no products available', () => {
      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={[]}
          onAddProduct={mockOnAddProduct}
        />
      );

      expect(screen.getByText('All products are already on your shopping list')).toBeInTheDocument();
    });
  });

  describe('Product Display', () => {
    it('should display product name and stock level', () => {
      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
      // Stock level text should be shown (getStockLevelText returns "Almost empty" for 'low')
      expect(screen.getByText(/Almost empty/i)).toBeInTheDocument();
    });
  });

  describe('Adding Products', () => {
    it('should call onAddProduct when product is clicked', async () => {
      const user = userEvent.setup();
      mockOnAddProduct.mockResolvedValue(undefined);

      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      const milkButton = screen.getByRole('button', { name: /add milk to shopping list/i });
      await user.click(milkButton);

      await waitFor(() => {
        expect(mockOnAddProduct).toHaveBeenCalledWith('1');
      });
    });

    it('should visually mark product as added after successful add', async () => {
      const user = userEvent.setup();
      mockOnAddProduct.mockResolvedValue(undefined);

      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      const milkButton = screen.getByRole('button', { name: /add milk to shopping list/i });
      await user.click(milkButton);

      await waitFor(() => {
        expect(screen.queryAllByTestId('CheckIcon').length).toBeGreaterThan(0);
      });
    });

    it('should disable product button after adding', async () => {
      const user = userEvent.setup();
      mockOnAddProduct.mockResolvedValue(undefined);

      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      const milkButton = screen.getByRole('button', { name: /add milk to shopping list/i });
      await user.click(milkButton);

      // Wait for the CheckIcon to appear (indicating the product was added)
      await waitFor(
        () => {
          expect(screen.queryByTestId('CheckIcon')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // After the checkmark appears, the button should be disabled
      // Query for the button again to get the updated DOM element
      const allButtons = screen.getAllByRole('button');
      const milkButtonAfter = allButtons.find(btn => btn.getAttribute('aria-label')?.includes('Milk'));
      expect(milkButtonAfter).toHaveAttribute('aria-disabled', 'true');
    });

    it('should allow adding multiple products', async () => {
      const user = userEvent.setup();
      mockOnAddProduct.mockResolvedValue(undefined);

      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      const milkButton = screen.getByRole('button', { name: /add milk to shopping list/i });
      const breadButton = screen.getByRole('button', { name: /add bread to shopping list/i });

      await user.click(milkButton);
      await user.click(breadButton);

      await waitFor(() => {
        expect(mockOnAddProduct).toHaveBeenCalledWith('1');
        expect(mockOnAddProduct).toHaveBeenCalledWith('2');
      });
    });
  });

  describe('Dialog Close', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      const closeButton = screen.getByLabelText('Close dialog');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when Close button in actions is clicked', async () => {
      const user = userEvent.setup();

      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset added products when dialog closes and reopens', async () => {
      const user = userEvent.setup();
      mockOnAddProduct.mockResolvedValue(undefined);

      const { rerender } = render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      // Add a product
      const milkButton = screen.getByRole('button', { name: /add milk to shopping list/i });
      await user.click(milkButton);

      await waitFor(() => {
        expect(screen.queryAllByTestId('CheckIcon').length).toBeGreaterThan(0);
      });

      // Close and reopen dialog
      rerender(
        <AddProductsDialog
          open={false}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      rerender(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      // Product should be enabled again
      const milkButtonAfterReopen = screen.getByRole('button', { name: /add milk to shopping list/i });
      expect(milkButtonAfterReopen).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should not mark product as added when onAddProduct fails', async () => {
      const user = userEvent.setup();

      // Create a promise that rejects
      mockOnAddProduct.mockImplementation(() => Promise.reject(new Error('Failed to add')));

      render(
        <AddProductsDialog
          open={true}
          onClose={mockOnClose}
          availableProducts={mockProducts}
          onAddProduct={mockOnAddProduct}
        />
      );

      // Find the button by aria-label
      const milkButton = screen.getByRole('button', { name: /add milk to shopping list/i });

      // Button should be enabled before click
      expect(milkButton).not.toBeDisabled();

      // Click should trigger the add (which will fail)
      await user.click(milkButton);

      // Wait a bit for the async operation to complete
      await waitFor(
        () => {
          expect(mockOnAddProduct).toHaveBeenCalledWith('1');
        },
        { timeout: 3000 }
      );

      // Button should still be enabled after failed add
      expect(milkButton).not.toBeDisabled();

      // No checkmark should be shown (product not added)
      expect(screen.queryByTestId('CheckIcon')).not.toBeInTheDocument();
    });
  });
});
