import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, List, Fab, Zoom } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AddIcon from '@mui/icons-material/Add';
import { useShoppingList } from '../context/ShoppingContext';
import { ShoppingListItem } from './ShoppingListItem';
import { ShoppingProgress } from './ShoppingProgress';
import { AddProductsDialog } from './AddProductsDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { FeatureErrorBoundary } from '@/components/shared/ErrorBoundary/FeatureErrorBoundary';
import { useInventory } from '@/features/inventory/context/InventoryContext';

function ShoppingListContent() {
  const { state, loadShoppingList, clearError, startShoppingMode, endShoppingMode, progress, addToList } = useShoppingList();
  const { state: inventoryState } = useInventory();
  const { items, loading, error, isShoppingMode } = state;
  const { products: allProducts } = inventoryState;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    loadShoppingList();

    // Refresh every 5 seconds to catch stock level changes from InventoryContext
    // TODO (Tech Debt #10): Replace polling with event-driven synchronization
    // See: docs/technical-debt.md - Issue #10
    const interval = setInterval(() => {
      loadShoppingList();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadShoppingList]);

  // Story 7.4: Compute products NOT on shopping list
  const availableProducts = useMemo(() => {
    const shoppingListProductIds = new Set(items.map((item) => item.id));
    return allProducts.filter((p) => !shoppingListProductIds.has(p.id));
  }, [allProducts, items]);

  // Story 4.4: Handle Shopping Mode toggle
  const handleModeToggle = async () => {
    setIsTransitioning(true);
    try {
      if (isShoppingMode) {
        await endShoppingMode();
      } else {
        await startShoppingMode();
      }
    } finally {
      setIsTransitioning(false);
    }
  };

  // Story 7.4: Open add products dialog
  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  // Story 7.4: Close add products dialog
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };

  // Story 7.4: Add product to shopping list
  const handleAddProduct = async (productId: string) => {
    await addToList(productId);
    // Refresh shopping list to show newly added product
    await loadShoppingList();
  };

  // Story 7.4: FAB position - above BottomNav (which is typically 56-80px)
  // Add products FAB on the left, Shopping Mode FAB on the right
  const addFabStyle = {
    position: 'fixed' as const,
    bottom: 80, // Above BottomNav
    left: 16,
    zIndex: 1000,
  };

  // Story 4.4: Shopping Mode FAB on the right
  const modeFabStyle = {
    position: 'fixed' as const,
    bottom: 80, // Above BottomNav
    right: 16,
    zIndex: 1000,
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6">Shopping List</Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
        {/* Story 7.4: Add products FAB (left) */}
        <Zoom in>
          <Fab
            color="success"
            onClick={handleOpenAddDialog}
            aria-label="Add products to shopping list"
            sx={addFabStyle}
          >
            <AddIcon />
          </Fab>
        </Zoom>
        {/* Story 4.4: Shopping Mode FAB (right) */}
        <Zoom in>
          <Fab
            color={isShoppingMode ? 'secondary' : 'primary'}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={modeFabStyle}
          >
            {isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
          </Fab>
        </Zoom>
        {/* Story 7.4: Add Products Dialog */}
        <AddProductsDialog
          open={addDialogOpen}
          onClose={handleCloseAddDialog}
          availableProducts={availableProducts}
          onAddProduct={handleAddProduct}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h6">Shopping List</Typography>
        <Alert severity="error" onClose={clearError}>
          {error}
        </Alert>
        {/* Story 7.4: Add products FAB (left) */}
        <Zoom in>
          <Fab
            color="success"
            onClick={handleOpenAddDialog}
            aria-label="Add products to shopping list"
            sx={addFabStyle}
          >
            <AddIcon />
          </Fab>
        </Zoom>
        {/* Story 4.4: Shopping Mode FAB (right) */}
        <Zoom in>
          <Fab
            color={isShoppingMode ? 'secondary' : 'primary'}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={modeFabStyle}
          >
            {isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
          </Fab>
        </Zoom>
        {/* Story 7.4: Add Products Dialog */}
        <AddProductsDialog
          open={addDialogOpen}
          onClose={handleCloseAddDialog}
          availableProducts={availableProducts}
          onAddProduct={handleAddProduct}
        />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box>
        <Typography variant="h6">Shopping List</Typography>
        <EmptyState
          title="Your shopping list is empty"
          message="Mark items as Low or Empty in inventory to auto-add them here"
        />
        {/* Story 7.4: Add products FAB (left) */}
        <Zoom in>
          <Fab
            color="success"
            onClick={handleOpenAddDialog}
            aria-label="Add products to shopping list"
            sx={addFabStyle}
          >
            <AddIcon />
          </Fab>
        </Zoom>
        {/* Story 4.4: Shopping Mode FAB (right) */}
        <Zoom in>
          <Fab
            color={isShoppingMode ? 'secondary' : 'primary'}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={modeFabStyle}
          >
            {isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
          </Fab>
        </Zoom>
        {/* Story 7.4: Add Products Dialog */}
        <AddProductsDialog
          open={addDialogOpen}
          onClose={handleCloseAddDialog}
          availableProducts={availableProducts}
          onAddProduct={handleAddProduct}
        />
      </Box>
    );
  }

  return (
    <Box pb={8} // Story 4.3: Extra padding to prevent FAB from covering last items
  >
      <Typography variant="h6" gutterBottom>
        Shopping List ({items.length})
      </Typography>
      {/* Story 4.2: Shopping Progress Indicator */}
      <ShoppingProgress checkedCount={progress.checkedCount} totalCount={progress.totalCount} />
      {/* Story 4.3: BottomNav clearance padding (80px = 10 MUI spacing units) */}
      <List sx={{ paddingBottom: 10 }}>
        {items.map((item) => (
          <ShoppingListItem key={item.id} product={item} isShoppingMode={isShoppingMode} />
        ))}
      </List>
      {/* Story 7.4: Add products FAB (left) */}
      <Zoom in>
        <Fab
          color="success"
          onClick={handleOpenAddDialog}
          aria-label="Add products to shopping list"
          sx={addFabStyle}
        >
          <AddIcon />
        </Fab>
      </Zoom>
      {/* Story 4.4: Shopping Mode FAB (right) */}
      <Zoom in>
        <Fab
          color={isShoppingMode ? 'secondary' : 'primary'}
          onClick={handleModeToggle}
          disabled={isTransitioning}
          aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
          sx={modeFabStyle}
        >
          {isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
        </Fab>
      </Zoom>
      {/* Story 7.4: Add Products Dialog */}
      <AddProductsDialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        availableProducts={availableProducts}
        onAddProduct={handleAddProduct}
      />
    </Box>
  );
}

export function ShoppingList() {
  return (
    <FeatureErrorBoundary featureName="Shopping List">
      <ShoppingListContent />
    </FeatureErrorBoundary>
  );
}
