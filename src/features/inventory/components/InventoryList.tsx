import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import { useInventory } from '@/features/inventory/context/InventoryContext';
import { ProductCard } from './ProductCard';
import { AddProductDialog } from './AddProductDialog';
import { EditProductDialog } from './EditProductDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { SearchFabRow } from './SearchFabRow';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Product } from '@/types/product';

const SNACKBAR_AUTO_HIDE_DURATION = 3000; // 3 seconds

/**
 * Story 7.1: Redesigned InventoryList with new layout
 *
 * Key changes:
 * - Centered header with home icon (🏠)
 * - 12px edge margins for full-width cards
 * - SearchFabRow at bottom (sticky above nav)
 * - ProductCard with tap-to-cycle and gradients
 */
export function InventoryList() {
  const { state, loadProducts, addProduct, updateProduct, deleteProduct, clearError, cycleStockLevel } = useInventory();
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      return state.products;
    }

    const lowerSearch = trimmedSearch.toLowerCase();
    return state.products.filter(product =>
      product.name.toLowerCase().includes(lowerSearch)
    );
  }, [state.products, searchTerm]);

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
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Story 7.1: Handle tap-to-cycle stock level
  const handleCycleStockLevel = async (productId: string) => {
    try {
      await cycleStockLevel(productId);
    } catch (_error) {
      // Error already handled by InventoryContext
      // Silently catch here - error state will be displayed
    }
  };

  // Story 3.3: Refresh inventory after shopping list add/remove operations
  const handleShoppingListChange = async () => {
    try {
      await loadProducts();
    } catch {
      // Error already handled by InventoryContext
    }
  };

  return (
    <Box sx={{ pb: 10 }}> {/* Bottom padding to account for sticky SearchFabRow + BottomNav */}
      {/* Story 7.1 AC1: Centered header with title and home icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          py: 2,
          px: 1.5, // 12px
        }}
      >
        <HomeIcon sx={{ fontSize: 28 }} />
        <Typography variant="h5" component="h1">
          Inventory
        </Typography>
      </Box>

      {/* Error Alert */}
      {state.error && (
        <Alert severity="error" sx={{ mx: 1.5, mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {/* Loading State */}
      {state.loading && state.products.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State - No products at all */}
      {!state.loading && state.products.length === 0 && (
        <Box sx={{ px: 1.5 }}>
          <EmptyState message="No products yet. Add your first product!" />
          {/* Show centered Add button when no products */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              size="large"
            >
              Add Product
            </Button>
          </Box>
        </Box>
      )}

      {/* Empty State - No search results */}
      {!state.loading && state.products.length > 0 && filteredProducts.length === 0 && searchTerm.trim() && (
        <Box sx={{ px: 1.5 }}>
          <EmptyState message={`No products found matching "${searchTerm.trim()}"`} />
        </Box>
      )}

      {/* Story 7.1 AC2: Product List with full-width cards (12px edge margins) */}
      {filteredProducts.length > 0 && (
        <Box
          role="region"
          aria-live="polite"
          aria-label="Product inventory"
          sx={{ px: 1.5 }} // 12px edge margins
        >
          <Stack spacing={1.5}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onCycleStockLevel={handleCycleStockLevel}
                onShoppingListChange={handleShoppingListChange}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Story 7.1 AC6: SearchFabRow - Sticky search + FAB row above bottom nav */}
      {state.products.length > 0 && (
        <SearchFabRow
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddProduct={() => setDialogOpen(true)}
          hasProducts={state.products.length > 0}
        />
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
    </Box>
  );
}
