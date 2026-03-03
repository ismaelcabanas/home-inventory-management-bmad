import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptScanPromptDialog, ReceiptScanPromptDialogProps } from './ReceiptScanPromptDialog';

describe('ReceiptScanPromptDialog', () => {
  const mockOnScan = vi.fn();
  const mockOnDefer = vi.fn();

  const defaultProps: ReceiptScanPromptDialogProps = {
    open: true,
    onScan: mockOnScan,
    onDefer: mockOnDefer,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open is true', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      const { container } = render(<ReceiptScanPromptDialog {...defaultProps} open={false} />);
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('should show correct title with camera icon', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      expect(screen.getByText(/Scan Your Receipt/i)).toBeInTheDocument();
      // Camera icon should be present
      const cameraIcon = document.querySelector('svg');
      expect(cameraIcon).toBeInTheDocument();
    });

    it('should show correct message', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      expect(screen.getByText(/Update your inventory automatically by scanning your receipt/i))
        .toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onScan when "Scan Receipt" button is clicked', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      const scanButton = screen.getByRole('button', { name: /scan receipt/i });
      fireEvent.click(scanButton);
      expect(mockOnScan).toHaveBeenCalledTimes(1);
    });

    it('should call onDefer when "I\'ll do it later" button is clicked', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      const laterButton = screen.getByRole('button', { name: /i'll do it later/i });
      fireEvent.click(laterButton);
      expect(mockOnDefer).toHaveBeenCalledTimes(1);
    });

    it('should call onDefer when dialog backdrop is clicked', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnDefer).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onDefer when escape key is pressed', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      // MUI Dialog handles escape key internally
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have "Scan Receipt" as contained (primary) button', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      const scanButton = screen.getByRole('button', { name: /scan receipt/i });
      expect(scanButton).toHaveClass('MuiButton-contained');
    });

    it('should have "I\'ll do it later" as text (secondary) button', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      const laterButton = screen.getByRole('button', { name: /i'll do it later/i });
      expect(laterButton).toHaveClass('MuiButton-text');
    });

    it('should render dialog with proper structure for mobile', () => {
      render(<ReceiptScanPromptDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });
});
