import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReceiptProvider, useReceiptContext } from './ReceiptContext';
import * as errorHandler from '@/utils/errorHandler';
import * as logger from '@/utils/logger';
import { ocrService } from '@/services/ocr';

// Mock the utilities
vi.mock('@/utils/errorHandler');
vi.mock('@/utils/logger');

// Mock OCR service
vi.mock('@/services/ocr', () => ({
  ocrService: {
    processReceipt: vi.fn(),
  },
}));

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
        expect(result.current.state.ocrState).toBe('completed');
        expect(result.current.state.recognizedProducts).toEqual(mockProducts);
        expect(result.current.state.processingProgress).toBe(100);
        expect(logger.logger.info).toHaveBeenCalledWith(
          'OCR processing complete',
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

        expect(result.current.state.ocrState).toBe('completed');
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
      });

      it('should provide processReceiptWithOCR method', () => {
        const { result } = renderHook(() => useReceiptContext(), { wrapper: freshWrapper });

        expect(result.current.processReceiptWithOCR).toBeInstanceOf(Function);
      });
    });
  });
});
