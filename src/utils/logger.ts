/**
 * Application logging utility with environment-aware behavior.
 * Provides consistent logging across the application with proper log levels.
 *
 * WARNING: Never log sensitive data (passwords, tokens, personal information)
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Debug logging - only appears in development mode.
   * Use for detailed diagnostic information during development.
   *
   * @param message - Log message
   * @param args - Additional context objects or values
   *
   * @example
   * logger.debug('Loading products from database');
   * logger.debug('OCR processing started', { imageSize: image.length, language: 'eng' });
   */
  debug: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Info logging - normal operational messages.
   * Use for successful operations and important state changes.
   *
   * @param message - Log message
   * @param args - Additional context objects or values
   *
   * @example
   * logger.info('Products loaded successfully', { count: products.length });
   * logger.info('Receipt scanned', { productsFound: 12 });
   */
  info: (message: string, ...args: unknown[]): void => {
    console.info(`[INFO] ${message}`, ...args);
  },

  /**
   * Warning logging - unexpected but recoverable issues.
   * Use when something unusual happens but the operation can continue.
   *
   * @param message - Log message
   * @param args - Additional context objects or values
   *
   * @example
   * logger.warn('Product name already exists', { name: 'Milk' });
   * logger.warn('OCR confidence below threshold', { confidence: 0.7 });
   */
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Error logging - failures and exceptions.
   * Use for all error conditions that prevent normal operation.
   *
   * @param message - Error message
   * @param error - Error object or additional context
   *
   * @example
   * logger.error('Failed to save product', error);
   * logger.error('Database connection failed', { details: error, productId: '123' });
   */
  error: (message: string, error?: unknown): void => {
    console.error(`[ERROR] ${message}`, error);
  }
};
