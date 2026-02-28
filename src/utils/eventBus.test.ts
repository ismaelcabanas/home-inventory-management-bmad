import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus, EVENTS } from './eventBus';

describe('EventBus', () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    (eventBus as any).events.clear();
  });

  describe('on()', () => {
    it('should register a callback for an event', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);

      eventBus.emit('test-event');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should register multiple callbacks for the same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      eventBus.emit('test-event');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should not call callbacks for different events', () => {
      const callback = vi.fn();
      eventBus.on('event-a', callback);

      eventBus.emit('event-b');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('off()', () => {
    it('should remove a specific callback for an event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);
      eventBus.off('test-event', callback1);

      eventBus.emit('test-event');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should not error when removing non-existent callback', () => {
      const callback = vi.fn();

      expect(() => {
        eventBus.off('test-event', callback);
      }).not.toThrow();
    });

    it('should not error when removing from non-existent event', () => {
      const callback = vi.fn();

      expect(() => {
        eventBus.off('non-existent', callback);
      }).not.toThrow();
    });
  });

  describe('emit()', () => {
    it('should call all registered callbacks with data', () => {
      const callback = vi.fn();
      const testData = { id: '123', value: 'test' };

      eventBus.on('test-event', callback);
      eventBus.emit('test-event', testData);

      expect(callback).toHaveBeenCalledWith(testData);
    });

    it('should call all callbacks when no data is passed', () => {
      const callback = vi.fn();

      eventBus.on('test-event', callback);
      eventBus.emit('test-event');

      expect(callback).toHaveBeenCalledWith(undefined);
    });

    it('should handle multiple rapid events correctly', () => {
      const callback = vi.fn();

      eventBus.on('test-event', callback);

      // Emit multiple times rapidly
      eventBus.emit('test-event', { count: 1 });
      eventBus.emit('test-event', { count: 2 });
      eventBus.emit('test-event', { count: 3 });

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, { count: 1 });
      expect(callback).toHaveBeenNthCalledWith(2, { count: 2 });
      expect(callback).toHaveBeenNthCalledWith(3, { count: 3 });
    });

    it('should not error when emitting to event with no listeners', () => {
      expect(() => {
        eventBus.emit('non-existent', { data: 'test' });
      }).not.toThrow();
    });
  });

  describe('EVENTS constants', () => {
    it('should have INVENTORY_PRODUCT_UPDATED constant', () => {
      expect(EVENTS.INVENTORY_PRODUCT_UPDATED).toBe('inventory:product:updated');
    });
  });

  describe('memory leak prevention', () => {
    it('should properly clean up listeners', () => {
      const callback = vi.fn();

      eventBus.on('test-event', callback);
      eventBus.off('test-event', callback);

      // Verify the internal Set is empty for this event
      const hasListeners = (eventBus as any).events.has('test-event');

      expect(hasListeners).toBe(false);
    });

    it('should only remove the specific callback, not others', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);
      eventBus.off('test-event', callback1);

      eventBus.emit('test-event');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);

      // Verify the internal Set still has one listener
      const listenerCount = (eventBus as any).events.get('test-event')?.size;

      expect(listenerCount).toBe(1);
    });
  });
});
