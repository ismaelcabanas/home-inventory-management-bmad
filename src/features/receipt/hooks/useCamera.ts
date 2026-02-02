import { useCallback } from 'react';
import { logger } from '@/utils/logger';

export interface UseCameraReturn {
  /**
   * Initialize camera and return media stream
   * @param constraints Optional media constraints (defaults to rear camera, 1080p)
   * @returns Promise<MediaStream> The camera media stream
   * @throws Error if camera access is denied or unavailable
   */
  initializeCamera: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;

  /**
   * Capture a photo from the current video stream
   * @param videoElement The HTML video element with active stream
   * @returns data URL string of the captured image (JPEG format, 0.9 quality)
   * @throws Error if video element is not ready or canvas context is unavailable
   */
  capturePhoto: (videoElement: HTMLVideoElement) => string;

  /**
   * Stop all tracks in a media stream to release camera
   * @param stream The media stream to stop (null-safe)
   */
  stopStream: (stream: MediaStream | null) => void;

  /**
   * Cleanup function (for use in useEffect return)
   * Currently a no-op as stream management is handled by stopStream
   */
  cleanup: () => void;
}

/**
 * Custom hook for camera API operations
 *
 * Encapsulates MediaDevices API logic for:
 * - Camera initialization with proper constraints
 * - Photo capture from video stream
 * - Stream cleanup and resource management
 * - Error handling for permission/device issues
 *
 * @example
 * ```tsx
 * const { initializeCamera, capturePhoto, stopStream } = useCamera();
 *
 * // Start camera
 * const stream = await initializeCamera();
 * videoRef.current.srcObject = stream;
 *
 * // Capture photo
 * const dataUrl = capturePhoto(videoRef.current);
 *
 * // Stop camera
 * stopStream(stream);
 * ```
 */
export function useCamera(): UseCameraReturn {
  /**
   * Initialize camera with default or custom constraints
   */
  const initializeCamera = useCallback(async (constraints?: MediaStreamConstraints): Promise<MediaStream> => {
    try {
      logger.debug('Initializing camera');

      // Default constraints: rear camera, 1080p ideal
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints || defaultConstraints);

      logger.info('Camera initialized successfully');
      return stream;
    } catch (error) {
      const errorName = (error as Error)?.name || 'UnknownError';
      logger.error('Camera initialization failed', {
        errorName,
        message: (error as Error)?.message,
        error,
      });
      throw error;
    }
  }, []);

  /**
   * Capture photo from video element
   * Creates a canvas, draws the current video frame, and returns as data URL
   */
  const capturePhoto = useCallback((videoElement: HTMLVideoElement): string => {
    logger.debug('Capturing photo from video stream');

    // Validate video element is ready
    if (!videoElement?.videoWidth || !videoElement?.videoHeight) {
      throw new Error('Video element not ready');
    }

    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw current video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert to data URL (JPEG, 0.9 quality for good balance of size/quality)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    logger.debug('Photo captured successfully', {
      width: canvas.width,
      height: canvas.height,
    });

    return dataUrl;
  }, []);

  /**
   * Stop all tracks in a media stream
   * This releases the camera hardware
   */
  const stopStream = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    logger.debug('Stopping camera stream');
  }, []);

  /**
   * Cleanup function (placeholder for potential future cleanup logic)
   */
  const cleanup = useCallback(() => {
    // Stream cleanup is handled explicitly via stopStream
    // This function exists for interface consistency
  }, []);

  return {
    initializeCamera,
    capturePhoto,
    stopStream,
    cleanup,
  };
}
