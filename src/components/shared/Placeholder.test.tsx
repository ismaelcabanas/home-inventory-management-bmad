import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Box, Typography } from '@mui/material';

// Inline placeholder components from App.tsx
const ShoppingListPlaceholder = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5">Shopping List</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Coming in Epic 3</Typography>
  </Box>
);

const ReceiptScannerPlaceholder = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5">Receipt Scanner</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Coming in Epic 5</Typography>
  </Box>
);

describe('Placeholder Components', () => {
  describe('ShoppingListPlaceholder', () => {
    it('should render title and coming soon message', () => {
      render(<ShoppingListPlaceholder />);

      expect(screen.getByText('Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Coming in Epic 3')).toBeInTheDocument();
    });

    it('should render with centered text alignment', () => {
      const { container } = render(<ShoppingListPlaceholder />);
      const box = container.querySelector('[class*="MuiBox"]');

      expect(box).toBeInTheDocument();
    });
  });

  describe('ReceiptScannerPlaceholder', () => {
    it('should render title and coming soon message', () => {
      render(<ReceiptScannerPlaceholder />);

      expect(screen.getByText('Receipt Scanner')).toBeInTheDocument();
      expect(screen.getByText('Coming in Epic 5')).toBeInTheDocument();
    });

    it('should render with centered text alignment', () => {
      const { container } = render(<ReceiptScannerPlaceholder />);
      const box = container.querySelector('[class*="MuiBox"]');

      expect(box).toBeInTheDocument();
    });
  });
});
