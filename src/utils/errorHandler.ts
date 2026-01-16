import type { AppError } from '@/types/error';

/**
 * Converts any error into a standardized AppError format.
 * Provides user-friendly messages while preserving technical details for logging.
 *
 * @param error - The error to handle (can be any type)
 * @returns Standardized AppError object
 *
 * @example
 * try {
 *   await db.products.add(product);
 * } catch (error) {
 *   const appError = handleError(error);
 *   logger.error('Failed to add product', appError.details);
 *   dispatch({ type: 'SET_ERROR', payload: appError.message });
 * }
 */
export function handleError(error: unknown): AppError {
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: getUserFriendlyMessage(error),
      code: getErrorCode(error),
      details: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error || 'An error occurred',
      code: 'UNKNOWN_ERROR',
      details: error
    };
  }

  // Handle unknown error types
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}

/**
 * Maps technical error messages to user-friendly messages.
 * Add more mappings as needed for specific error types.
 */
function getUserFriendlyMessage(error: Error): string {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }

  // Permission errors
  if (message.includes('permission') || message.includes('denied')) {
    return 'Permission denied. Please check your settings.';
  }

  // Database errors
  if (message.includes('database') || message.includes('indexeddb')) {
    return 'Unable to access data. Please try again.';
  }

  // Storage errors
  if (message.includes('quota') || message.includes('storage')) {
    return 'Storage is full. Please free up some space.';
  }

  // Default: Use original message if it's already user-friendly
  if (message.length < 100 && !message.includes('undefined') && !message.includes('null')) {
    return error.message;
  }

  return 'An error occurred. Please try again.';
}

/**
 * Extracts or assigns error codes for programmatic handling.
 */
function getErrorCode(error: Error): string {
  // Check if error has a code property (handle both string and number codes)
  if ('code' in error && error.code != null) {
    return String(error.code);
  }

  // Derive code from error type
  if (error.name === 'TypeError') return 'TYPE_ERROR';
  if (error.name === 'ReferenceError') return 'REFERENCE_ERROR';
  if (error.name === 'NetworkError') return 'NETWORK_ERROR';

  return 'UNKNOWN_ERROR';
}
