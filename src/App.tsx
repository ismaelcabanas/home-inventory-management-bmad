import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from '@/theme/theme';
import { InventoryProvider } from '@/features/inventory/context/InventoryContext';
import { ShoppingProvider } from '@/features/shopping/context/ShoppingContext';
import { ReceiptProvider } from '@/features/receipt/context/ReceiptContext';
import { InventoryList } from '@/features/inventory/components/InventoryList';
import { ShoppingList } from '@/features/shopping/components/ShoppingList';
import { ReceiptScanner } from '@/features/receipt/components/ReceiptScanner';
import { FeatureErrorBoundary } from '@/components/shared/ErrorBoundary/FeatureErrorBoundary';
import { AppLayout } from '@/components/shared/Layout/AppLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <InventoryProvider>
          <ShoppingProvider>
            <ReceiptProvider>
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
                        <ShoppingList />
                      </FeatureErrorBoundary>
                    }
                  />

                  {/* Receipt Scanner Route */}
                  <Route
                    path="/scan"
                    element={
                      <FeatureErrorBoundary featureName="Receipt Scanner">
                        <ReceiptScanner />
                      </FeatureErrorBoundary>
                    }
                  />
                </Routes>
              </AppLayout>
            </ReceiptProvider>
          </ShoppingProvider>
        </InventoryProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
