import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useInventory } from '@/features/inventory/context/InventoryContext';
import { ProductCard } from './ProductCard';
import { AddProductDialog } from './AddProductDialog';
import { EditProductDialog } from './EditProductDialog';
import { SearchFabRow } from './SearchFabRow';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Product } from '@/types/product';

const SNACKBAR_AUTO_HIDE_DURATION = 3000; // 3 seconds

/**
 * Improved InventoryList with better UX
 *
 * Key improvements:
 * - Enhanced empty state with better visual hierarchy
 * - Long-press to edit (no 3-dot menu)
 * - SearchFabRow at bottom (sticky above nav)
 * - ProductCard with tap-to-cycle and gradients
 */
export function InventoryList() {
  const { state, loadProducts, addProduct, updateProduct, deleteProduct, clearError, cycleStockLevel } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productBeingEdited, setProductBeingEdited] = useState<Product | null>(null);
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

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setEditDialogOpen(false);
      setProductBeingEdited(null);
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
      throw error;
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setProductBeingEdited(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Story 7.1: Handle tap-to-cycle stock level
  const handleCycleStockLevel = async (productId: string) => {
    try {
      await cycleStockLevel(productId);
    } catch {
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
      {/* Centered header with title and home icon */}
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
        <EmptyState
          title="Your inventory is empty"
          message="Start by adding your first product to track. You can add items manually or scan receipts."
          actionLabel="Add your first product"
          onAction={() => setDialogOpen(true)}
          icon={<InventoryIcon sx={{ fontSize: 40 }} />}
        />
      )}

      {/* Empty State - No search results */}
      {!state.loading && state.products.length > 0 && filteredProducts.length === 0 && searchTerm.trim() && (
        <EmptyState
          title="No products found"
          message={`We couldn't find any products matching "${searchTerm.trim()}"`}
          variant="search"
          icon={<SearchOffIcon sx={{ fontSize: 40 }} />}
        />
      )}

      {/* Product List with responsive grid layout */}
      {filteredProducts.length > 0 && (
        <Grid
          container
          role="region"
          aria-live="polite"
          aria-label="Product inventory"
          columns={{ xs: 1, md: 2 }}
          spacing={2}
          sx={{ px: { xs: 2, sm: 3 }, pb: 10 }}
        >
          {filteredProducts.map((product) => (
            <Grid key={product.id} size={{ xs: 12, md: 6 }}>
              <ProductCard
                product={product}
                onEdit={handleEditProduct}
                onCycleStockLevel={handleCycleStockLevel}
                onShoppingListChange={handleShoppingListChange}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* SearchFabRow - Sticky search + FAB row above bottom nav */}
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

      {/* Edit Product Dialog with delete capability */}
      <EditProductDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        onEdit={handleSaveEdit}
        onDelete={handleDeleteProduct}
        product={productBeingEdited}
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
