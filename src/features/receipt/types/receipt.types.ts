/**
 * Receipt feature types
 * Contains state definitions and action types for receipt scanning and camera functionality
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
 */
export interface ReceiptState {
  cameraState: CameraState;
  ocrState: OCRState;
  videoStream: MediaStream | null;
  capturedImage: string | null; // data URL of captured photo
  processingProgress: number; // 0-100 for OCR progress indicator
  recognizedProducts: RecognizedProduct[];
  rawOcrText: string | null; // Raw text extracted by Tesseract (for debugging)
  error: string | null;
  feedbackMessage: string;
}

/**
 * ReceiptAction discriminated union
 * All possible actions for ReceiptContext state management
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
  | { type: 'RESET' };

/**
 * ReceiptContext value interface
 * Exposes state and methods for receipt scanning functionality
 */
export interface ReceiptContextValue {
  state: ReceiptState;
  requestCameraPermission: () => Promise<void>;
  startCamera: () => Promise<void>;
  capturePhoto: () => Promise<void>;
  retakePhoto: () => Promise<void>;
  usePhoto: () => void;
  processReceiptWithOCR: (imageDataUrl: string) => Promise<void>;
  stopCamera: () => void;
  clearError: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}
