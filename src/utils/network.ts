/**
 * Network Detection Utility
 *
 * Provides network status detection and change notifications.
 * Used by offline OCR queue (Story 5.4) to detect when connectivity
 * is restored for processing pending receipts.
 */

import { logger } from './logger';

/**
 * Check if the browser is currently online
 * @returns true if online, false if offline
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Register a callback for network status changes
 *
 * This function adds event listeners for 'online' and 'offline' events
 * and invokes the provided callback when the network status changes.
 *
 * @param callback - Function called with boolean (true=online, false=offline)
 * @returns Cleanup function to remove event listeners
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const cleanup = onNetworkStatusChange((online) => {
 *     console.log('Network status:', online ? 'online' : 'offline');
 *   });
 *   return cleanup;
 * }, []);
 * ```
 */
export const onNetworkStatusChange = (
  callback: (online: boolean) => void
): (() => void) => {
  const handleOnline = () => {
    logger.info('Network status changed: online');
    callback(true);
  };

  const handleOffline = () => {
    logger.info('Network status changed: offline');
    callback(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function to remove listeners
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Network status for UI display
 */
export type NetworkStatus = 'online' | 'offline' | 'unknown';

/**
 * Get current network status as a string for UI display
 * @returns 'online', 'offline', or 'unknown' if navigator.onLine is not available
 */
export const getNetworkStatus = (): NetworkStatus => {
  if (typeof navigator.onLine === 'boolean') {
    return navigator.onLine ? 'online' : 'offline';
  }
  return 'unknown';
};
