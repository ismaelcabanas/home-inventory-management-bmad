import { useState, useCallback } from 'react';
import { ListItem, ListItemText, Chip, Checkbox, Box, Snackbar, Alert } from '@mui/material';
import { STOCK_LEVEL_CONFIG } from '@/features/inventory/components/stockLevelConfig';
import type { Product } from '@/types/product';
import { useShoppingList } from '@/features/shopping/context/ShoppingContext';

interface ShoppingListItemProps {
  product: Product;
}

export function ShoppingListItem({ product }: ShoppingListItemProps) {
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
    <ListItem>
      {/* Story 4.1: Checkbox positioned on left side (standard mobile pattern) */}
      <Checkbox
        checked={product.isChecked}
        onChange={handleCheckboxChange}
        size="medium" // 48px touch target for accessibility
        aria-label={`Mark ${product.name} as ${product.isChecked ? 'uncollected' : 'collected'}`}
        sx={{
          // Ensure sufficient touch target size
          width: 48,
          height: 48,
        }}
      />

      {/* Story 4.1: Conditional styling for checked items */}
      <Box
        sx={{
          textDecoration: product.isChecked ? 'line-through' : 'none',
          opacity: product.isChecked ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <ListItemText
          primary={product.name}
          secondary={
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
          }
        />
      </Box>

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
