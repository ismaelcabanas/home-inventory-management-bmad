import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, SpeedDial, SpeedDialIcon, SpeedDialAction, Zoom, Button, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useShoppingList } from '../context/ShoppingContext';
import { ShoppingListItem } from './ShoppingListItem';
import { ShoppingProgress } from './ShoppingProgress';
import { ShoppingCompletionDialog } from './ShoppingCompletionDialog';
import { ReceiptScanPromptDialog } from './ReceiptScanPromptDialog';
import { AddProductsDialog } from './AddProductsDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { FeatureErrorBoundary } from '@/components/shared/ErrorBoundary/FeatureErrorBoundary';
import { useInventory } from '@/features/inventory/context/InventoryContext';
import { eventBus, EVENTS } from '@/utils/eventBus';

function ShoppingListContent() {
  const navigate = useNavigate();
  const { state, loadShoppingList, clearError, startShoppingMode, endShoppingMode, progress, addToList } = useShoppingList();
  const { state: inventoryState } = useInventory();
  const { items, loading, error, isShoppingMode } = state;
  const { products: allProducts } = inventoryState;
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Story 9.2: Completion dialog state
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);

  // Story 9.3: Receipt scan prompt state
  const [receiptPromptOpen, setReceiptPromptOpen] = useState(false);

  useEffect(() => {
    // Initial load
    loadShoppingList();

    // Story 8.1: Event-driven synchronization (replaces polling)
    // Listen for product updates from InventoryContext
    eventBus.on(EVENTS.INVENTORY_PRODUCT_UPDATED, loadShoppingList);

    // Cleanup: remove event listener on unmount
    return () => {
      eventBus.off(EVENTS.INVENTORY_PRODUCT_UPDATED, loadShoppingList);
    };
  }, [loadShoppingList]);

  // Story 7.4: Compute products NOT on shopping list
  const availableProducts = useMemo(() => {
    const shoppingListProductIds = new Set(items.map((item) => item.id));
    return allProducts.filter((p) => !shoppingListProductIds.has(p.id));
  }, [allProducts, items]);

  // Story 9.2: Auto-prompt completion dialog when all items checked (AC4)
  useEffect(() => {
    // Auto-open completion dialog when all items are checked
    if (
      progress.checkedCount === progress.totalCount &&
      progress.totalCount > 0 &&
      !completionDialogOpen &&
      !receiptPromptOpen &&
      isShoppingMode
    ) {
      // Small delay to allow user to see the last checkmark
      const timer = setTimeout(() => {
        setCompletionDialogOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress.checkedCount, progress.totalCount, completionDialogOpen, receiptPromptOpen, isShoppingMode]);

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

  // Story 9.2: Open completion dialog
  const handleOpenCompletionDialog = () => {
    setCompletionDialogOpen(true);
  };

  // Story 9.3: Close receipt prompt handler
  const handleCloseReceiptPrompt = () => {
    setReceiptPromptOpen(false);
  };

  // Story 9.3: Navigate to scanner handler
  const handleNavigateToScanner = () => {
    setReceiptPromptOpen(false);
    navigate('/scan');
  };

  // Story 9.4: Handle Scan Receipt from SpeedDial (direct navigation, no prompt)
  const handleScanReceipt = () => {
    navigate('/scan');
  };

  // Story 9.2: Confirm completion - exits shopping mode
  const handleConfirmCompletion = async () => {
    await endShoppingMode();
    setCompletionDialogOpen(false);
    // Story 9.3: Open receipt scan prompt after completion
    setTimeout(() => {
      setReceiptPromptOpen(true);
    }, 100); // Small delay for smooth transition
  };

  // Story 9.2: Cancel completion - stays in shopping mode
  const handleCancelCompletion = () => {
    setCompletionDialogOpen(false);
    setReceiptPromptOpen(false); // Ensure receipt prompt is closed too
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
      <Box
        sx={{
          // Story 9.1: Subtle background change when in shopping mode
          bgcolor: isShoppingMode ? 'action.hover' : 'background.default',
          transition: 'background-color 0.3s ease',
          minHeight: '100vh',
        }}
      >
        {/* Story 7.5: Centered header with icon */}
        {/* Story 9.1: Enhanced header with dynamic title and exit button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
            position: 'relative',
          }}
        >
          <ShoppingCartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">{isShoppingMode ? 'Shopping Mode' : 'Shopping List'}</Typography>

          {/* Story 9.1: Exit button in shopping mode */}
          {/* Story 9.2: Now opens completion dialog */}
          {isShoppingMode && (
            <IconButton
              onClick={handleOpenCompletionDialog}
              sx={{ position: 'absolute', right: 16 }}
              aria-label="Exit shopping mode"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
        {/* SpeedDial for Shopping List Actions */}
        {/* Story 9.1: Removed Shopping Mode toggle - now a prominent button */}
        {/* Story 9.4: Added Scan Receipt action */}
        <Zoom in>
          <SpeedDial
            ariaLabel="Shopping list actions"
            sx={speedDialStyle}
            icon={<SpeedDialIcon icon={<MoreVertIcon />} />}
          >
            <SpeedDialAction
              icon={<AddIcon />}
              tooltipTitle="Add Products"
              onClick={handleOpenAddDialog}
            />
            <SpeedDialAction
              icon={<CameraAltIcon />}
              tooltipTitle="Scan Receipt"
              onClick={handleScanReceipt}
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
        {/* Story 9.2: Shopping Completion Dialog */}
        <ShoppingCompletionDialog
          open={completionDialogOpen}
          checkedCount={progress.checkedCount}
          totalCount={progress.totalCount}
          onConfirm={handleConfirmCompletion}
          onCancel={handleCancelCompletion}
        />
        {/* Story 9.3: Receipt Scan Prompt Dialog */}
        <ReceiptScanPromptDialog
          open={receiptPromptOpen}
          onScan={handleNavigateToScanner}
          onDefer={handleCloseReceiptPrompt}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          // Story 9.1: Subtle background change when in shopping mode
          bgcolor: isShoppingMode ? 'action.hover' : 'background.default',
          transition: 'background-color 0.3s ease',
          minHeight: '100vh',
        }}
      >
        {/* Story 7.5: Centered header with icon */}
        {/* Story 9.1: Enhanced header with dynamic title and exit button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
            position: 'relative',
          }}
        >
          <ShoppingCartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">{isShoppingMode ? 'Shopping Mode' : 'Shopping List'}</Typography>

          {/* Story 9.1: Exit button in shopping mode */}
          {/* Story 9.2: Now opens completion dialog */}
          {isShoppingMode && (
            <IconButton
              onClick={handleOpenCompletionDialog}
              sx={{ position: 'absolute', right: 16 }}
              aria-label="Exit shopping mode"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Alert severity="error" onClose={clearError}>
          {error}
        </Alert>
        {/* SpeedDial for Shopping List Actions */}
        {/* Story 9.1: Removed Shopping Mode toggle - now a prominent button */}
        {/* Story 9.4: Added Scan Receipt action */}
        <Zoom in>
          <SpeedDial
            ariaLabel="Shopping list actions"
            sx={speedDialStyle}
            icon={<SpeedDialIcon icon={<MoreVertIcon />} />}
          >
            <SpeedDialAction
              icon={<AddIcon />}
              tooltipTitle="Add Products"
              onClick={handleOpenAddDialog}
            />
            <SpeedDialAction
              icon={<CameraAltIcon />}
              tooltipTitle="Scan Receipt"
              onClick={handleScanReceipt}
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
        {/* Story 9.2: Shopping Completion Dialog */}
        <ShoppingCompletionDialog
          open={completionDialogOpen}
          checkedCount={progress.checkedCount}
          totalCount={progress.totalCount}
          onConfirm={handleConfirmCompletion}
          onCancel={handleCancelCompletion}
        />
        {/* Story 9.3: Receipt Scan Prompt Dialog */}
        <ReceiptScanPromptDialog
          open={receiptPromptOpen}
          onScan={handleNavigateToScanner}
          onDefer={handleCloseReceiptPrompt}
        />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        sx={{
          // Story 9.1: Subtle background change when in shopping mode
          bgcolor: isShoppingMode ? 'action.hover' : 'background.default',
          transition: 'background-color 0.3s ease',
          minHeight: '100vh',
        }}
      >
        {/* Story 7.5: Centered header with icon */}
        {/* Story 9.1: Enhanced header with dynamic title and exit button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
            position: 'relative',
          }}
        >
          <ShoppingCartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">{isShoppingMode ? 'Shopping Mode' : 'Shopping List'}</Typography>

          {/* Story 9.1: Exit button in shopping mode */}
          {/* Story 9.2: Now opens completion dialog */}
          {isShoppingMode && (
            <IconButton
              onClick={handleOpenCompletionDialog}
              sx={{ position: 'absolute', right: 16 }}
              aria-label="Exit shopping mode"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <EmptyState
          title="Your shopping list is empty"
          message="Mark items as Low or Empty in inventory to auto-add them here"
        />
        {/* SpeedDial for Shopping List Actions */}
        {/* Story 9.1: Removed Shopping Mode toggle - now a prominent button */}
        {/* Story 9.4: Added Scan Receipt action */}
        <Zoom in>
          <SpeedDial
            ariaLabel="Shopping list actions"
            sx={speedDialStyle}
            icon={<SpeedDialIcon icon={<MoreVertIcon />} />}
          >
            <SpeedDialAction
              icon={<AddIcon />}
              tooltipTitle="Add Products"
              onClick={handleOpenAddDialog}
            />
            <SpeedDialAction
              icon={<CameraAltIcon />}
              tooltipTitle="Scan Receipt"
              onClick={handleScanReceipt}
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
        {/* Story 9.2: Shopping Completion Dialog */}
        <ShoppingCompletionDialog
          open={completionDialogOpen}
          checkedCount={progress.checkedCount}
          totalCount={progress.totalCount}
          onConfirm={handleConfirmCompletion}
          onCancel={handleCancelCompletion}
        />
        {/* Story 9.3: Receipt Scan Prompt Dialog */}
        <ReceiptScanPromptDialog
          open={receiptPromptOpen}
          onScan={handleNavigateToScanner}
          onDefer={handleCloseReceiptPrompt}
        />
      </Box>
    );
  }

  return (
    <Box
      pb={8} // Story 4.3: Extra padding to prevent FAB from covering last items
      sx={{
        // Story 9.1: Subtle background change when in shopping mode
        bgcolor: isShoppingMode ? 'action.hover' : 'background.default',
        transition: 'background-color 0.3s ease',
        minHeight: '100vh',
      }}
    >
      {/* Story 7.5: Centered header with icon */}
      {/* Story 9.1: Enhanced header with dynamic title and exit button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 2,
          position: 'relative',
        }}
      >
        <ShoppingCartIcon sx={{ mr: 1 }} />
        <Typography variant="h6">{isShoppingMode ? 'Shopping Mode' : 'Shopping List'}</Typography>

        {/* Story 9.1: Exit button in shopping mode */}
        {/* Story 9.2: Now opens completion dialog */}
        {isShoppingMode && (
          <IconButton
            onClick={handleOpenCompletionDialog}
            sx={{ position: 'absolute', right: 16 }}
            aria-label="Exit shopping mode"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Story 9.1: Prominent Start/End Shopping button */}
      {!isShoppingMode && items.length > 0 && (
        <Box sx={{ px: 1.5, mb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={handleModeToggle}
            disabled={items.length === 0}
            sx={{ minHeight: 56, py: 1.5 }}
          >
            Start Shopping ({items.length} {items.length === 1 ? 'item' : 'items'})
          </Button>
        </Box>
      )}

      {/* Story 9.2: End Shopping button now opens completion dialog */}
      {isShoppingMode && (
        <Box sx={{ px: 1.5, mb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<CheckroomIcon />}
            onClick={handleOpenCompletionDialog}
            sx={{ minHeight: 56, py: 1.5 }}
          >
            End Shopping
          </Button>
        </Box>
      )}

      {/* Story 4.2: Shopping Progress Indicator */}
      <ShoppingProgress checkedCount={progress.checkedCount} totalCount={progress.totalCount} />
      {/* Story 7.5: Shopping list items with 12px margins */}
      <Box sx={{ px: 1.5 }}>
        {items.map((item) => (
          <ShoppingListItem key={item.id} product={item} isShoppingMode={isShoppingMode} />
        ))}
      </Box>
      {/* SpeedDial for Shopping List Actions */}
      {/* Story 9.1: Removed Shopping Mode toggle - now a prominent button */}
      {/* Story 9.4: Added Scan Receipt action */}
      <Zoom in>
        <SpeedDial
          ariaLabel="Shopping list actions"
          sx={speedDialStyle}
          icon={<SpeedDialIcon icon={<MoreVertIcon />} />}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="Add Products"
            onClick={handleOpenAddDialog}
          />
          <SpeedDialAction
            icon={<CameraAltIcon />}
            tooltipTitle="Scan Receipt"
            onClick={handleScanReceipt}
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
      {/* Story 9.2: Shopping Completion Dialog */}
      <ShoppingCompletionDialog
        open={completionDialogOpen}
        checkedCount={progress.checkedCount}
        totalCount={progress.totalCount}
        onConfirm={handleConfirmCompletion}
        onCancel={handleCancelCompletion}
      />
      {/* Story 9.3: Receipt Scan Prompt Dialog */}
      <ReceiptScanPromptDialog
        open={receiptPromptOpen}
        onScan={handleNavigateToScanner}
        onDefer={handleCloseReceiptPrompt}
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
