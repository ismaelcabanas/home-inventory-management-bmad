// TODO (Tech Debt #4): Add explanation for why react-refresh/only-export-components is disabled
// See: docs/technical-debt.md - Issue #4
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, ReactNode, useMemo, useCallback, useRef, useEffect } from 'react';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { ocrService, activeOCRProvider } from '@/services/ocr';
import { inventoryService } from '@/services/inventory';
import { shoppingService } from '@/services/shopping';
import { isOnline, onNetworkStatusChange } from '@/utils/network';
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
  isOnline: true, // Story 5.4: Start assuming online
  pendingReceiptsCount: 0, // Story 5.4: No pending receipts initially
  isOCRConfigured: false, // Story 5.4 bug fix: Track if LLM API key is configured
  productsInReview: [], // Story 5.3: Products currently being reviewed by user
  confirmedProducts: [], // Story 5.3: User-confirmed products ready for inventory update
  updatingInventory: false, // Story 6.1: Not updating inventory initially
  updateError: null, // Story 6.1: No error initially
  productsUpdated: -1, // Story 6.1: -1 means not yet updated (0 means updated but no items)
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

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };

    case 'SET_PENDING_COUNT':
      return {
        ...state,
        pendingReceiptsCount: action.payload,
      };

    case 'SET_OCR_CONFIGURED':
      return {
        ...state,
        isOCRConfigured: action.payload,
      };

    // Story 5.3: Review state management actions
    case 'SET_PRODUCTS_IN_REVIEW':
      return {
        ...state,
        productsInReview: action.payload,
      };

    case 'EDIT_PRODUCT_NAME':
      return {
        ...state,
        productsInReview: state.productsInReview.map(p =>
          p.id === action.payload.productId
            ? { ...p, name: action.payload.newName }
            : p
        ),
      };

    case 'ADD_PRODUCT':
      return {
        ...state,
        productsInReview: [...state.productsInReview, action.payload],
      };

    case 'REMOVE_PRODUCT':
      return {
        ...state,
        productsInReview: state.productsInReview.filter(p => p.id !== action.payload),
      };

    case 'CONFIRM_REVIEW':
      return {
        ...state,
        confirmedProducts: action.payload,
        productsInReview: [],
      };

    // Story 6.1: Inventory update state actions
    case 'SET_UPDATING_INVENTORY':
      return {
        ...state,
        updatingInventory: action.payload,
      };

    case 'INVENTORY_UPDATE_SUCCESS':
      return {
        ...state,
        productsUpdated: action.payload,
        updatingInventory: false,
        updateError: null,
      };

    case 'INVENTORY_UPDATE_ERROR':
      return {
        ...state,
        updateError: action.payload,
        updatingInventory: false,
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

  // Process receipt with OCR (Story 5.4: Offline queue support)
  const processReceiptWithOCR = useCallback(async (imageDataUrl: string) => {
    try {
      logger.debug('Starting OCR processing');

      // Set processing state
      dispatch({ type: 'SET_OCR_STATE', payload: 'processing' as OCRState });
      dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: 0 });
      dispatch({ type: 'SET_RECOGNIZED_PRODUCTS', payload: [] });
      dispatch({ type: 'SET_RAW_OCR_TEXT', payload: null });

      // Check if we're offline (Story 5.4)
      const online = isOnline();
      if (!online) {
        // Queue receipt for offline processing
        const pendingId = await ocrService.queuePendingReceipt(imageDataUrl);
        logger.info('Receipt queued for offline processing', { pendingId });

        // Update pending count
        const count = await ocrService.getPendingCount();
        dispatch({ type: 'SET_PENDING_COUNT', payload: count });

        // Set error to inform user about offline mode
        dispatch({ type: 'SET_OCR_STATE', payload: 'error' as OCRState });
        dispatch({
          type: 'SET_ERROR',
          payload: 'You are currently offline. Receipt has been queued and will be processed automatically when you reconnect.',
        });

        return;
      }

      // Process with OCR service
      const result = await ocrService.processReceipt(imageDataUrl);

      // Store raw OCR text for debugging
      dispatch({ type: 'SET_RAW_OCR_TEXT', payload: result.rawText });

      // Update with results
      dispatch({ type: 'SET_RECOGNIZED_PRODUCTS', payload: result.products });
      dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: 100 });

      // Story 5.3: Transition to review state instead of completed
      dispatch({ type: 'SET_PRODUCTS_IN_REVIEW', payload: result.products });
      dispatch({ type: 'SET_OCR_STATE', payload: 'review' as OCRState });

      logger.info('OCR processing complete, entering review state', {
        productsFound: result.products.length,
        rawTextLength: result.rawText.length,
        rawTextPreview: result.rawText.substring(0, 200),
      });
    } catch (error) {
      const appError = handleError(error);
      logger.error('OCR processing failed', appError.details);

      // Check if this is a quota/network error that should trigger queuing (Story 5.4)
      const shouldQueue =
        appError.message.includes('QUOTA_EXCEEDED') ||
        appError.message.includes('temporarily unavailable') ||
        appError.message.includes('network');

      if (shouldQueue && isOnline()) {
        // Queue for retry when quota resets
        try {
          const pendingId = await ocrService.queuePendingReceipt(imageDataUrl);
          logger.info('Receipt queued due to API error', { pendingId, error: appError.message });

          const count = await ocrService.getPendingCount();
          dispatch({ type: 'SET_PENDING_COUNT', payload: count });

          dispatch({ type: 'SET_OCR_STATE', payload: 'error' as OCRState });
          dispatch({
            type: 'SET_ERROR',
            payload: 'API quota exceeded or service unavailable. Receipt has been queued and will be processed automatically.',
          });
        } catch (queueError) {
          logger.error('Failed to queue receipt', handleError(queueError).details);
          dispatch({ type: 'SET_OCR_STATE', payload: 'error' as OCRState });
          dispatch({ type: 'SET_ERROR', payload: appError.message });
        }
        return;
      }

      // Set error state
      dispatch({ type: 'SET_OCR_STATE', payload: 'error' as OCRState });
      dispatch({ type: 'SET_ERROR', payload: appError.message || 'Failed to process receipt. Please try again.' });

      throw error;
    }
  }, []);

  // Process pending receipts queue (Story 5.4)
  const processPendingQueue = useCallback(async () => {
    try {
      logger.info('Processing pending receipts queue');

      const results = await ocrService.processPendingQueue();

      // Update pending count
      const count = await ocrService.getPendingCount();
      dispatch({ type: 'SET_PENDING_COUNT', payload: count });

      // Show feedback message
      if (results.processed > 0) {
        dispatch({
          type: 'SET_FEEDBACK_MESSAGE',
          payload: `Processed ${results.completed} receipt${results.completed !== 1 ? 's' : ''}` +
            (results.failed > 0 ? ` (${results.failed} failed)` : ''),
        });

        // Clear feedback after 5 seconds
        setTimeout(() => {
          dispatch({ type: 'SET_FEEDBACK_MESSAGE', payload: '' });
        }, 5000);
      }

      logger.info('Pending queue processing complete', results);

      return results;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to process pending queue', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message || 'Failed to process pending receipts.' });
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

  // Story 5.3: Review state management methods

  // Edit product name during review
  const editProductName = useCallback((productId: string, newName: string) => {
    logger.debug('Editing product name', { productId, newName });
    dispatch({
      type: 'EDIT_PRODUCT_NAME',
      payload: { productId, newName }
    });
  }, []);

  // Add new product during review
  const addProduct = useCallback((name: string) => {
    if (name.trim().length < 2) {
      const error = 'Product name must be at least 2 characters';
      logger.warn('Invalid product name for add', { name, error });
      dispatch({ type: 'SET_ERROR', payload: error });
      return;
    }

    const newProduct = {
      id: crypto.randomUUID(),
      name: name.trim(),
      confidence: 1.0,
      isCorrect: true,
    };

    logger.debug('Adding product to review', { product: newProduct });
    dispatch({
      type: 'ADD_PRODUCT',
      payload: newProduct
    });
  }, []);

  // Remove product during review
  const removeProduct = useCallback((productId: string) => {
    logger.debug('Removing product from review', { productId });
    dispatch({
      type: 'REMOVE_PRODUCT',
      payload: productId
    });
  }, []);

  // Confirm review and proceed to inventory update
  const confirmReview = useCallback(() => {
    const confirmedProducts = state.productsInReview.map(p => ({
      ...p,
      isCorrect: true,
    }));

    logger.info('Confirming review', {
      productCount: confirmedProducts.length,
      products: confirmedProducts.map(p => p.name)
    });

    dispatch({
      type: 'CONFIRM_REVIEW',
      payload: confirmedProducts
    });

    dispatch({ type: 'SET_OCR_STATE', payload: 'completed' as OCRState });
  }, [state.productsInReview]);

  // Story 6.1: Update inventory from confirmed receipt products
  const updateInventoryFromReceipt = useCallback(async (products?: RecognizedProduct[]) => {
    try {
      // Use provided products or fall back to state
      const productsToUpdate = products || state.confirmedProducts;

      logger.debug('Starting inventory update from receipt', {
        productCount: productsToUpdate.length
      });

      if (productsToUpdate.length === 0) {
        logger.warn('No confirmed products to update');
        dispatch({ type: 'INVENTORY_UPDATE_SUCCESS', payload: 0 });
        return;
      }

      // Set updating state
      dispatch({ type: 'SET_UPDATING_INVENTORY', payload: true });

      // Extract product names from confirmed products
      const productNames = productsToUpdate.map(p => p.name);

      logger.info('Updating inventory with products', { productNames });

      // Step 1: Replenish stock (update existing products to High, add new products)
      await inventoryService.replenishStock(productNames);

      // Step 2: Remove purchased items from shopping list
      const removedCount = await shoppingService.removePurchasedItems(productNames);

      logger.info('Inventory update completed', {
        totalProducts: productNames.length,
        removedFromList: removedCount
      });

      // Set success state with count
      dispatch({ type: 'INVENTORY_UPDATE_SUCCESS', payload: removedCount });

    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to update inventory from receipt', appError.details);

      // Set error state
      dispatch({ type: 'INVENTORY_UPDATE_ERROR', payload: appError });

      throw error;
    }
  }, [state.confirmedProducts]);

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

    // Story 5.4 bug fix: Check if LLM API key is configured
    const checkOCRConfiguration = async () => {
      try {
        const isAvailable = await activeOCRProvider.isAvailable();
        dispatch({ type: 'SET_OCR_CONFIGURED', payload: isAvailable });

        if (!isAvailable) {
          logger.warn('OCR provider not available', {
            provider: activeOCRProvider.name,
            hasApiKey: Boolean(import.meta.env.VITE_LLM_API_KEY),
          });
          dispatch({
            type: 'SET_ERROR',
            payload: 'LLM API key not configured. For local development, set VITE_LLM_API_KEY in your .env file. For Vercel, add it in Project Settings > Environment Variables. Get your API key from: https://platform.openai.com/api-keys',
          });
        }
      } catch (error) {
        logger.error('Failed to check OCR configuration', handleError(error).details);
        dispatch({ type: 'SET_OCR_CONFIGURED', payload: false });
      }
    };

    checkOCRConfiguration();
  }, []);

  // Story 5.4: Monitor network status changes
  useEffect(() => {
    // Set initial online status
    dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline() });

    // Listen for network status changes
    const cleanup = onNetworkStatusChange(async (online) => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: online });

      // When coming back online, process pending receipts
      if (online) {
        logger.info('Network connection restored, processing pending queue');
        try {
          await processPendingQueue();
        } catch (error) {
          // Log but don't throw - network status change shouldn't break the app
          logger.error('Failed to process pending queue on network restore', handleError(error).details);
        }
      }
    });

    return cleanup;
  }, [processPendingQueue]);

  // Story 5.4: Update pending receipts count on mount
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const count = await ocrService.getPendingCount();
        dispatch({ type: 'SET_PENDING_COUNT', payload: count });
      } catch (error) {
        // Don't let database errors break the app
        logger.error('Failed to get pending receipts count', handleError(error).details);
      }
    };

    updatePendingCount();
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
      processPendingQueue, // Story 5.4
      editProductName, // Story 5.3
      addProduct, // Story 5.3
      removeProduct, // Story 5.3
      confirmReview, // Story 5.3
      updateInventoryFromReceipt, // Story 6.1
      stopCamera,
      clearError,
      videoRef,
    }),
    [state, requestCameraPermission, startCamera, capturePhoto, retakePhoto, usePhoto, processReceiptWithOCR, processPendingQueue, editProductName, addProduct, removeProduct, confirmReview, updateInventoryFromReceipt, stopCamera, clearError]
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
