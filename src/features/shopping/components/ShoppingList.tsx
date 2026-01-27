import { useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, List } from '@mui/material';
import { useShoppingList } from '../context/ShoppingContext';
import { ShoppingListItem } from './ShoppingListItem';
import { EmptyState } from '@/components/shared/EmptyState';
import { FeatureErrorBoundary } from '@/components/shared/ErrorBoundary/FeatureErrorBoundary';

function ShoppingListContent() {
  const { state, loadShoppingList, clearError } = useShoppingList();
  const { items, loading, error } = state;

  useEffect(() => {
    loadShoppingList();

    // Refresh every 2 seconds to catch stock level changes from InventoryContext
    const interval = setInterval(() => {
      loadShoppingList();
    }, 2000);

    return () => clearInterval(interval);
  }, [loadShoppingList]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState message="Your shopping list is empty. Mark items as Low or Empty in inventory to auto-add them here." />
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Shopping List ({items.length})
      </Typography>
      <List>
        {items.map((item) => (
          <ShoppingListItem key={item.id} product={item} />
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
