// TODO (Tech Debt #4): Add explanation for why react-refresh/only-export-components is disabled
// See: docs/technical-debt.md - Issue #4
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, ReactNode, useMemo, useCallback, useRef, useEffect } from 'react';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { ocrService, activeOCRProvider } from '@/services/ocr';
import { inventoryService } from '@/services/inventory';
import type {
  ReceiptState,
  ReceiptAction,
  ReceiptContextValue,
  CameraState,
  OCRState,
} from '@/features/receipt/types/receipt.types';

// Create context
const ReceiptContext = createContext<ReceiptContextValue | undefined>(undefined);

// Initial state
const initialState: ReceiptState = {
  cameraState: 'idle',
  ocrState: 'idle',
  videoStream: null,
  capturedImage: null,
  processingProgress: 0,
  recognizedProducts: [],
  rawOcrText: null,
  error: null,
  feedbackMessage: '',
};

// Reducer function
function receiptReducer(state: ReceiptState, action: ReceiptAction): ReceiptState {
  switch (action.type) {
    case 'SET_CAMERA_STATE':
      return {
        ...state,
        cameraState: action.payload,
      };

    case 'SET_OCR_STATE':
      return {
        ...state,
        ocrState: action.payload,
      };

    case 'SET_VIDEO_STREAM':
      // Cleanup existing stream if present
      if (state.videoStream && state.videoStream !== action.payload) {
        state.videoStream.getTracks().forEach((track) => track.stop());
      }
      return {
        ...state,
        videoStream: action.payload,
      };

    case 'SET_CAPTURED_IMAGE':
      return {
        ...state,
        capturedImage: action.payload,
      };

    case 'SET_PROCESSING_PROGRESS':
      return {
        ...state,
        processingProgress: action.payload,
      };

    case 'SET_RECOGNIZED_PRODUCTS':
      return {
        ...state,
        recognizedProducts: action.payload,
      };

    case 'SET_RAW_OCR_TEXT':
      return {
        ...state,
        rawOcrText: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        cameraState: action.payload ? 'error' : state.cameraState,
        ocrState: action.payload ? 'error' : state.ocrState,
      };

    case 'SET_FEEDBACK_MESSAGE':
      return {
        ...state,
        feedbackMessage: action.payload,
      };

    case 'RESET':
      // Cleanup stream if present
      if (state.videoStream) {
        state.videoStream.getTracks().forEach((track) => track.stop());
      }
      return initialState;

    default:
      return state;
  }
}

// Provider props
interface ReceiptProviderProps {
  children: ReactNode;
}

