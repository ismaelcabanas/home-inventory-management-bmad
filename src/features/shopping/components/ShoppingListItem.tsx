import { useState, useCallback } from 'react';
import { Card, CardContent, Box, Checkbox, Snackbar, Alert, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getStockLevelGradient, getStockLevelBorderColor, getStockLevelText } from '@/utils/stockLevels';
import type { Product } from '@/types/product';
import { useShoppingList } from '@/features/shopping/context/ShoppingContext';

interface ShoppingListItemProps {
  product: Product;
  isShoppingMode: boolean; // Story 4.4: Shopping Mode state
}

export function ShoppingListItem({ product, isShoppingMode }: ShoppingListItemProps) {
  const { toggleItemChecked, removeFromList } = useShoppingList();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [removeSnackbarOpen, setRemoveSnackbarOpen] = useState(false);

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

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const handleRemove = useCallback(async () => {
    try {
      await removeFromList(product.id);
      setRemoveSnackbarOpen(true);
    } catch (error) {
      // Error is handled by the context
      console.error('Failed to remove item:', error);
    }
    handleMenuClose();
  }, [product.id, removeFromList, handleMenuClose]);

  const handleRemoveSnackbarClose = useCallback(() => {
    setRemoveSnackbarOpen(false);
  }, []);

  return (
    <>
      <Card
        sx={{
          background: getStockLevelGradient(product.stockLevel),
          borderLeft: `4px solid ${getStockLevelBorderColor(product.stockLevel)}`,
          margin: '0 12px 12px 12px', // 12px edge margins
          borderRadius: 1,
        }}
      >
        <CardContent sx={{ padding: '12px 16px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Story 4.1: Conditional styling for checked items */}
            <Box
              sx={{
                textDecoration: product.isChecked ? 'line-through' : 'none',
                opacity: product.isChecked ? 0.6 : 1,
                transition: 'all 0.2s ease-in-out',
                flex: 1, // Allow text to take available space
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Story 4.3: Minimum 16px font size for readability (NFR8) */}
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1rem', // 16px minimum for readability (NFR8)
                  fontWeight: 500, // Slightly bolder for high contrast (NFR8)
                }}
              >
                {product.name}
              </Typography>
              <Typography variant="body2">
                {getStockLevelText(product.stockLevel)}
              </Typography>
            </Box>

            {/* Checkbox and 3-dot menu container */}
            <Box display="flex" alignItems="center" gap={1}>
              {/* Story 4.4: Checkbox only visible when in Shopping Mode */}
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
                  }}
                />
              )}

              {/* Story 7.5: 3-dot menu for remove action */}
              <IconButton
                onClick={handleMenuOpen}
                aria-label="More options"
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Story 7.5: Menu for remove action */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRemove}>Remove from list</MenuItem>
      </Menu>

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

      {/* Story 7.5: Visual confirmation for remove action */}
      <Snackbar
        open={removeSnackbarOpen}
        autoHideDuration={2000}
        onClose={handleRemoveSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleRemoveSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {product.name} removed from list
        </Alert>
      </Snackbar>
    </>
  );
}
