// src/utils/errorHandler.ts
import type { AppError } from '@/types/error';

export function handleError(error: unknown): AppError {
  // Handle known error types
  if (error instanceof Error) {
    return {
      message: getUserFriendlyMessage(error),
      code: getErrorCode(error),
      details: error.stack
    };
  }

  // Handle unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    details: error
  };
}

function getUserFriendlyMessage(error: Error): string {
  // Map technical errors to user-friendly messages
  if (error.message.includes('network')) {
    return 'Unable to connect. Please check your connection.';
  }
  if (error.message.includes('permission')) {
    return 'Permission denied. Please check your settings.';
  }
  // Return original message for app-specific errors
  return error.message;
}

function getErrorCode(error: Error): string {
  // Extract or assign error codes
  if ('code' in error) return String(error.code);
  return 'UNKNOWN_ERROR';
}
