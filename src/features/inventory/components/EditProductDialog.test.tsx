import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProductDialog } from './EditProductDialog';
import type { Product } from '@/types/product';

const mockProduct: Product = {
  id: '1',
  name: 'Milk',
  stockLevel: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOnShoppingList: false,
};

describe('EditProductDialog', () => {
  it('should render when open with product name pre-filled', () => {
    render(
      <EditProductDialog
        open={true}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        product={mockProduct}
      />
    );

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Milk')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <EditProductDialog
        open={false}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        product={mockProduct}
      />
    );

    expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
  });

  it('should call onEdit with updated name when form submitted', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <EditProductDialog
        open={true}
        onClose={onClose}
        onEdit={onEdit}
        product={mockProduct}
      />
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'Whole Milk' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith('1', 'Whole Milk');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should not submit empty product name', () => {
    const onEdit = vi.fn();

    render(
      <EditProductDialog
        open={true}
        onClose={vi.fn()}
        onEdit={onEdit}
        product={mockProduct}
      />
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByText('Save'));

    expect(onEdit).not.toHaveBeenCalled();
  });

  it('should close dialog on cancel', () => {
    const onClose = vi.fn();

    render(
      <EditProductDialog
        open={true}
        onClose={onClose}
        onEdit={vi.fn()}
        product={mockProduct}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should trim whitespace from product name', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);

    render(
      <EditProductDialog
        open={true}
        onClose={vi.fn()}
        onEdit={onEdit}
        product={mockProduct}
      />
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: '  Whole Milk  ' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith('1', 'Whole Milk');
    });
  });
});
