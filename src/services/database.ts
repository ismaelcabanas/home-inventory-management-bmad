import Dexie, { Table } from 'dexie';
import type { Product } from '@/types/product';

class InventoryDatabase extends Dexie {
  products!: Table<Product>;

  constructor() {
    super('HomeInventoryDB');
    this.version(1).stores({
      products: '++id, name, stockLevel, isOnShoppingList, updatedAt'
    });
  }
}

export const db = new InventoryDatabase();
