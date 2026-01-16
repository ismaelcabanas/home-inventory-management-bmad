import { describe, it, expect } from 'vitest';
import { handleError } from './errorHandler';

describe('handleError', () => {
  it('should handle standard Error objects', () => {
    const error = new Error('Test error');
    const result = handleError(error);

    expect(result.message).toBeTypeOf('string');
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.details).toBeDefined();
    expect(result.code).toBeTypeOf('string');
    expect(result.code).toBeDefined();
    if (result.code) {
      expect(result.code.length).toBeGreaterThan(0);
    }
  });

  it('should handle errors with custom string codes', () => {
    const error = Object.assign(new Error('Database error'), { code: 'DB_ERROR' });
    const result = handleError(error);

    expect(result.code).toBe('DB_ERROR');
  });

  it('should handle errors with numeric codes', () => {
    const error = Object.assign(new Error('System error'), { code: -2 });
    const result = handleError(error);

    expect(result.code).toBe('-2');
  });

  it('should handle string errors', () => {
    const result = handleError('Something went wrong');

    expect(result.message).toBe('Something went wrong');
    expect(result.code).toBe('UNKNOWN_ERROR');
  });

  it('should handle empty string errors', () => {
    const result = handleError('');

    expect(result.message).toBe('An error occurred');
    expect(result.code).toBe('UNKNOWN_ERROR');
  });

  it('should handle number errors', () => {
    const result = handleError(404);

    expect(result.message).toContain('unexpected error');
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.details).toBe(404);
  });

  it('should handle boolean errors', () => {
    const result = handleError(false);

    expect(result.message).toContain('unexpected error');
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.details).toBe(false);
  });

  it('should handle unknown error types', () => {
    const result = handleError({ unexpected: 'object' });

    expect(result.message).toContain('unexpected error');
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.details).toEqual({ unexpected: 'object' });
  });

  it('should provide user-friendly messages for network errors', () => {
    const error = new Error('Network request failed');
    const result = handleError(error);

    expect(result.message).toContain('connect');
    expect(result.message).not.toContain('Network request failed');
  });

  it('should provide user-friendly messages for permission errors', () => {
    const error = new Error('Permission denied');
    const result = handleError(error);

    expect(result.message).toContain('Permission denied');
    expect(result.message).toContain('settings');
  });

  it('should provide user-friendly messages for database errors', () => {
    const error = new Error('IndexedDB operation failed');
    const result = handleError(error);

    expect(result.message).toContain('Unable to access data');
    expect(result.message).not.toContain('IndexedDB');
  });

  it('should provide user-friendly messages for storage quota errors', () => {
    const error = new Error('Storage quota exceeded');
    const result = handleError(error);

    expect(result.message).toContain('Storage is full');
    expect(result.message).not.toContain('quota');
  });

  it('should derive error codes from error types', () => {
    const typeError = new TypeError('Invalid type');
    const refError = new ReferenceError('Undefined variable');

    expect(handleError(typeError).code).toBe('TYPE_ERROR');
    expect(handleError(refError).code).toBe('REFERENCE_ERROR');
  });

  it('should handle null and undefined', () => {
    const nullResult = handleError(null);
    const undefinedResult = handleError(undefined);

    expect(nullResult.message).toBeTypeOf('string');
    expect(nullResult.message.length).toBeGreaterThan(0);
    expect(undefinedResult.message).toBeTypeOf('string');
    expect(undefinedResult.message.length).toBeGreaterThan(0);
  });
});
