import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, List, Fab, Zoom } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { useShoppingList } from '../context/ShoppingContext';
import { ShoppingListItem } from './ShoppingListItem';
import { ShoppingProgress } from './ShoppingProgress';
import { EmptyState } from '@/components/shared/EmptyState';
import { FeatureErrorBoundary } from '@/components/shared/ErrorBoundary/FeatureErrorBoundary';

function ShoppingListContent() {
  const { state, loadShoppingList, clearError, startShoppingMode, endShoppingMode, progress } = useShoppingList();
  const { items, loading, error, isShoppingMode } = state;
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Story 4.4: FAB position - above BottomNav (which is typically 56-80px)
  const fabStyle = {
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
        {/* Story 4.4: FAB always visible */}
        <Zoom in>
          <Fab
            color={isShoppingMode ? 'secondary' : 'primary'}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={fabStyle}
          >
            {isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
          </Fab>
        </Zoom>
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
        {/* Story 4.4: FAB always visible */}
        <Zoom in>
          <Fab
            color={isShoppingMode ? 'secondary' : 'primary'}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={fabStyle}
          >
            {isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
          </Fab>
        </Zoom>
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
        {/* Story 4.4: FAB always visible */}
        <Zoom in>
          <Fab
            color={isShoppingMode ? 'secondary' : 'primary'}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={fabStyle}
          >
            {isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
          </Fab>
        </Zoom>
      </Box>
    );
  }

  return (
    <Box pb={8} // Padding at bottom so items aren't covered by FAB
>
      <Typography variant="h6" gutterBottom>
        Shopping List ({items.length})
      </Typography>
      {/* Story 4.2: Shopping Progress Indicator */}
      <ShoppingProgress checkedCount={progress.checkedCount} totalCount={progress.totalCount} />
      <List>
        {items.map((item) => (
          <ShoppingListItem key={item.id} product={item} isShoppingMode={isShoppingMode} />
        ))}
      </List>
      {/* Story 4.4: FAB for Shopping Mode toggle */}
      <Zoom in>
        <Fab
          color={isShoppingMode ? 'secondary' : 'primary'}
          onClick={handleModeToggle}
          disabled={isTransitioning}
          aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
          sx={fabStyle}
        >
          {isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
        </Fab>
      </Zoom>
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
