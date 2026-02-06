/**
 * ReceiptReview Component (Story 5.3)
 *
 * Review screen for OCR results where users can:
 * - View all recognized products with confidence indicators
 * - Edit product names via tap-to-edit
 * - Add missing products
 * - Remove incorrectly recognized items
 * - Confirm and proceed to inventory update
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  List,
  Fab,
  Button,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import type { RecognizedProduct } from '@/features/receipt/types/receipt.types';

interface ReceiptReviewProps {
  products: RecognizedProduct[];
  onEditProduct: (id: string, newName: string) => void;
  onAddProduct: (name: string) => void;
  onRemoveProduct: (id: string) => void;
  onConfirm: () => void;
}

export const ReceiptReview: React.FC<ReceiptReviewProps> = ({
  products,
  onEditProduct,
  onAddProduct,
  onRemoveProduct,
  onConfirm,
}) => {
  const [editingProduct, setEditingProduct] = useState<RecognizedProduct | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [removingProduct, setRemovingProduct] = useState<RecognizedProduct | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addValue, setAddValue] = useState('');
  const [addError, setAddError] = useState('');

  const highConfidenceCount = products.filter(p => p.confidence >= 0.8).length;
  const totalCount = products.length;

  const handleEditProduct = useCallback((product: RecognizedProduct) => {
    setEditingProduct(product);
    setEditValue(product.name);
    setAddError('');
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingProduct && editValue.trim().length >= 2) {
      onEditProduct(editingProduct.id, editValue.trim());
      setEditingProduct(null);
      setEditValue('');
      setAddError('');
    } else {
      setAddError('Product name must be at least 2 characters');
    }
  }, [editingProduct, editValue, onEditProduct]);

  const handleAddProduct = useCallback(() => {
    if (addValue.trim().length >= 2) {
      onAddProduct(addValue.trim());
      setAddingProduct(false);
      setAddValue('');
      setAddError('');
    } else {
      setAddError('Product name must be at least 2 characters');
    }
  }, [addValue, onAddProduct]);

  const handleRemoveProduct = useCallback((product: RecognizedProduct) => {
    setRemovingProduct(product);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (removingProduct) {
      onRemoveProduct(removingProduct.id);
      setRemovingProduct(null);
    }
  }, [removingProduct, onRemoveProduct]);

  const getConfidenceIcon = useCallback((confidence: number) => {
    if (confidence >= 0.8) return <CheckCircleIcon color="success" />;
    if (confidence >= 0.5) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  }, []);

  const getBackgroundColor = useCallback((confidence: number) => {
    if (confidence < 0.5) return 'rgba(211, 47, 47, 0.08)'; // Red tint
    if (confidence < 0.8) return 'rgba(255, 152, 0, 0.08)'; // Orange tint
    return 'transparent';
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.paper',
      }}
    >
      {/* Summary Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" gutterBottom>
          {highConfidenceCount} of {totalCount} products recognized
        </Typography>
        <LinearProgress
          variant="determinate"
          value={totalCount > 0 ? (highConfidenceCount / totalCount) * 100 : 0}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Products List */}
      <List sx={{ flexGrow: 1, overflow: 'auto', p: 0, pb: 12 }}>
        {products.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No products recognized from receipt. Add products manually or try scanning again.
            </Typography>
          </Box>
        ) : (
          products.map(product => (
            <ListItem
              key={product.id}
              sx={{
                bgcolor: getBackgroundColor(product.confidence),
                minHeight: 64, // 44x44px touch target
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <ListItemButton
                onClick={() => handleEditProduct(product)}
                sx={{ minHeight: 64 }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {getConfidenceIcon(product.confidence)}
                </Box>
                <ListItemText
                  primary={product.name}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" component="span">
                        Confidence: {Math.round(product.confidence * 100)}%
                      </Typography>
                      {product.matchedProduct ? (
                        <Chip
                          size="small"
                          icon={<InventoryIcon sx={{ fontSize: 14 }} />}
                          label="In inventory"
                          color="primary"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          icon={<AddCircleIcon sx={{ fontSize: 14 }} />}
                          label="New"
                          color="info"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItemButton>
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveProduct(product);
                }}
                sx={{ ml: 1 }}
                aria-label={`Remove ${product.name}`}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Add Product FAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => {
          setAddingProduct(true);
          setAddValue('');
          setAddError('');
        }}
        aria-label="Add product"
      >
        <AddIcon />
      </Fab>

      {/* Confirm Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={products.length === 0}
          onClick={onConfirm}
          sx={{ height: 56 }}
        >
          Confirm & Update Inventory
        </Button>
      </Box>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editingProduct}
        onClose={() => {
          setEditingProduct(null);
          setEditValue('');
          setAddError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Product Name"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            error={!!addError}
            helperText={addError}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setEditValue('');
              setAddError('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog
        open={addingProduct}
        onClose={() => {
          setAddingProduct(false);
          setAddValue('');
          setAddError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Product Name"
            placeholder="Enter product name"
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            error={!!addError}
            helperText={addError || 'Product name from receipt that was missed'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddingProduct(false);
              setAddValue('');
              setAddError('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddProduct} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Product Confirmation Dialog */}
      <Dialog
        open={!!removingProduct}
        onClose={() => setRemovingProduct(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove Product?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove &quot;
            {removingProduct?.name}
            &quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemovingProduct(null)}>Cancel</Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
