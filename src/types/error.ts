/**
 * Standard error interface for the application.
 * All errors should be converted to this format for consistent handling.
 */
export interface AppError {
  /**
   * User-friendly error message suitable for display to end users.
   * Should be clear, concise, and actionable.
   * Examples: "Unable to save product", "Failed to load inventory"
   */
  message: string;

  /**
   * Optional error code for programmatic error handling.
   * Examples: 'DB_ERROR', 'OCR_FAILED', 'NETWORK_ERROR', 'PERMISSION_DENIED'
   */
  code?: string;

  /**
   * Technical details for debugging and logging.
   * Should NOT be shown to end users.
   * Can include stack traces, error objects, or diagnostic information.
   */
  details?: unknown;
}
