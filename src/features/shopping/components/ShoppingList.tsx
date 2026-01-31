import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, List, Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { useShoppingList } from '../context/ShoppingContext';
import { ShoppingListItem } from './ShoppingListItem';
import { EmptyState } from '@/components/shared/EmptyState';
import { FeatureErrorBoundary } from '@/components/shared/ErrorBoundary/FeatureErrorBoundary';

function ShoppingListContent() {
  const { state, loadShoppingList, clearError, startShoppingMode, endShoppingMode } = useShoppingList();
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

  if (loading) {
    return (
      <Box>
        {/* Story 4.4: Shopping Mode toggle always visible */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant={isShoppingMode ? 'outlined' : 'contained'}
            color={isShoppingMode ? 'secondary' : 'primary'}
            fullWidth
            size="large"
            startIcon={isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={{
              minHeight: 48,
              py: 1.5,
            }}
          >
            {isShoppingMode ? 'Finish Shopping' : 'Start Shopping'}
          </Button>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        {/* Story 4.4: Shopping Mode toggle always visible */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant={isShoppingMode ? 'outlined' : 'contained'}
            color={isShoppingMode ? 'secondary' : 'primary'}
            fullWidth
            size="large"
            startIcon={isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={{
              minHeight: 48,
              py: 1.5,
            }}
          >
            {isShoppingMode ? 'Finish Shopping' : 'Start Shopping'}
          </Button>
        </Box>
        <Alert severity="error" onClose={clearError}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box>
        {/* Story 4.4: Shopping Mode toggle always visible */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant={isShoppingMode ? 'outlined' : 'contained'}
            color={isShoppingMode ? 'secondary' : 'primary'}
            fullWidth
            size="large"
            startIcon={isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
            onClick={handleModeToggle}
            disabled={isTransitioning}
            aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
            sx={{
              minHeight: 48,
              py: 1.5,
            }}
          >
            {isShoppingMode ? 'Finish Shopping' : 'Start Shopping'}
          </Button>
        </Box>
        <EmptyState
          title="Your shopping list is empty"
          message="Mark items as Low or Empty in inventory to auto-add them here"
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Story 4.4: Shopping Mode Toggle Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant={isShoppingMode ? 'outlined' : 'contained'}
          color={isShoppingMode ? 'secondary' : 'primary'}
          fullWidth
          size="large"
          startIcon={isShoppingMode ? <CheckroomIcon /> : <ShoppingCartIcon />}
          onClick={handleModeToggle}
          disabled={isTransitioning}
          aria-label={isShoppingMode ? 'End shopping mode' : 'Start shopping mode'}
          sx={{
            minHeight: 48, // 48px minimum touch target (NFR8.1)
            py: 1.5, // Extra padding for better touch target
          }}
        >
          {isShoppingMode ? 'Finish Shopping' : 'Start Shopping'}
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Shopping List ({items.length})
      </Typography>
      <List>
        {items.map((item) => (
          <ShoppingListItem key={item.id} product={item} isShoppingMode={isShoppingMode} />
        ))}
      </List>
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
