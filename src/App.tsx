import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { theme } from '@/theme/theme';
import { InventoryProvider } from '@/features/inventory/context/InventoryContext';
import { InventoryList } from '@/features/inventory/components/InventoryList';
import { FeatureErrorBoundary } from '@/components/shared/ErrorBoundary/FeatureErrorBoundary';
import { AppLayout } from '@/components/shared/Layout/AppLayout';

// Placeholder components for future features
const ShoppingListPlaceholder = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5">Shopping List</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Coming in Epic 3</Typography>
  </Box>
);

const ReceiptScannerPlaceholder = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5">Receipt Scanner</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Coming in Epic 5</Typography>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <InventoryProvider>
          <AppLayout>
            <Routes>
              {/* Home / Inventory Route */}
              <Route
                path="/"
                element={
                  <FeatureErrorBoundary featureName="Inventory">
                    <InventoryList />
                  </FeatureErrorBoundary>
                }
              />

              {/* Shopping List Route */}
              <Route
                path="/shopping"
                element={
                  <FeatureErrorBoundary featureName="Shopping List">
                    <ShoppingListPlaceholder />
                  </FeatureErrorBoundary>
                }
              />

              {/* Receipt Scanner Route */}
              <Route
                path="/scan"
                element={
                  <FeatureErrorBoundary featureName="Receipt Scanner">
                    <ReceiptScannerPlaceholder />
                  </FeatureErrorBoundary>
                }
              />
            </Routes>
          </AppLayout>
        </InventoryProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
