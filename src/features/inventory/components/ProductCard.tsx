import { memo, useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Chip, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import type { Product, StockLevel } from '@/types/product';
import { StockLevelPicker } from '@/components/StockLevelPicker';
import { STOCK_LEVEL_CONFIG } from './stockLevelConfig';
import { useShoppingList } from '@/features/shopping/context/ShoppingContext';

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStockLevelChange?: (productId: string, stockLevel: StockLevel) => Promise<void>;
}

export const ProductCard = memo(function ProductCard({ product, onEdit, onDelete, onStockLevelChange }: ProductCardProps) {
  const [announceMessage, setAnnounceMessage] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Story 3.3: Manual shopping list management - get add/remove methods
  const { addToList, removeFromList } = useShoppingList();

  // Get stock level configuration for visual chip (Story 2.2)
  const stockConfig = STOCK_LEVEL_CONFIG[product.stockLevel];

  // Story 3.3: Handle shopping list toggle
  const handleShoppingListToggle = async () => {
    try {
      if (product.isOnShoppingList) {
        await removeFromList(product.id);
        setAnnounceMessage('Removed from shopping list');
        setSnackbarMessage('Removed from shopping list');
      } else {
        await addToList(product.id);
        setAnnounceMessage('Added to shopping list');
        setSnackbarMessage('Added to shopping list');
      }
      setSnackbarOpen(true);
      setTimeout(() => setAnnounceMessage(''), 2000);
    } catch {
      // Error handled by ShoppingContext (shows snackbar via error state)
      // Silently catch here to prevent unhandled rejection
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleStockLevelChange = async (newLevel: StockLevel) => {
    if (onStockLevelChange) {
      try {
        // Update ARIA live region for screen readers (H4)
        setAnnounceMessage(`Stock level changed to ${newLevel}`);
        setTimeout(() => setAnnounceMessage(''), 2000);

        await onStockLevelChange(product.id, newLevel);
      } catch {
        // Error handled by parent (InventoryList shows snackbar)
        // Silently catch here to prevent unhandled rejection
      }
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* ARIA live region for stock level change announcements (H4) */}
        <Box
          role="status"
          aria-live="polite"
          aria-atomic="true"
          sx={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {announceMessage}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Product name and actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Story 3.3: Shopping list toggle button */}
              <IconButton
                onClick={handleShoppingListToggle}
                aria-label={
                  product.isOnShoppingList
                    ? `Remove ${product.name} from shopping list`
                    : `Add ${product.name} to shopping list`
                }
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  color: product.isOnShoppingList ? 'warning.main' : 'action.active',
                }}
              >
                {product.isOnShoppingList ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
              </IconButton>
              <IconButton
                onClick={() => onEdit(product)}
                aria-label={`Edit ${product.name}`}
                sx={{ minWidth: 44, minHeight: 44 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => onDelete(product)}
                aria-label={`Delete ${product.name}`}
                sx={{ minWidth: 44, minHeight: 44, color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Story 2.2: Stock Level Visual Indicator Chip (AC1) */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Chip
              label={stockConfig.label}
              size="small"
              sx={{
                backgroundColor: stockConfig.chipColor,
                color: stockConfig.textColor,
                fontWeight: 'medium',
                fontSize: '14px',
              }}
            />
          </Box>

          {/* Stock level picker for changing stock level */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <StockLevelPicker
              currentLevel={product.stockLevel}
              onLevelChange={handleStockLevelChange}
              productId={product.id}
            />
          </Box>
        </Box>
      </CardContent>

      {/* Story 3.3: Confirmation snackbar for add/remove actions */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
});
