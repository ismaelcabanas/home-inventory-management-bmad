import { useState, useCallback } from 'react';
import { ListItem, ListItemText, Chip, Checkbox, Box, Snackbar, Alert } from '@mui/material';
import { STOCK_LEVEL_CONFIG } from '@/features/inventory/components/stockLevelConfig';
import type { Product } from '@/types/product';
import { useShoppingList } from '@/features/shopping/context/ShoppingContext';

interface ShoppingListItemProps {
  product: Product;
  isShoppingMode: boolean; // Story 4.4: Shopping Mode state
}

export function ShoppingListItem({ product, isShoppingMode }: ShoppingListItemProps) {
  const stockConfig = STOCK_LEVEL_CONFIG[product.stockLevel];
  const { toggleItemChecked } = useShoppingList();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleCheckboxChange = useCallback(() => {
    const newCheckedState = !product.isChecked;
    toggleItemChecked(product.id);

    // Story 4.1 AC2/AC3: Show visual confirmation (snackbar) on check/uncheck
    setSnackbarMessage(
      newCheckedState ? `${product.name} collected` : `${product.name} uncollected`
    );
    setSnackbarOpen(true);
  }, [product.id, product.isChecked, product.name, toggleItemChecked]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  return (
    <ListItem
      sx={{
        // Story 4.3: Minimum height for tappable area (NFR8.1: 44x44px)
        minHeight: 56,
        padding: '12px 16px',
        // Story 4.3: Position checkbox on right for thumb reach (one-handed operation)
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Story 4.1: Conditional styling for checked items */}
      <Box
        sx={{
          textDecoration: product.isChecked ? 'line-through' : 'none',
          opacity: product.isChecked ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
          flex: 1, // Allow text to take available space
        }}
      >
        {/* Story 4.3: Minimum 16px font size for readability (NFR8) */}
        <ListItemText
          primary={product.name}
          primaryTypographyProps={{
            sx: {
              fontSize: '1rem', // 16px minimum for readability (NFR8)
              fontWeight: 500, // Slightly bolder for high contrast (NFR8)
            }
          }}
        />
        <Chip
          label={stockConfig.label}
          sx={{
            backgroundColor: stockConfig.chipColor,
            color: stockConfig.textColor,
            fontSize: '14px',
            marginTop: 0.5,
          }}
          size="small"
        />
      </Box>

      {/* Story 4.4: Checkbox only visible when in Shopping Mode */}
      {/* Story 4.4: Conditional rendering for cleaner tests and behavior */}
      {/* Story 4.3: Positioned on right for one-handed thumb reach */}
      {isShoppingMode && (
        <Checkbox
          checked={product.isChecked}
          onChange={handleCheckboxChange}
          size="medium" // 48px touch target for accessibility
          aria-label={`Mark ${product.name} as ${product.isChecked ? 'uncollected' : 'collected'}`}
          sx={{
            // Story 4.3: Ensure minimum 44x44px touch target (NFR8.1)
            minWidth: 44,
            minHeight: 44,
            width: 48,
            height: 48,
            // Add margin to separate from content
            ml: 1,
          }}
        />
      )}

      {/* Story 4.1 AC2/AC3: Visual confirmation (snackbar) for check/uncheck actions */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ListItem>
  );
}
