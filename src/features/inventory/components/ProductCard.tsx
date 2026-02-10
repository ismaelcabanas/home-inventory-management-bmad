import { memo, useState } from 'react';
import { Card, Typography, Box, IconButton, Snackbar, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuIcon from '@mui/icons-material/Menu';
import type { Product } from '@/types/product';
import { useShoppingList } from '@/features/shopping/context/ShoppingContext';
import { getStockLevelGradient, getStockLevelBorderColor, getStockLevelText } from '@/utils/stockLevels';

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onShoppingListChange?: () => Promise<void>; // Story 3.3: Callback to refresh inventory after add/remove
  onCycleStockLevel?: (productId: string) => Promise<void>; // Story 7.1: Tap-to-cycle
}

/**
 * Story 7.1: Redesigned ProductCard with gradient backgrounds and tap-to-cycle interaction
 *
 * Key changes from previous version:
 * - Full-width card with gradient background based on stock level
 * - Tap-to-cycle stock level (tap anywhere on card except menu)
 * - Stock status text instead of chip
 * - 3-dot menu (⋮) for Edit/Delete access
 * - No visible stock level button grid
 */
export const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
  onShoppingListChange,
  onCycleStockLevel,
}: ProductCardProps) {
  const [announceMessage, setAnnounceMessage] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  // Story 3.3: Manual shopping list management - get add/remove methods
  const { addToList, removeFromList } = useShoppingList();

  // Story 7.1: Get gradient and border color based on stock level
  const gradient = getStockLevelGradient(product.stockLevel);
  const borderColor = getStockLevelBorderColor(product.stockLevel);
  const statusText = getStockLevelText(product.stockLevel);

  // Story 7.1: Handle card tap (excluding menu icon area)
  const handleCardClick = async () => {
    if (onCycleStockLevel) {
      try {
        // Update ARIA live region for screen readers
        setAnnounceMessage(`Stock level changed from ${product.stockLevel}`);
        setTimeout(() => setAnnounceMessage(''), 2000);

        await onCycleStockLevel(product.id);

        // Show subtle confirmation
        setSnackbarMessage('Stock level updated');
        setSnackbarOpen(true);
      } catch {
        // Error handled by parent (InventoryContext shows error)
        // Silently catch here to prevent unhandled rejection
      }
    }
  };

  // Story 3.3: Handle shopping list toggle
  const handleShoppingListToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card tap from triggering stock cycle
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

      // Refresh inventory to get updated isOnShoppingList value
      if (onShoppingListChange) {
        await onShoppingListChange();
      }
    } catch {
      // Error handled by ShoppingContext (shows snackbar via error state)
      // Silently catch here to prevent unhandled rejection
    }
  };

  // Story 7.1: Open action menu (prevents card tap)
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent card tap from triggering
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = () => {
    setMenuAnchorEl(null);
    onEdit(product);
  };

  const handleDeleteClick = () => {
    setMenuAnchorEl(null);
    onDelete(product);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        mx: 0, // Full width (12px margins handled by parent container)
        background: gradient,
        borderLeft: `4px solid ${borderColor}`,
        cursor: onCycleStockLevel ? 'pointer' : 'default',
        transition: 'background-color 0.2s ease-in-out',
        position: 'relative',
      }}
      onClick={handleCardClick}
      aria-label={`${product.name}, ${statusText}. Tap to cycle stock level.`}
    >
      {/* ARIA live region for screen readers */}
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

      {/* Story 7.1: Simplified card layout with product info and menu */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Product name and stock status */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body1"
            component="h2"
            sx={{
              fontWeight: 'medium',
              mb: 0.5,
              color: 'text.primary',
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {statusText}
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {/* Story 3.3: Shopping list toggle button */}
          <IconButton
            onClick={(e) => handleShoppingListToggle(e)}
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

          {/* Story 7.1: 3-dot menu icon (opens Edit/Delete options) */}
          <IconButton
            onClick={handleMenuOpen}
            aria-label={`Actions for ${product.name}`}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Story 7.1: Action menu (appears on 3-dot icon click) */}
      {/* Simplified inline menu for MVP - could use MUI Menu component for dropdown */}
      {menuAnchorEl && (
        <Box
          sx={{
            position: 'absolute',
            right: 8,
            top: 48,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()} // Prevent card tap when clicking menu
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            onClick={handleEditClick}
          >
            <EditIcon fontSize="small" />
            <Typography variant="body2">Edit</Typography>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              color: 'error.main',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            onClick={handleDeleteClick}
          >
            <DeleteIcon fontSize="small" />
            <Typography variant="body2">Delete</Typography>
          </Box>
        </Box>
      )}

      {/* Story 7.1: Confirmation snackbar for stock changes */}
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
    </Card>
  );
});
