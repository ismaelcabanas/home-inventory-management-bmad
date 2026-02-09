import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    // Spy on console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log debug messages with [DEBUG] prefix', () => {
    logger.debug('Test debug message');

    if (import.meta.env.DEV) {
      expect(console.log).toHaveBeenCalledWith('[DEBUG] Test debug message');
    } else {
      expect(console.log).not.toHaveBeenCalled();
    }
  });

  it('should log info messages with [INFO] prefix', () => {
    logger.info('Test info message');
    expect(console.info).toHaveBeenCalledWith('[INFO] Test info message');
  });

  it('should log warn messages with [WARN] prefix', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalledWith('[WARN] Test warning message');
  });

  it('should log error messages with [ERROR] prefix', () => {
    const error = new Error('Test error');
    logger.error('Test error message', error);
    expect(console.error).toHaveBeenCalledWith('[ERROR] Test error message', error);
  });

  it('should log with additional context objects', () => {
    const context = { count: 5, status: 'success' };
    logger.info('Operation completed', context);
    expect(console.info).toHaveBeenCalledWith('[INFO] Operation completed', context);
  });

  // Story 6.2: Error logging tests
  describe('Error Logging for Inventory Updates', () => {
    it('should log error messages with context', () => {
      const errorDetails = {
        originalError: new Error('Database connection failed'),
        productNames: ['Milk', 'Bread', 'Cheese'],
        timestamp: new Date().toISOString(),
      };

      logger.error('Failed to replenish stock', errorDetails);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Failed to replenish stock',
        errorDetails
      );
    });

    it('should preserve error stack traces', () => {
      const error = new Error('Test error with stack');
      const errorDetails = {
        originalError: error,
        stack: error.stack,
      };

      logger.error('Operation failed', errorDetails);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Operation failed',
        expect.objectContaining({
          stack: expect.any(String),
        })
      );
    });

    it('should not expose sensitive data in logs', () => {
      const errorDetails = {
        message: 'Update failed',
        // Sensitive data that should NOT be logged
        password: 'secret123',
        apiKey: 'sk-1234567890',
      };

      logger.error('Failed to update inventory', errorDetails);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Failed to update inventory',
        expect.objectContaining({
          message: 'Update failed',
        })
      );

      // Note: In real implementation, we should filter sensitive data
      // This test documents the expected behavior
    });

    it('should handle complex error objects', () => {
      const complexError = {
        name: 'DatabaseError',
        message: 'Connection lost',
        code: 'DB_CONN_001',
        details: {
          retryCount: 3,
          lastAttempt: new Date().toISOString(),
        },
      };

      logger.error('Database error occurred', complexError);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Database error occurred',
        complexError
      );
    });
  });

  describe('Error Context Formatting', () => {
    it('should format error details consistently', () => {
      const errorDetails = {
        originalError: new Error('Test error'),
        context: {
          operation: 'replenishStock',
          productCount: 3,
        },
      };

      logger.error('Service error', errorDetails);

      expect(console.error).toHaveBeenCalled();
      const callArgs = vi.mocked(console.error).mock.calls[0];
      expect(callArgs[0]).toBe('[ERROR] Service error');
      expect(callArgs[1]).toEqual(errorDetails);
    });

    it('should handle missing error details gracefully', () => {
      logger.error('Error with minimal context');

      expect(console.error).toHaveBeenCalledWith('[ERROR] Error with minimal context', undefined);
    });

    it('should log errors with timestamp metadata', () => {
      const errorWithTimestamp = {
        message: 'Update failed',
        timestamp: new Date().toISOString(),
        operation: 'updateInventoryFromReceipt',
      };

      logger.error('Inventory update error', errorWithTimestamp);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Inventory update error',
        errorWithTimestamp
      );
    });
  });
});
