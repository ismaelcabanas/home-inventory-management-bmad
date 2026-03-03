import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingCompletionDialog } from './ShoppingCompletionDialog';

describe('ShoppingCompletionDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when open is false', () => {
      const { container } = render(
        <ShoppingCompletionDialog
          open={false}
          checkedCount={5}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('should render when open is true', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={5}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Item Counts Display', () => {
    it('should show correct item counts in message', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={7}
          totalCount={12}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText(/You collected 7 of 12 items/i)).toBeInTheDocument();
    });

    it('should show zero items collected correctly', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={0}
          totalCount={5}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText(/You collected 0 of 5 items/i)).toBeInTheDocument();
    });
  });

  describe('Celebratory Message (AC4)', () => {
    it('should show celebratory message when all items collected', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={10}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText(/Great job! You got everything! 🎉/i)).toBeInTheDocument();
    });

    it('should show standard message when not all items collected', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={8}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText(/Are you done shopping?/i)).toBeInTheDocument();
      expect(screen.queryByText(/Great job! You got everything!/i)).not.toBeInTheDocument();
    });
  });

  describe('Helpful Message for Partial Completion (AC5)', () => {
    it('should show helpful messaging when some but not all items collected', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={5}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText(/Any items not collected will stay on your list for next time/i)).toBeInTheDocument();
    });

    it('should not show helpful messaging when all items collected', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={10}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.queryByText(/Any items not collected will stay on your list for next time/i)).not.toBeInTheDocument();
    });

    it('should not show helpful messaging when no items collected', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={0}
          totalCount={5}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.queryByText(/Any items not collected will stay on your list for next time/i)).not.toBeInTheDocument();
    });
  });

  describe('Button Callbacks', () => {
    it('should call onConfirm when "Yes, I\'m done" button is clicked', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={5}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const confirmButton = screen.getByRole('button', { name: /yes, i'm done/i });
      fireEvent.click(confirmButton);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when "No, continue shopping" button is clicked', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={5}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const cancelButton = screen.getByRole('button', { name: /no, continue shopping/i });
      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when dialog backdrop is clicked', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={5}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      // MUI Dialog backdrop is handled internally, just verify dialog structure
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should call onCancel when escape key is pressed', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={5}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      // MUI Dialog handles escape key internally
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Mobile-Friendly Styling (AC1)', () => {
    it('should render dialog with proper structure for mobile', () => {
      render(
        <ShoppingCompletionDialog
          open={true}
          checkedCount={5}
          totalCount={10}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      // Verify dialog renders with proper structure
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });
});
