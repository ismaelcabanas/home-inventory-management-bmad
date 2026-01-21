// Stock level configuration constants
// These colors align with MUI theme palette for consistency
// HIGH: Green (success) - Full stock
// MEDIUM: Blue (info) - Moderate stock
// LOW: Orange (warning) - Running low
// EMPTY: Red (error) - Out of stock

export const STOCK_LEVEL_CONFIG = {
  high: {
    label: 'High',
    color: '#4caf50', // MUI success.main (green)
  },
  medium: {
    label: 'Medium',
    color: '#2196f3', // MUI info.main (blue) - CORRECTED from orange
  },
  low: {
    label: 'Low',
    color: '#ff9800', // MUI warning.main (orange) - CORRECTED from red-orange
  },
  empty: {
    label: 'Empty',
    color: '#f44336', // MUI error.main (red)
  },
} as const;

export type StockLevelKey = keyof typeof STOCK_LEVEL_CONFIG;
