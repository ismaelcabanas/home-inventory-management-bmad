/**
 * Receipt feature types
 * Contains state definitions and action types for receipt scanning and camera functionality
 *
 * Story 5.4: Added offline queue support with isOnline state
 */

import type { Product } from '@/types/product';

/**
 * Camera state machine states
 * Represents the lifecycle of camera operations from idle to preview
 */
export type CameraState =
  | 'idle'                  // Initial state, showing "Scan Receipt" button
  | 'requesting_permission' // Permission prompt active
  | 'capturing'             // Camera active, video feed visible
  | 'preview'               // Captured image shown for confirmation
  | 'error';                 // Error state with message and retry option

/**
 * OCR state machine states
 * Represents the lifecycle of OCR processing
 */
export type OCRState =
  | 'idle'       // No OCR processing initiated
  | 'processing' // OCR actively processing receipt
  | 'completed'  // OCR completed, products recognized
  | 'error';      // OCR processing failed

/**
 * Recognized product from OCR
 * Represents a product extracted from receipt with optional inventory match
 */
export interface RecognizedProduct {
  id: string; // UUID
  name: string; // Extracted from OCR
  matchedProduct?: Product; // If found in inventory
  confidence: number; // 0-1 score
  isCorrect: boolean; // User confirmed in next story
}

/**
 * OCR processing result
 * Return type for OCR service operations
 */
export interface OCRResult {
  products: RecognizedProduct[];
  rawText: string;
}

/**
 * Receipt feature state interface
 * Manages all receipt scanning state including camera, images, OCR, and errors
 *
 * Story 5.4: Added isOnline and pendingReceiptsCount for offline queue support
 * Story 5.4 bug fix: Added isOCRConfigured to track LLM API key availability
 */
export interface ReceiptState {
  cameraState: CameraState;
  ocrState: OCRState;
  videoStream: MediaStream | null;
  capturedImage: string | null; // data URL of captured photo
  processingProgress: number; // 0-100 for OCR progress indicator
  recognizedProducts: RecognizedProduct[];
  rawOcrText: string | null; // Raw text extracted by OCR (for debugging)
  error: string | null;
  feedbackMessage: string;
  isOnline: boolean; // Story 5.4: Network connectivity status
  pendingReceiptsCount: number; // Story 5.4: Number of receipts waiting to be processed
  isOCRConfigured: boolean; // Story 5.4 bug fix: Whether LLM API key is configured
}

/**
 * ReceiptAction discriminated union
 * All possible actions for ReceiptContext state management
 *
 * Story 5.4: Added SET_ONLINE_STATUS and SET_PENDING_COUNT actions
 * Story 5.4 bug fix: Added SET_OCR_CONFIGURED action
 */
export type ReceiptAction =
  | { type: 'SET_CAMERA_STATE'; payload: CameraState }
  | { type: 'SET_OCR_STATE'; payload: OCRState }
  | { type: 'SET_VIDEO_STREAM'; payload: MediaStream | null }
  | { type: 'SET_CAPTURED_IMAGE'; payload: string | null }
  | { type: 'SET_PROCESSING_PROGRESS'; payload: number }
  | { type: 'SET_RECOGNIZED_PRODUCTS'; payload: RecognizedProduct[] }
  | { type: 'SET_RAW_OCR_TEXT'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FEEDBACK_MESSAGE'; payload: string }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean } // Story 5.4: Network status
  | { type: 'SET_PENDING_COUNT'; payload: number } // Story 5.4: Pending receipts count
  | { type: 'SET_OCR_CONFIGURED'; payload: boolean } // Story 5.4 bug fix: LLM API key status
  | { type: 'RESET' };

/**
 * ReceiptContext value interface
 * Exposes state and methods for receipt scanning functionality
 *
 * Story 5.4: Added processPendingQueue method for offline queue processing
 */
export interface ReceiptContextValue {
  state: ReceiptState;
  requestCameraPermission: () => Promise<void>;
  startCamera: () => Promise<void>;
  capturePhoto: () => Promise<void>;
  retakePhoto: () => Promise<void>;
  usePhoto: () => void;
  processReceiptWithOCR: (imageDataUrl: string) => Promise<void>;
  processPendingQueue: () => Promise<{ processed: number; completed: number; failed: number }>; // Story 5.4
  stopCamera: () => void;
  clearError: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}
