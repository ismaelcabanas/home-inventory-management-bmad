/**
 * EventBus - Event-driven communication utility
 *
 * Provides a lightweight event emitter pattern for cross-context communication.
 * Used to replace polling with event-driven synchronization between contexts.
 *
 * Example:
 *   eventBus.on(EVENTS.INVENTORY_PRODUCT_UPDATED, (data) => {
 *     console.log('Product updated:', data.id, data.updates);
 *   });
 *
 *   eventBus.emit(EVENTS.INVENTORY_PRODUCT_UPDATED, { id: '123', updates: { stockLevel: 'low' } });
 *
 *   // Cleanup is important to prevent memory leaks
 *   eventBus.off(EVENTS.INVENTORY_PRODUCT_UPDATED, callback);
 */

type EventCallback = (data?: unknown) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  /**
   * Register a callback for an event
   * @param event - The event name to listen for
   * @param callback - The function to call when the event is emitted
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  /**
   * Remove a callback for an event
   * @param event - The event name
   * @param callback - The callback function to remove
   */
  off(event: string, callback: EventCallback): void {
    this.events.get(event)?.delete(callback);

    // Clean up empty event sets to prevent memory leaks
    const eventSet = this.events.get(event);
    if (eventSet && eventSet.size === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit an event with optional data
   * @param event - The event name to emit
   * @param data - Optional data to pass to callbacks
   */
  emit(event: string, data?: unknown): void {
    this.events.get(event)?.forEach(callback => callback(data));
  }
}

// Singleton instance for app-wide event bus
export const eventBus = new EventBus();

// Event name constants for type safety and documentation
export const EVENTS = {
  /** Emitted when a product is updated in InventoryContext */
  INVENTORY_PRODUCT_UPDATED: 'inventory:product:updated',
} as const;

// Type for event data payloads (extensible for future events)
export interface InventoryProductUpdatedEvent {
  id: string;
  updates: {
    stockLevel?: 'high' | 'medium' | 'low' | 'empty';
    name?: string;
    [key: string]: unknown;
  };
}
