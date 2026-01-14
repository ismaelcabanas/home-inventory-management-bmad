import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useInventory } from '@/features/inventory/context/InventoryContext';
import { ProductCard } from './ProductCard';
import { AddProductDialog } from './AddProductDialog';
import { EditProductDialog } from './EditProductDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Product } from '@/types/product';

const SNACKBAR_AUTO_HIDE_DURATION = 3000; // 3 seconds

export function InventoryList() {
  const { state, loadProducts, addProduct, updateProduct, deleteProduct, clearError } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productBeingEdited, setProductBeingEdited] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productBeingDeleted, setProductBeingDeleted] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddProduct = async (name: string) => {
    try {
      await addProduct(name);
      setSnackbar({
        open: true,
        message: 'Product added successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to add product',
        severity: 'error',
      });
      throw error; // Re-throw to prevent dialog close
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductBeingEdited(product);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (id: string, name: string) => {
    try {
      clearError(); // Clear any previous error state
      await updateProduct(id, { name });
      setSnackbar({
        open: true,
        message: 'Product updated successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update product',
        severity: 'error',
      });
      throw error; // Re-throw to prevent dialog close
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setProductBeingEdited(null);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductBeingDeleted(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productBeingDeleted) return;

    try {
      await deleteProduct(productBeingDeleted.id);
      setSnackbar({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to delete product',
        severity: 'error',
      });
      throw error; // Re-throw to prevent dialog close
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductBeingDeleted(null);
    // Don't clear snackbar here - let it auto-hide after showing success/error
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Inventory
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Product
        </Button>
      </Box>

      {/* Error Alert */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {/* Loading State */}
      {state.loading && state.products.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!state.loading && state.products.length === 0 && (
        <EmptyState message="No products yet. Add your first product!" />
      )}

      {/* Product List */}
      {state.products.length > 0 && (
        <Box role="region" aria-live="polite" aria-label="Product inventory">
          {state.products.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
          ))}
        </Box>
      )}

      {/* Add Product Dialog */}
      <AddProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddProduct}
      />

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        onEdit={handleSaveEdit}
        product={productBeingEdited}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        productName={productBeingDeleted?.name || ''}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
