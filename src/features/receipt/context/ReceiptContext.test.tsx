import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReceiptProvider, useReceiptContext } from './ReceiptContext';
import * as errorHandler from '@/utils/errorHandler';
import * as logger from '@/utils/logger';
import { ocrService } from '@/services/ocr';

// Mock the utilities
vi.mock('@/utils/errorHandler');
vi.mock('@/utils/logger');

// Mock network utility (Story 5.4)
vi.mock('@/utils/network', () => ({
  isOnline: vi.fn(() => true),
  onNetworkStatusChange: vi.fn(() => vi.fn()),
}));

// Mock OCR providers module - define mock provider inline to avoid hoisting issues
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
  // Define the same mock provider for activeOCRProvider
  const mockProvider = {
    name: 'llm-api (gpt-4o-mini)', // Updated to reflect Story 5.4 changes
    process: vi.fn().mockResolvedValue({
      rawText: 'MOCK OCR TEXT',
      provider: 'llm-api (gpt-4o-mini)',
      processingTimeMs: 100,
      confidence: 0.98,
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
      // Story 5.4: Add new offline queue methods
      queuePendingReceipt: vi.fn().mockResolvedValue(1),
      processPendingQueue: vi.fn().mockResolvedValue({ processed: 0, completed: 0, failed: 0 }),
      getPendingCount: vi.fn().mockResolvedValue(0),
    },
  };
});

// Mock navigator.mediaDevices
const createMockStream = () => ({
  getTracks: () => [
    { stop: vi.fn(), kind: 'video' },
  ],
}) as unknown as MediaStream;

const mockGetUserMedia = vi.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

