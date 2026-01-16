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
});
