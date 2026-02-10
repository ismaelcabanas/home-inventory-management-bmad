// Stock level utility functions for Story 7.1 UX improvements
// Provides helpers for stock level cycling and visual styling

export const STOCK_LEVELS = ['high', 'medium', 'low', 'empty'] as const;
export type StockLevel = typeof STOCK_LEVELS[number];

/**
 * Cycles to the next stock level in the sequence
 * Order: high → medium → low → empty → high (wraps around)
 */
export const getNextStockLevel = (current: StockLevel): StockLevel => {
  const currentIndex = STOCK_LEVELS.indexOf(current);
  const nextIndex = (currentIndex + 1) % STOCK_LEVELS.length;
  return STOCK_LEVELS[nextIndex]!;
};

/**
 * Returns the gradient background for a given stock level
 * Story 7.1 AC4: Distinct gradient for each stock level
 */
export const getStockLevelGradient = (level: StockLevel): string => {
  const gradients = {
    high: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    medium: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
    low: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    empty: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  } as const;
  return gradients[level];
};

/**
 * Returns the border-left color for a given stock level
 * Story 7.1 AC4: 4px solid colored left border
 */
export const getStockLevelBorderColor = (level: StockLevel): string => {
  const colors = {
    high: '#4caf50',    // green
    medium: '#ff9800',  // yellow/orange
    low: '#ff5722',     // orange/red
    empty: '#f44336',   // red
  } as const;
  return colors[level];
};

/**
 * Returns the human-readable text label for a stock level
 * Story 7.1 AC3: Stock status text on line 2 of product card
 */
export const getStockLevelText = (level: StockLevel): string => {
  const labels = {
    high: 'In stock',
    medium: 'Running low',
    low: 'Almost empty',
    empty: 'Empty',
  } as const;
  return labels[level];
};
