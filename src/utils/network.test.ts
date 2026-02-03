/**
 * Network Utility Tests
 * Tests for network detection and status change notifications (Story 5.4)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isOnline, onNetworkStatusChange, getNetworkStatus } from './network';

describe('Network Utility', () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    // Reset navigator.onLine to true before each test
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    // Restore original navigator
    window.navigator = originalNavigator;
    vi.restoreAllMocks();
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(isOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(isOnline()).toBe(false);
    });
  });

  describe('getNetworkStatus', () => {
    it('should return "online" when navigator.onLine is true', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(getNetworkStatus()).toBe('online');
    });

    it('should return "offline" when navigator.onLine is false', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(getNetworkStatus()).toBe('offline');
    });

    it('should return "unknown" when navigator.onLine is not available', () => {
      // Mock navigator without onLine property
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {},
      });

      expect(getNetworkStatus()).toBe('unknown');
    });
  });

  describe('onNetworkStatusChange', () => {
    it('should call callback with true when online event fires', () => {
      const callback = vi.fn();
      const cleanup = onNetworkStatusChange(callback);

      // Simulate online event
      window.dispatchEvent(new Event('online'));

      expect(callback).toHaveBeenCalledWith(true);
      expect(callback).toHaveBeenCalledTimes(1);

      cleanup();
    });

    it('should call callback with false when offline event fires', () => {
      const callback = vi.fn();
      const cleanup = onNetworkStatusChange(callback);

      // Simulate offline event
      window.dispatchEvent(new Event('offline'));

      expect(callback).toHaveBeenCalledWith(false);
      expect(callback).toHaveBeenCalledTimes(1);

      cleanup();
    });

    it('should call callback multiple times for multiple events', () => {
      const callback = vi.fn();
      const cleanup = onNetworkStatusChange(callback);

      // Simulate multiple status changes
      window.dispatchEvent(new Event('offline'));
      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('offline'));

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, false);
      expect(callback).toHaveBeenNthCalledWith(2, true);
      expect(callback).toHaveBeenNthCalledWith(3, false);

      cleanup();
    });

    it('should remove event listeners when cleanup is called', () => {
      const callback = vi.fn();
      const cleanup = onNetworkStatusChange(callback);

      // Remove listeners
      cleanup();

      // Simulate events after cleanup
      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('offline'));

      // Callback should not be called after cleanup
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple simultaneous listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const cleanup1 = onNetworkStatusChange(callback1);
      const cleanup2 = onNetworkStatusChange(callback2);

      // Simulate online event
      window.dispatchEvent(new Event('online'));

      // Both callbacks should be called
      expect(callback1).toHaveBeenCalledWith(true);
      expect(callback2).toHaveBeenCalledWith(true);

      cleanup1();
      cleanup2();
    });

    it('should handle cleanup of one listener without affecting others', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const cleanup1 = onNetworkStatusChange(callback1);
      const cleanup2 = onNetworkStatusChange(callback2);

      // Remove only the first listener
      cleanup1();

      // Simulate online event
      window.dispatchEvent(new Event('online'));

      // Only callback2 should be called
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(true);

      cleanup2();
    });
  });
});
