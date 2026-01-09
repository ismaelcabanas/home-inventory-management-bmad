// src/types/error.ts
export interface AppError {
  message: string;        // User-friendly message
  code?: string;         // Error code (e.g., 'OCR_FAILED', 'DB_ERROR')
  details?: unknown;     // Technical details for logging only
}
