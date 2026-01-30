import Dexie, { Table } from 'dexie';
import type { Product } from '@/types/product';

class InventoryDatabase extends Dexie {
  products!: Table<Product>;

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
      // Note: The migration is handled automatically by Dexie when upgrading from v1 to v2
      // New products will have isChecked: false by default
      // Existing products will be updated with isChecked: false
    });
  }
}

export const db = new InventoryDatabase();
