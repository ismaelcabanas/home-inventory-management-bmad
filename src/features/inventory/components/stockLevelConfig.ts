// Stock level configuration constants
// These colors align with MUI theme palette for consistency

export const STOCK_LEVEL_CONFIG = {
  high: {
    label: 'High',
    color: '#4caf50', // MUI success.main
  },
  medium: {
    label: 'Medium',
    color: '#ff9800', // MUI warning.main
  },
  low: {
    label: 'Low',
    color: '#ff5722', // MUI warning.dark / error.light
  },
  empty: {
    label: 'Empty',
    color: '#f44336', // MUI error.main
  },
} as const;

export type StockLevelKey = keyof typeof STOCK_LEVEL_CONFIG;
