import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, List, SpeedDial, SpeedDialIcon, SpeedDialAction, Zoom } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
    if (isShoppingMode) {
      await endShoppingMode();
    } else {
      await startShoppingMode();
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

  // SpeedDial position - above BottomNav (which is typically 56-80px)
  const speedDialStyle = {
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
        {/* SpeedDial for Shopping List Actions */}
        <Zoom in>
          <SpeedDial
            ariaLabel="Shopping list actions"
            sx={speedDialStyle}
            icon={<SpeedDialIcon icon={<MoreVertIcon />} />}
          >
            <SpeedDialAction
              icon={<AddIcon />}
              tooltipTitle="Add Products"
              tooltipOpen
              onClick={handleOpenAddDialog}
            />
            <SpeedDialAction
              icon={isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
              tooltipTitle={isShoppingMode ? 'End Shopping Mode' : 'Start Shopping Mode'}
              tooltipOpen
              onClick={handleModeToggle}
            />
          </SpeedDial>
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
        {/* SpeedDial for Shopping List Actions */}
        <Zoom in>
          <SpeedDial
            ariaLabel="Shopping list actions"
            sx={speedDialStyle}
            icon={<SpeedDialIcon icon={<MoreVertIcon />} />}
          >
            <SpeedDialAction
              icon={<AddIcon />}
              tooltipTitle="Add Products"
              tooltipOpen
              onClick={handleOpenAddDialog}
            />
            <SpeedDialAction
              icon={isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
              tooltipTitle={isShoppingMode ? 'End Shopping Mode' : 'Start Shopping Mode'}
              tooltipOpen
              onClick={handleModeToggle}
            />
          </SpeedDial>
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
        {/* SpeedDial for Shopping List Actions */}
        <Zoom in>
          <SpeedDial
            ariaLabel="Shopping list actions"
            sx={speedDialStyle}
            icon={<SpeedDialIcon icon={<MoreVertIcon />} />}
          >
            <SpeedDialAction
              icon={<AddIcon />}
              tooltipTitle="Add Products"
              tooltipOpen
              onClick={handleOpenAddDialog}
            />
            <SpeedDialAction
              icon={isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
              tooltipTitle={isShoppingMode ? 'End Shopping Mode' : 'Start Shopping Mode'}
              tooltipOpen
              onClick={handleModeToggle}
            />
          </SpeedDial>
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
      {/* SpeedDial for Shopping List Actions */}
      <Zoom in>
        <SpeedDial
          ariaLabel="Shopping list actions"
          sx={speedDialStyle}
          icon={<SpeedDialIcon icon={<MoreVertIcon />} />}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="Add Products"
            tooltipOpen
            onClick={handleOpenAddDialog}
          />
          <SpeedDialAction
            icon={isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
            tooltipTitle={isShoppingMode ? 'End Shopping Mode' : 'Start Shopping Mode'}
            tooltipOpen
            onClick={handleModeToggle}
          />
        </SpeedDial>
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
