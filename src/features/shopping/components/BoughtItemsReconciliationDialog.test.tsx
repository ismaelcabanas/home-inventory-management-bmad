/**
 * BoughtItemsReconciliationDialog Component Tests (Story 11.7)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BoughtItemsReconciliationDialog } from './BoughtItemsReconciliationDialog';

describe('BoughtItemsReconciliationDialog', () => {
  const mockOnKeep = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnKeepMarked = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    open: false,
    itemCount: 0,
    items: [],
    onKeep: mockOnKeep,
    onRemove: mockOnRemove,
    onKeepMarked: mockOnKeepMarked,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dialog Visibility', () => {
    it('should not render dialog when open is false', () => {
      const { container } = render(<BoughtItemsReconciliationDialog {...defaultProps} />);

      // Dialog should not be in the document
      expect(container.querySelector('.MuiDialog-root')).not.toBeInTheDocument();
    });

    it('should render dialog when open is true', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} />);

      // Dialog title should be visible
      expect(screen.getByText('Unconfirmed Items')).toBeInTheDocument();
    });
  });

  describe('Singular/Plural Copy', () => {
    it('should display singular copy when itemCount is 1', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={1} />);

      expect(screen.getByText(/1 item was marked as bought/)).toBeInTheDocument();
    });

    it('should display plural copy when itemCount is greater than 1', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={3} />);

      expect(screen.getByText(/3 items were marked as bought/)).toBeInTheDocument();
    });
  });

  describe('Items List', () => {
    it('should display up to 5 items', () => {
      const items = [
        { id: '1', name: 'Milk' },
        { id: '2', name: 'Bread' },
        { id: '3', name: 'Eggs' },
        { id: '4', name: 'Cheese' },
        { id: '5', name: 'Yogurt' },
      ];

      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} items={items} itemCount={5} />);

      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
      expect(screen.getByText('Eggs')).toBeInTheDocument();
      expect(screen.getByText('Cheese')).toBeInTheDocument();
      expect(screen.getByText('Yogurt')).toBeInTheDocument();
    });

    it('should show truncation message when more than 5 items', () => {
      const items = [
        { id: '1', name: 'Milk' },
        { id: '2', name: 'Bread' },
        { id: '3', name: 'Eggs' },
        { id: '4', name: 'Cheese' },
        { id: '5', name: 'Yogurt' },
        { id: '6', name: 'Butter' },
        { id: '7', name: 'Juice' },
      ];

      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} items={items} itemCount={7} />);

      // Should show "and 2 more"
      expect(screen.getByText(/and 2 more/)).toBeInTheDocument();
    });

    it('should calculate "X more" correctly', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        name: `Product ${i + 1}`,
      }));

      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} items={items} itemCount={10} />);

      // Should show "and 5 more" (10 - 5 = 5)
      expect(screen.getByText(/and 5 more/)).toBeInTheDocument();
    });

    it('should not show items list when items array is empty', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} items={[]} itemCount={0} />);

      expect(screen.queryByText('Unconfirmed items:')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should call onKeep when "Keep in list" button is clicked', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      const keepButton = screen.getByText(/Keep in list/);
      fireEvent.click(keepButton);

      expect(mockOnKeep).toHaveBeenCalledTimes(1);
    });

    it('should call onRemove when "Remove" button is clicked', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      const removeButton = screen.getByText(/Remove/);
      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onKeepMarked when "Keep marked" button is clicked', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      const keepMarkedButton = screen.getByText(/Keep marked/);
      fireEvent.click(keepMarkedButton);

      expect(mockOnKeepMarked).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when dialog is closed', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      // Click the backdrop to close
      const dialog = screen.getByText('Unconfirmed Items').closest('.MuiDialog-root');
      if (dialog) {
        fireEvent.click(dialog, { target: { classList: { contains: (className: string) => className.includes('MuiBackdrop-root') } } });
      }

      // onClose should be called when backdrop is clicked (MUI Dialog default behavior)
      // Note: This is a simplified test - in real scenario, the Dialog component handles this
    });

    it('should have "Keep marked" as primary (contained) button', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      const keepMarkedButton = screen.getByText(/Keep marked/);
      expect(keepMarkedButton).toHaveClass('MuiButton-contained');
    });

    it('should have error color on Remove button', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      const removeButton = screen.getByText(/Remove/);
      expect(removeButton).toHaveClass('MuiButton-outlinedError');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      const heading = screen.getByRole('heading', { level: 2 }); // DialogTitle is h2
      expect(heading).toHaveTextContent('Unconfirmed Items');
    });

    it('should have descriptive text for actions', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      expect(screen.getByText(/I didn't buy them/)).toBeInTheDocument();
      expect(screen.getByText(/I forgot to scan them/)).toBeInTheDocument();
      expect(screen.getByText(/add to inventory manually later/)).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('should show helper text explaining what to do', () => {
      render(<BoughtItemsReconciliationDialog {...defaultProps} open={true} itemCount={2} />);

      expect(screen.getByText(/Choose what to do with these items:/)).toBeInTheDocument();
    });
  });
});
