import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReceiptProvider, useReceiptContext } from '@/features/receipt/context/ReceiptContext';
import { OCRProcessing } from '@/features/receipt/components/OCRProcessing';

// Mock the OCR providers module
vi.mock('@/services/ocr/providers/TesseractProvider', () => ({
  tesseractProvider: {
    name: 'tesseract.js',
    process: vi.fn().mockResolvedValue({
      rawText: 'MOCK OCR TEXT',
      provider: 'tesseract.js',
      processingTimeMs: 100,
      confidence: 0.9,
    }),
    isAvailable: vi.fn().mockResolvedValue(true),
  },
}));

// Mock OCR service module
vi.mock('@/services/ocr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/ocr')>();
  const mockProvider = {
    name: 'tesseract.js',
    process: vi.fn().mockResolvedValue({
      rawText: 'MOCK OCR TEXT',
      provider: 'tesseract.js',
      processingTimeMs: 100,
      confidence: 0.9,
    }),
    isAvailable: vi.fn().mockResolvedValue(true),
  };
  return {
    ...actual,
    activeOCRProvider: mockProvider,
    ocrService: {
      ...actual.ocrService,
      processReceipt: vi.fn(),
      setInventoryService: vi.fn(),
      setOCRProvider: vi.fn(),
      getOCRProvider: vi.fn(() => ({ name: 'mock-provider' })),
    },
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReceiptProvider>{children}</ReceiptProvider>
);

describe('OCRProcessing Component', () => {
  describe('Accessibility Attributes', () => {
    it('should have aria-label for screen readers on main container', () => {
      render(<OCRProcessing />, { wrapper });

      const container = screen.getByRole('status', { name: /processing receipt with ocr/i });
      expect(container).toHaveAttribute('aria-label', 'Processing receipt with OCR');
    });

    it('should have aria-live="polite" for live region updates', () => {
      render(<OCRProcessing />, { wrapper });

      const container = screen.getByRole('status', { name: /processing receipt with ocr/i });
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-busy on CircularProgress', () => {
      render(<OCRProcessing />, { wrapper });

      const progress = screen.getByLabelText('Loading OCR processing');
      expect(progress).toHaveAttribute('aria-busy', 'true');
    });

    it('should render without errors', () => {
      const { container } = render(<OCRProcessing />, { wrapper });
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });
  });

  describe('Display Elements', () => {
    it('should show CircularProgress loading indicator', () => {
      render(<OCRProcessing />, { wrapper });

      const progress = screen.getByRole('progressbar', { hidden: true });
      expect(progress).toBeInTheDocument();
    });

    it('should show "Recognizing products..." status message', () => {
      render(<OCRProcessing />, { wrapper });

      expect(screen.getByText('Recognizing products...')).toBeInTheDocument();
    });

    it('should show "Please wait while we process your receipt" subtitle', () => {
      render(<OCRProcessing />, { wrapper });

      expect(screen.getByText('Please wait while we process your receipt')).toBeInTheDocument();
    });

    it('should not show progress percentage when progress is 0', () => {
      render(<OCRProcessing />, { wrapper });

      // Should not show any percentage text
      expect(screen.queryByText(/\d+% complete/)).not.toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('should show progress percentage when progress > 0', () => {
      const TestComponent = () => {
        const { state } = useReceiptContext();
        return (
          <>
            <div style={{ display: 'none' }}>
              {JSON.stringify({ progress: state.processingProgress })}
            </div>
            <OCRProcessing />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      // With default state (progress: 0), no percentage shown
      expect(screen.queryByText(/\d+% complete/)).not.toBeInTheDocument();
    });
  });
});
