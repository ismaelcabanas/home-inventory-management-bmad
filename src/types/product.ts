export type StockLevel = 'high' | 'medium' | 'low' | 'empty';

export interface Product {
  id: string;
  name: string;
  stockLevel: StockLevel;
  createdAt: Date;
  updatedAt: Date;
  isOnShoppingList: boolean;
  isChecked: boolean; // Story 4.1: Track collection state independently from list membership
}
