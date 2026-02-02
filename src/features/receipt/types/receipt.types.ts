/**
 * Receipt feature types
 * Contains state definitions and action types for receipt scanning and camera functionality
 */

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
 * Receipt feature state interface
 * Manages all receipt scanning state including camera, images, and errors
 */
export interface ReceiptState {
  cameraState: CameraState;
  videoStream: MediaStream | null;
  capturedImage: string | null; // data URL of captured photo
  error: string | null;
  feedbackMessage: string;
}

/**
 * ReceiptAction discriminated union
 * All possible actions for ReceiptContext state management
 */
export type ReceiptAction =
  | { type: 'SET_CAMERA_STATE'; payload: CameraState }
  | { type: 'SET_VIDEO_STREAM'; payload: MediaStream | null }
  | { type: 'SET_CAPTURED_IMAGE'; payload: string | null }
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
  stopCamera: () => void;
  clearError: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}
