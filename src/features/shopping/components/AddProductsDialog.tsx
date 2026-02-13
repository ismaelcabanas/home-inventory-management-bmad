import { memo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  IconButton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import type { Product } from '@/types/product';
import { getStockLevelText } from '@/utils/stockLevels';

export interface AddProductsDialogProps {
  open: boolean;
  onClose: () => void;
  availableProducts: Product[];
  onAddProduct: (productId: string) => Promise<void>;
}

/**
 * AddProductsDialog - Dialog for adding products to shopping list
 *
 * Shows products from inventory that are NOT already on the shopping list.
 * Users can tap products to add them, with visual feedback when added.
 */
export const AddProductsDialog = memo(function AddProductsDialog({
  open,
  onClose,
  availableProducts,
  onAddProduct,
}: AddProductsDialogProps) {
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

  // Reset added products when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setAddedProductIds(new Set());
    }
  }, [open]);

  const handleProductClick = async (productId: string) => {
    try {
      await onAddProduct(productId);
      setAddedProductIds((prev) => new Set(prev).add(productId));
    } catch {
      // Error handled by parent
    }
  };

  const isProductAdded = (productId: string) => addedProductIds.has(productId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="add-products-dialog-title"
      PaperProps={{
        sx: {
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle id="add-products-dialog-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Add Products to Shopping List</Typography>
          <IconButton edge="end" onClick={onClose} aria-label="Close dialog">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {availableProducts.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              All products are already on your shopping list
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {availableProducts.map((product) => {
              const added = isProductAdded(product.id);
              return (
                <ListItem
                  key={product.id}
                  disablePadding
                  secondaryAction={
                    added ? (
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <AddIcon sx={{ mr: 1, color: 'action.disabled' }} />
                    )
                  }
                >
                  <ListItemButton
                    onClick={() => handleProductClick(product.id)}
                    disabled={added}
                    aria-label={`Add ${product.name} to shopping list`}
                  >
                    <ListItemText
                      primary={product.name}
                      secondary={getStockLevelText(product.stockLevel)}
                      primaryTypographyProps={{
                        fontWeight: added ? 'medium' : 'regular',
                        color: added ? 'primary.main' : 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});
