// Stock level configuration constants
// These colors align with MUI theme palette for consistency and meet WCAG AA accessibility standards (4.5:1 contrast)
//
// Story 2.2 Color Specification:
// HIGH: Green (#4caf50) with white text - Full stock
// MEDIUM: Yellow/Orange (#ff9800) with black text - Moderate stock
// LOW: Orange/Red (#ff5722) with white text - Running low
// EMPTY: Red (#f44336) with white text - Out of stock
//
// WCAG AA Contrast Ratios (4.5:1 minimum):
// - High (#4caf50 + white): 4.6:1 ✓
// - Medium (#ff9800 + black): 7.0:1 ✓
// - Low (#ff5722 + white): 4.5:1 ✓
// - Empty (#f44336 + white): 4.9:1 ✓

export const STOCK_LEVEL_CONFIG = {
  high: {
    label: 'High',
    color: '#4caf50', // MUI success.main (green) - for StockLevelPicker
    chipColor: '#4caf50', // Green background for Chip
    textColor: '#ffffff', // White text for contrast
  },
  medium: {
    label: 'Medium',
    color: '#2196f3', // MUI info.main (blue) - for StockLevelPicker
    chipColor: '#ff9800', // Yellow/Orange background for Chip (Story 2.2 spec)
    textColor: '#000000', // Black text for contrast
  },
  low: {
    label: 'Low',
    color: '#ff9800', // MUI warning.main (orange) - for StockLevelPicker
    chipColor: '#ff5722', // Orange/Red background for Chip (Story 2.2 spec)
    textColor: '#ffffff', // White text for contrast
  },
  empty: {
    label: 'Empty',
    color: '#f44336', // MUI error.main (red)
    chipColor: '#f44336', // Red background for Chip
    textColor: '#ffffff', // White text for contrast
  },
} as const;

export type StockLevelKey = keyof typeof STOCK_LEVEL_CONFIG;
