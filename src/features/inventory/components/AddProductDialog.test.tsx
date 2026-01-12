import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddProductDialog } from './AddProductDialog';

describe('AddProductDialog', () => {
  it('should render when open', () => {
    render(<AddProductDialog open={true} onClose={vi.fn()} onAdd={vi.fn()} />);
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<AddProductDialog open={false} onClose={vi.fn()} onAdd={vi.fn()} />);
    expect(screen.queryByText('Add Product')).not.toBeInTheDocument();
  });

  it('should call onAdd when form submitted', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<AddProductDialog open={true} onClose={onClose} onAdd={onAdd} />);

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'Milk' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith('Milk');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should not submit empty product name', () => {
    const onAdd = vi.fn();
    render(<AddProductDialog open={true} onClose={vi.fn()} onAdd={onAdd} />);

    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
