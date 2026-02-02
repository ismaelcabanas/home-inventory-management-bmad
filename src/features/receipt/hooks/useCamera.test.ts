import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCamera } from './useCamera';
import * as logger from '@/utils/logger';

// Mock logger
vi.mock('@/utils/logger');

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

describe('useCamera', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeCamera', () => {
    it('should initialize camera with correct constraints', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        const stream = await result.current.initializeCamera();
        expect(stream).toBe(mockStream);
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      expect(logger.logger.debug).toHaveBeenCalledWith('Initializing camera');
      expect(logger.logger.info).toHaveBeenCalledWith('Camera initialized successfully');
    });

    it('should handle permission denied error', async () => {
      const error = Object.create(Error.prototype);
      error.name = 'NotAllowedError';
      error.message = 'Permission denied';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await expect(result.current.initializeCamera()).rejects.toThrow();
      });

      expect(logger.logger.error).toHaveBeenCalledWith(
        'Camera initialization failed',
        expect.objectContaining({
          errorName: 'NotAllowedError',
        })
      );
    });

    it('should handle no camera found error', async () => {
      const error = Object.create(Error.prototype);
      error.name = 'NotFoundError';
      error.message = 'No camera found';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await expect(result.current.initializeCamera()).rejects.toThrow();
      });

      expect(logger.logger.error).toHaveBeenCalledWith(
        'Camera initialization failed',
        expect.objectContaining({
          errorName: 'NotFoundError',
        })
      );
    });

    it('should handle not supported error', async () => {
      const error = Object.create(Error.prototype);
      error.name = 'NotSupportedError';
      error.message = 'Not supported';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await expect(result.current.initializeCamera()).rejects.toThrow();
      });

      expect(logger.logger.error).toHaveBeenCalledWith(
        'Camera initialization failed',
        expect.objectContaining({
          errorName: 'NotSupportedError',
        })
      );
    });
  });

  describe('capturePhoto', () => {
    it('should throw error if video element is not ready', () => {
      const mockVideo = {
        videoWidth: 0,
        videoHeight: 0,
      };

      const { result } = renderHook(() => useCamera());

      expect(() =>
        result.current.capturePhoto(mockVideo as unknown as HTMLVideoElement)
      ).toThrow('Video element not ready');
    });
  });

  describe('stopStream', () => {
    it('should stop all tracks in media stream', () => {
      const mockTrack1 = { stop: vi.fn() };
      const mockTrack2 = { stop: vi.fn() };
      const mockStream = {
        getTracks: () => [mockTrack1, mockTrack2],
      } as unknown as MediaStream;

      const { result } = renderHook(() => useCamera());

      act(() => {
        result.current.stopStream(mockStream);
      });

      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
      expect(logger.logger.debug).toHaveBeenCalledWith('Stopping camera stream');
    });

    it('should handle null stream gracefully', () => {
      const { result } = renderHook(() => useCamera());

      act(() => {
        result.current.stopStream(null);
      });

      expect(logger.logger.debug).toHaveBeenCalledWith('Stopping camera stream');
    });
  });

  describe('cleanup', () => {
    it('should return cleanup function', () => {
      const { result } = renderHook(() => useCamera());

      expect(result.current.cleanup).toBeInstanceOf(Function);
    });
  });
});
