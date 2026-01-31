import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

describe('DeleteConfirmationDialog', () => {
  it('should render when open with product name', () => {
    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        productName="Milk"
      />
    );

    expect(screen.getByText('Delete Product?')).toBeInTheDocument();
    expect(screen.getByText(/Delete "Milk"\?/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <DeleteConfirmationDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        productName="Milk"
      />
    );

    expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button clicked', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        productName="Milk"
      />
    );

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should close dialog on cancel', () => {
    const onClose = vi.fn();

    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        productName="Milk"
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should show loading state during deletion', async () => {
    const onConfirm = vi.fn((): Promise<void> => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        productName="Milk"
      />
    );

    const deleteButton = screen.getAllByText('Delete').find(el => el.tagName === 'BUTTON');
    fireEvent.click(deleteButton!);

    // Cancel button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });
  });

  it('should keep dialog open on error', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('Delete failed'));
    const onClose = vi.fn();

    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        productName="Milk"
      />
    );

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });

    // Dialog should stay open (onClose not called)
    expect(onClose).not.toHaveBeenCalled();
  });
});