// Provider component
export function ReceiptProvider({ children }: ReceiptProviderProps) {
  const [state, dispatch] = useReducer(receiptReducer, initialState);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CAMERA_STATE', payload: 'requesting_permission' as CameraState });
      logger.debug('Requesting camera permission');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      dispatch({ type: 'SET_VIDEO_STREAM', payload: stream });
      dispatch({ type: 'SET_CAMERA_STATE', payload: 'capturing' as CameraState });

      logger.info('Camera permission granted and stream initialized');
    } catch (error) {
      const appError = handleError(error);

      // Determine specific error message based on error type
      let errorMessage = appError.message;
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please enable camera permissions in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device.';
        }
      }

      logger.error('Camera permission denied', {
        ...(appError.details || {}),
        errorName: (error as Error)?.name,
      });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CAMERA_STATE', payload: 'requesting_permission' as CameraState });
      logger.debug('Starting camera');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      dispatch({ type: 'SET_VIDEO_STREAM', payload: stream });
      dispatch({ type: 'SET_CAMERA_STATE', payload: 'capturing' as CameraState });

      logger.info('Camera started successfully');
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to start camera', appError.details);
      dispatch({ type: 'SET_ERROR', payload: 'Unable to access camera. Please try again.' });
      throw error;
    }
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(async () => {
    try {
      logger.debug('Capturing photo');

      const video = videoRef.current;
      if (!video || !state.videoStream) {
        throw new Error('Video element or stream not available');
      }

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      dispatch({ type: 'SET_CAPTURED_IMAGE', payload: dataUrl });
      dispatch({ type: 'SET_CAMERA_STATE', payload: 'preview' as CameraState });

      logger.info('Photo captured successfully');
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to capture photo', appError.details);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to capture photo. Please try again.' });
      throw error;
    }
  }, [state.videoStream]);

  // Retake photo
  const retakePhoto = useCallback(async () => {
    try {
      logger.debug('Retaking photo');

      // Clear captured image
      dispatch({ type: 'SET_CAPTURED_IMAGE', payload: null });

      // Restart camera to ensure stream is in good state
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      dispatch({ type: 'SET_VIDEO_STREAM', payload: stream });
      dispatch({ type: 'SET_CAMERA_STATE', payload: 'capturing' as CameraState });

      logger.info('Camera restarted for retake');
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to retake photo', appError.details);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to retake photo. Please try again.' });
      throw error;
    }
  }, []);

  // Use photo (accept and proceed)
  const usePhoto = useCallback(() => {
    try {
      // Validate that we have a captured image before proceeding
      if (!state.capturedImage) {
        throw new Error('No captured image to use');
      }

      logger.debug('Photo accepted');

      // Stop camera but keep captured image
      if (state.videoStream) {
        state.videoStream.getTracks().forEach((track) => track.stop());
      }
      dispatch({ type: 'SET_VIDEO_STREAM', payload: null });

      logger.info('Photo accepted, proceeding to OCR');
      // In future story (5.2), this will trigger OCR processing
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to accept photo', appError.details);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to accept photo. Please try again.' });
    }
  }, [state.capturedImage, state.videoStream]);

  // Process receipt with OCR
  const processReceiptWithOCR = useCallback(async (imageDataUrl: string) => {
    try {
      logger.debug('Starting OCR processing');

      // Set processing state
      dispatch({ type: 'SET_OCR_STATE', payload: 'processing' as OCRState });
      dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: 0 });
      dispatch({ type: 'SET_RECOGNIZED_PRODUCTS', payload: [] });
      dispatch({ type: 'SET_RAW_OCR_TEXT', payload: null });

      // Process with OCR service
      const result = await ocrService.processReceipt(imageDataUrl);

      // Store raw OCR text for debugging
      dispatch({ type: 'SET_RAW_OCR_TEXT', payload: result.rawText });

      // Update with results
      dispatch({ type: 'SET_RECOGNIZED_PRODUCTS', payload: result.products });
      dispatch({ type: 'SET_OCR_STATE', payload: 'completed' as OCRState });
      dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: 100 });

      logger.info('OCR processing complete', {
        productsFound: result.products.length,
        rawTextLength: result.rawText.length,
        rawTextPreview: result.rawText.substring(0, 200),
      });
    } catch (error) {
      const appError = handleError(error);
      logger.error('OCR processing failed', appError.details);

      // Set error state
      dispatch({ type: 'SET_OCR_STATE', payload: 'error' as OCRState });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to process receipt. Please try again.' });

      throw error;
    }
  }, []);

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    try {
      if (state.videoStream) {
        state.videoStream.getTracks().forEach((track) => track.stop());
      }
      dispatch({ type: 'SET_VIDEO_STREAM', payload: null });
      logger.debug('Camera stopped and stream cleaned up');
    } catch (error) {
      logger.error('Error stopping camera', handleError(error).details);
    }
  }, [state.videoStream]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.videoStream) {
        state.videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [state.videoStream]);

  // Initialize OCR service with inventory service and OCR provider
  useEffect(() => {
    // Initialize the inventory service for product matching
    ocrService.setInventoryService(inventoryService);

    // Set the active OCR provider from config
    ocrService.setOCRProvider(activeOCRProvider);

    logger.info('OCR service initialized', {
      provider: activeOCRProvider.name,
      inventoryService: 'configured'
    });
  }, []);

  const value: ReceiptContextValue = useMemo(
    () => ({
      state,
      requestCameraPermission,
      startCamera,
      capturePhoto,
      retakePhoto,
      usePhoto,
      processReceiptWithOCR,
      stopCamera,
      clearError,
      videoRef,
    }),
    [state, requestCameraPermission, startCamera, capturePhoto, retakePhoto, usePhoto, processReceiptWithOCR, stopCamera, clearError]
  );

  return (
    <ReceiptContext.Provider value={value}>
      {children}
    </ReceiptContext.Provider>
  );
}

// Custom hook
export function useReceiptContext(): ReceiptContextValue {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error('useReceiptContext must be used within a ReceiptProvider');
  }
  return context;
}