describe('ReceiptContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ReceiptProvider>{children}</ReceiptProvider>
  );

  describe('useReceiptContext', () => {
    it('should throw error when used outside provider', () => {
      expect(() => renderHook(() => useReceiptContext())).toThrow(
        'useReceiptContext must be used within a ReceiptProvider'
      );
    });

    it('should provide context value when used within provider', () => {
      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.state).toBeDefined();
      expect(result.current.requestCameraPermission).toBeInstanceOf(Function);
      expect(result.current.startCamera).toBeInstanceOf(Function);
      expect(result.current.capturePhoto).toBeInstanceOf(Function);
      expect(result.current.retakePhoto).toBeInstanceOf(Function);
      expect(result.current.usePhoto).toBeInstanceOf(Function);
      expect(result.current.stopCamera).toBeInstanceOf(Function);
      expect(result.current.clearError).toBeInstanceOf(Function);
      expect(result.current.videoRef).toBeDefined();
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      expect(result.current.state.cameraState).toBe('idle');
      expect(result.current.state.videoStream).toBeNull();
      expect(result.current.state.capturedImage).toBeNull();
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.feedbackMessage).toBe('');
      expect(result.current.state.rawOcrText).toBeNull();
      expect(result.current.state.processingProgress).toBe(0);
      expect(result.current.state.recognizedProducts).toEqual([]);
      expect(result.current.state.productsInReview).toEqual([]); // Story 5.3
      expect(result.current.state.confirmedProducts).toEqual([]); // Story 5.3
    });
  });

  describe('requestCameraPermission', () => {
    it('should request camera permission and set video stream on success', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.requestCameraPermission();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      expect(result.current.state.cameraState).toBe('capturing');
      expect(result.current.state.videoStream).toBe(mockStream);
      expect(logger.logger.info).toHaveBeenCalledWith(
        'Camera permission granted and stream initialized'
      );
    });

    it('should handle permission denied error', async () => {
      const error = Object.create(Error.prototype);
      error.name = 'NotAllowedError';
      error.message = 'Permission denied';
      mockGetUserMedia.mockRejectedValue(error);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Camera access denied.',
        details: { originalError: error },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        try {
          await result.current.requestCameraPermission();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.state.cameraState).toBe('error');
      expect(result.current.state.error).toBe('Camera access denied. Please enable camera permissions in your browser settings.');
    });

    it('should handle no camera found error', async () => {
      const error = Object.create(Error.prototype);
      error.name = 'NotFoundError';
      error.message = 'No camera found';
      mockGetUserMedia.mockRejectedValue(error);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'No camera found.',
        details: { originalError: error },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        try {
          await result.current.requestCameraPermission();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.state.cameraState).toBe('error');
      expect(result.current.state.error).toBe('No camera found on this device.');
    });
  });

  describe('startCamera', () => {
    it('should initialize camera with correct constraints', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.state.cameraState).toBe('capturing');
      expect(result.current.state.videoStream).toBe(mockStream);
      expect(logger.logger.info).toHaveBeenCalledWith('Camera started successfully');
    });
  });

  describe('capturePhoto', () => {
    it('should handle errors when video ref is not available', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.startCamera();
      });

      // Video ref is null - should error
      await act(async () => {
        try {
          await result.current.capturePhoto();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.state.cameraState).toBe('error');
      expect(result.current.state.error).toBe('Failed to capture photo. Please try again.');
      expect(logger.logger.error).toHaveBeenCalledWith(
        'Failed to capture photo',
        expect.any(Object)
      );
    });
  });

  describe('retakePhoto', () => {
    it('should return to capturing state', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.startCamera();
        await result.current.retakePhoto();
      });

      expect(result.current.state.cameraState).toBe('capturing');
      expect(logger.logger.info).toHaveBeenCalledWith('Camera restarted for retake');
    });
  });

  describe('usePhoto', () => {
    it('should accept photo and stop camera', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = {
        getTracks: () => [mockTrack],
      } as unknown as MediaStream;

      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.startCamera();
      });

      act(() => {
        // First set a captured image (simulating successful capture)
        result.current.state.capturedImage = 'data:image/jpeg;base64,test';
        result.current.usePhoto();
      });

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(result.current.state.videoStream).toBeNull();
      expect(logger.logger.info).toHaveBeenCalledWith('Photo accepted, proceeding to OCR');
    });

    it('should throw error when no captured image exists', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = {
        getTracks: () => [mockTrack],
      } as unknown as MediaStream;

      mockGetUserMedia.mockResolvedValue(mockStream);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Failed to accept photo. Please try again.',
        details: { originalError: new Error('No captured image to use') },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.startCamera();
      });

      // Try to use photo without capturing first - should log error
      act(() => {
        result.current.usePhoto();
      });

      // Should have error logged and state updated
      expect(logger.logger.error).toHaveBeenCalledWith(
        'Failed to accept photo',
        expect.any(Object)
      );
    });
  });

  describe('stopCamera', () => {
    it('should stop camera and cleanup media stream', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = {
        getTracks: () => [mockTrack],
      } as unknown as MediaStream;

      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.startCamera();
        result.current.stopCamera();
      });

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(result.current.state.videoStream).toBeNull();
      expect(logger.logger.debug).toHaveBeenCalledWith('Camera stopped and stream cleaned up');
    });

    it('should handle null stream gracefully', () => {
      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      act(() => {
        result.current.stopCamera();
      });

      expect(result.current.state.videoStream).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const error = Object.create(Error.prototype);
      error.name = 'NotAllowedError';
      error.message = 'Permission denied';
      mockGetUserMedia.mockRejectedValue(error);

      vi.mocked(errorHandler.handleError).mockReturnValue({
        message: 'Camera access denied.',
        details: { originalError: error },
      });

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      // Trigger error state
      await act(async () => {
        try {
          await result.current.requestCameraPermission();
        } catch {
          // Expected
        }
      });

      expect(result.current.state.error).toBeTruthy();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe('MediaStream cleanup', () => {
    it('should cleanup stream on unmount', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = {
        getTracks: () => [mockTrack],
      } as unknown as MediaStream;

      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result, unmount } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.startCamera();
      });

      unmount();

      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('should cleanup old stream when new stream is set', async () => {
      const oldMockTrack = { stop: vi.fn() };
      const oldMockStream = {
        getTracks: () => [oldMockTrack],
      } as unknown as MediaStream;

      const newMockStream = createMockStream();

      mockGetUserMedia
        .mockResolvedValueOnce(oldMockStream)
        .mockResolvedValueOnce(newMockStream);

      const { result } = renderHook(() => useReceiptContext(), { wrapper });

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.state.videoStream).toBe(oldMockStream);

      await act(async () => {
        await result.current.startCamera();
      });

      expect(oldMockTrack.stop).toHaveBeenCalled();
      expect(result.current.state.videoStream).toBe(newMockStream);
    });
  });

  describe('OCR Processing - Story 5.2', () => {
    // Create fresh wrapper for OCR tests to avoid state pollution
    const freshWrapper = ({ children }: { children: React.ReactNode }) => (
      <ReceiptProvider key="ocr-test-fresh">{children}</ReceiptProvider>
    );

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('processReceiptWithOCR', () => {
      it('should transition through OCR states: idle -> processing -> completed', async () => {
        const mockProducts = [
          {
            id: '1',
            name: 'Milk',
            confidence: 0.9,
            isCorrect: false,
          },
          {
            id: '2',
            name: 'Bread',
            confidence: 0.85,
            isCorrect: false,
          },
        ];

        vi.mocked(ocrService.processReceipt).mockResolvedValue({
          products: mockProducts,
          rawText: 'MILK $4.99\nBREAD $2.50',
        });

        const { result } = renderHook(() => useReceiptContext(), { wrapper: freshWrapper });

        // Set captured image
        act(() => {
          result.current.state.capturedImage = 'data:image/jpeg;base64,test';
        });

        // Process receipt
        await act(async () => {
          await result.current.processReceiptWithOCR('data:image/jpeg;base64,test');
        });

        // Verify state transitions
        expect(ocrService.processReceipt).toHaveBeenCalledWith('data:image/jpeg;base64,test');
        expect(result.current.state.ocrState).toBe('review'); // Story 5.3: Now transitions to review
        expect(result.current.state.recognizedProducts).toEqual(mockProducts);
        expect(result.current.state.productsInReview).toEqual(mockProducts); // Story 5.3: Products copied to review
        expect(result.current.state.processingProgress).toBe(100);
        expect(logger.logger.info).toHaveBeenCalledWith(
          'OCR processing complete, entering review state', // Story 5.3: Updated log message
          expect.objectContaining({
            productsFound: 2,
          })
        );
      });

      it('should handle OCR processing errors and transition to error state', async () => {
        const mockError = new Error('OCR processing failed');
        vi.mocked(ocrService.processReceipt).mockRejectedValue(mockError);

        vi.mocked(errorHandler.handleError).mockReturnValue({
          message: 'Failed to process receipt. Please try again.',
          details: { originalError: mockError },
        });

        const { result } = renderHook(() => useReceiptContext(), { wrapper: freshWrapper });

        // Process receipt
        await act(async () => {
          try {
            await result.current.processReceiptWithOCR('data:image/jpeg;base64,test');
          } catch {
            // Expected to throw
          }
        });

        // Verify error state
        expect(result.current.state.ocrState).toBe('error');
        expect(result.current.state.error).toBe('Failed to process receipt. Please try again.');
        expect(logger.logger.error).toHaveBeenCalledWith(
          'OCR processing failed',
          expect.any(Object)
        );
      });

      it('should update processing progress to 100 on completion', async () => {
        const mockProducts = [
          { id: '1', name: 'Milk', confidence: 0.9, isCorrect: false },
        ];

        vi.mocked(ocrService.processReceipt).mockResolvedValue({
          products: mockProducts,
          rawText: 'MILK $4.99',
        });

        const { result } = renderHook(() => useReceiptContext(), { wrapper: freshWrapper });

        // Set captured image
        act(() => {
          result.current.state.capturedImage = 'data:image/jpeg;base64,test';
        });

        await act(async () => {
          await result.current.processReceiptWithOCR('data:image/jpeg;base64,test');
        });

        // Progress should be 100 on completion
        expect(result.current.state.processingProgress).toBe(100);
        expect(result.current.state.recognizedProducts).toEqual(mockProducts);
      });
    });

    describe('OCR Error Recovery', () => {
      it('should clear error and allow retry', async () => {
        const mockError = new Error('OCR timeout');
        vi.mocked(ocrService.processReceipt).mockRejectedValueOnce(mockError);

        vi.mocked(errorHandler.handleError).mockReturnValue({
          message: 'OCR processing timed out. Please try again.',
          details: { originalError: mockError },
        });

        const { result } = renderHook(() => useReceiptContext(), { wrapper: freshWrapper });

        // First attempt fails
        await act(async () => {
          try {
            await result.current.processReceiptWithOCR('data:image/jpeg;base64,test');
          } catch {
            // Expected
          }
        });

        expect(result.current.state.ocrState).toBe('error');
        expect(result.current.state.error).toBeTruthy();

        // Clear error
        act(() => {
          result.current.clearError();
        });

        expect(result.current.state.error).toBeNull();

        // Retry should work
        vi.mocked(ocrService.processReceipt).mockResolvedValueOnce({
          products: [],
          rawText: '',
        });

        await act(async () => {
          await result.current.processReceiptWithOCR('data:image/jpeg;base64,test');
        });

        expect(result.current.state.ocrState).toBe('review'); // Story 5.3: Now transitions to review state
      });

      it('should handle worker initialization errors', async () => {
        const mockError = new Error('Worker initialization failed');
        vi.mocked(ocrService.processReceipt).mockRejectedValue(mockError);

        vi.mocked(errorHandler.handleError).mockReturnValue({
          message: 'Failed to process receipt. Please try again.',
          details: { originalError: mockError },
        });

        const { result } = renderHook(() => useReceiptContext(), { wrapper: freshWrapper });

        await act(async () => {
          try {
            await result.current.processReceiptWithOCR('data:image/jpeg;base64,test');
          } catch {
            // Expected
          }
        });

        expect(result.current.state.ocrState).toBe('error');
        expect(result.current.state.cameraState).toBe('error'); // Error also sets cameraState
      });
    });

    describe('OCR State Transitions', () => {
      it('should have correct initial OCR state', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: freshWrapper });

        expect(result.current.state.ocrState).toBe('idle');
        expect(result.current.state.processingProgress).toBe(0);
        expect(result.current.state.recognizedProducts).toEqual([]);
        expect(result.current.state.rawOcrText).toBeNull();
      });

      it('should provide processReceiptWithOCR method', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: freshWrapper });

        expect(result.current.processReceiptWithOCR).toBeInstanceOf(Function);
      });
    });
  });

  // Story 5.3: Review state management tests
  describe('Review State Management - Story 5.3', () => {
    const reviewWrapper = ({ children }: { children: React.ReactNode }) => (
      <ReceiptProvider key="review-test-fresh">{children}</ReceiptProvider>
    );

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('editProductName', () => {
      it('should edit product name in productsInReview', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        // Set up products in review by adding them
        act(() => {
          result.current.addProduct('Milk');
          result.current.addProduct('Bread');
        });

        const milkId = result.current.state.productsInReview[0].id;

        // Edit product name
        act(() => {
          result.current.editProductName(milkId, 'Organic Milk');
        });

        expect(result.current.state.productsInReview[0].name).toBe('Organic Milk');
        expect(result.current.state.productsInReview[1].name).toBe('Bread'); // Unchanged
      });

      it('should handle edit for non-existent product gracefully', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        act(() => {
          result.current.addProduct('Milk');
        });

        const originalName = result.current.state.productsInReview[0].name;

        // Try to edit non-existent product
        act(() => {
          result.current.editProductName('999', 'New Name');
        });

        // Should not crash, products remain unchanged
        expect(result.current.state.productsInReview[0].name).toBe(originalName);
      });
    });

    describe('addProduct', () => {
      it('should add product to productsInReview with valid name', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        const initialLength = result.current.state.productsInReview.length;

        act(() => {
          result.current.addProduct('Cheese');
        });

        expect(result.current.state.productsInReview.length).toBe(initialLength + 1);
        expect(result.current.state.productsInReview[initialLength].name).toBe('Cheese');
        expect(result.current.state.productsInReview[initialLength].confidence).toBe(1.0);
        expect(result.current.state.productsInReview[initialLength].isCorrect).toBe(true);
      });

      it('should trim whitespace from product name', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        act(() => {
          result.current.addProduct('  Cheese  ');
        });

        expect(result.current.state.productsInReview[0].name).toBe('Cheese');
      });

      it('should set error for invalid product name (too short)', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        act(() => {
          result.current.addProduct('M'); // Only 1 character
        });

        expect(result.current.state.productsInReview.length).toBe(0);
        expect(result.current.state.error).toBe('Product name must be at least 2 characters');
      });

      it('should set error for invalid product name (empty)', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        act(() => {
          result.current.addProduct('   '); // Only whitespace
        });

        expect(result.current.state.productsInReview.length).toBe(0);
        expect(result.current.state.error).toBe('Product name must be at least 2 characters');
      });
    });

    describe('removeProduct', () => {
      it('should remove product from productsInReview', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        // Add products
        act(() => {
          result.current.addProduct('Milk');
          result.current.addProduct('Bread');
          result.current.addProduct('Cheese');
        });

        const breadId = result.current.state.productsInReview[1].id;

        // Remove middle product
        act(() => {
          result.current.removeProduct(breadId);
        });

        expect(result.current.state.productsInReview.length).toBe(2);
        expect(result.current.state.productsInReview.map(p => p.name)).toEqual(['Milk', 'Cheese']);
      });

      it('should handle remove for non-existent product gracefully', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        act(() => {
          result.current.addProduct('Milk');
        });

        const originalLength = result.current.state.productsInReview.length;

        // Try to remove non-existent product
        act(() => {
          result.current.removeProduct('999');
        });

        // Should not crash, product list unchanged
        expect(result.current.state.productsInReview.length).toBe(originalLength);
      });
    });

    describe('confirmReview', () => {
      it('should confirm review and transition to completed state', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: reviewWrapper });

        // Add products to review
        act(() => {
          result.current.addProduct('Milk');
          result.current.addProduct('Bread');
        });

        const initialReviewCount = result.current.state.productsInReview.length;

        act(() => {
          result.current.confirmReview();
        });

        // Check confirmed products
        expect(result.current.state.confirmedProducts.length).toBe(initialReviewCount);
        expect(result.current.state.confirmedProducts[0].isCorrect).toBe(true);
        expect(result.current.state.confirmedProducts[1].isCorrect).toBe(true);

        // Check state cleared
        expect(result.current.state.productsInReview).toEqual([]);

        // Check OCR state transitioned to completed
        expect(result.current.state.ocrState).toBe('completed');
      });
    });
  });
});
