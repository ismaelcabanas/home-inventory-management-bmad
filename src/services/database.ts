import Dexie, { Table } from 'dexie';
import type { Product } from '@/types/product';

/**
 * Pending Receipt for offline OCR queue (Story 5.4)
 *
 * When the user is offline or API quota is exceeded, receipt images
 * are stored here and processed when connectivity is restored.
 */
export interface PendingReceipt {
  id?: string; // Auto-incremented primary key
  imageData: string; // Base64 data URL of receipt image
  createdAt: Date; // Timestamp when receipt was captured
  status: 'pending' | 'processing' | 'completed' | 'failed'; // Processing status
  error?: string; // Error message if status is 'failed'
}

class InventoryDatabase extends Dexie {
  products!: Table<Product>;
  pendingReceipts!: Table<PendingReceipt>;

  constructor() {
    super('HomeInventoryDB');
    // Story 1.2: Version 1 - Initial schema
    this.version(1).stores({
      // Use 'id' without '++' since we manually assign UUIDs (not auto-increment)
      products: 'id, name, stockLevel, isOnShoppingList, updatedAt'
    });

    // Story 4.1: Version 2 - Add isChecked field for check-off items while shopping
    this.version(2).stores({
      products: 'id, name, stockLevel, isOnShoppingList, isChecked, updatedAt'
    }).upgrade(async () => {
      // Migration: Set isChecked = false for all existing products
      // This ensures backward compatibility when users upgrade from version 1
      await db.products.toCollection().modify(product => {
        product.isChecked = false;
      });
    });

    // Story 5.4: Version 3 - Add pendingReceipts table for offline OCR queue
    this.version(3).stores({
      products: 'id, name, stockLevel, isOnShoppingList, isChecked, updatedAt',
      // Use '++id' for auto-incrementing primary key
      pendingReceipts: '++id, createdAt, status'
    }).upgrade(async () => {
      // Migration: No data migration needed for new table
      // The pendingReceipts table starts empty
      // Future receipts will be added when user is offline
    });
  }
}

export const db = new InventoryDatabase();
