/**
 * Receipt feature types
 * Contains state definitions and action types for receipt scanning and camera functionality
 *
 * Story 5.4: Added offline queue support with isOnline state
 * Story 6.1: Added inventory update state (updatingInventory, updateError, productsUpdated)
 */

import type { Product } from '@/types/product';
import type { AppError } from '@/types/error';

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
 *
 * Story 5.3: Added 'review' state for user to review and correct OCR results
 */
export type OCRState =
  | 'idle'       // No OCR processing initiated
  | 'processing' // OCR actively processing receipt
  | 'review'     // Story 5.3: User reviewing and correcting OCR results
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
 * Story 5.3: Added productsInReview and confirmedProducts for review workflow
 * Story 6.1: Added inventory update state (updatingInventory, updateError, productsUpdated)
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
  productsInReview: RecognizedProduct[]; // Story 5.3: Products currently being reviewed by user
  confirmedProducts: RecognizedProduct[]; // Story 5.3: User-confirmed products ready for inventory update
  updatingInventory: boolean; // Story 6.1: true during inventory update process
  updateError: AppError | null; // Story 6.1: error if update fails
  productsUpdated: number; // Story 6.1: count of products successfully updated (-1 = not yet updated)
}

/**
 * ReceiptAction discriminated union
 * All possible actions for ReceiptContext state management
 *
 * Story 5.4: Added SET_ONLINE_STATUS and SET_PENDING_COUNT actions
 * Story 5.4 bug fix: Added SET_OCR_CONFIGURED action
 * Story 5.3: Added EDIT_PRODUCT_NAME, ADD_PRODUCT, REMOVE_PRODUCT, CONFIRM_REVIEW, SET_PRODUCTS_IN_REVIEW actions
 * Story 6.1: Added SET_UPDATING_INVENTORY, INVENTORY_UPDATE_SUCCESS, INVENTORY_UPDATE_ERROR actions
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
  | { type: 'SET_PRODUCTS_IN_REVIEW'; payload: RecognizedProduct[] } // Story 5.3: Set products for review
  | { type: 'EDIT_PRODUCT_NAME'; payload: { productId: string; newName: string } } // Story 5.3: Edit product name
  | { type: 'ADD_PRODUCT'; payload: RecognizedProduct } // Story 5.3: Add new product to review
  | { type: 'REMOVE_PRODUCT'; payload: string } // Story 5.3: Remove product from review (productId)
  | { type: 'CONFIRM_REVIEW'; payload: RecognizedProduct[] } // Story 5.3: Confirm review and set confirmed products
  | { type: 'SET_UPDATING_INVENTORY'; payload: boolean } // Story 6.1: Set updating inventory state
  | { type: 'INVENTORY_UPDATE_SUCCESS'; payload: number } // Story 6.1: Products updated count
  | { type: 'INVENTORY_UPDATE_ERROR'; payload: AppError | null } // Story 6.1: Inventory update error
  | { type: 'RESET' };

/**
 * ReceiptContext value interface
 * Exposes state and methods for receipt scanning functionality
 *
 * Story 5.4: Added processPendingQueue method for offline queue processing
 * Story 5.3: Added review state management methods (editProductName, addProduct, removeProduct, confirmReview)
 * Story 6.1: Added updateInventoryFromReceipt method
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
  editProductName: (productId: string, newName: string) => void; // Story 5.3: Edit product name during review
  addProduct: (name: string) => void; // Story 5.3: Add new product during review
  removeProduct: (productId: string) => void; // Story 5.3: Remove product during review
  confirmReview: () => void; // Story 5.3: Confirm review and proceed to inventory update
  updateInventoryFromReceipt: (products?: RecognizedProduct[]) => Promise<void>; // Story 6.1: Update inventory from confirmed products
  stopCamera: () => void;
  clearError: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}
