import { Box, Stack, Button, Typography, List, ListItem, ListItemText, Chip, Alert, CircularProgress, LinearProgress } from '@mui/material';
import { Receipt as ReceiptIcon, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useReceiptContext } from '@/features/receipt/context/ReceiptContext';
import { logger } from '@/utils/logger';
import { CameraCapture } from '@/features/receipt/components/CameraCapture';
import { ImagePreview } from '@/features/receipt/components/ImagePreview';
import { OCRProcessing } from '@/features/receipt/components/OCRProcessing';
import { ReceiptError } from '@/features/receipt/components/ReceiptError';
import { ReceiptReview } from '@/features/receipt/components/ReceiptReview'; // Story 5.3

/**
 * ReceiptScanner Component
 *
 * Main screen for the Receipt Scanner feature at /scan route.
 * Manages the complete camera capture flow:
 *
 * State Machine:
 * - idle: Shows "Scan Receipt" button with instructions
 * - capturing: Shows CameraCapture component
 * - preview: Shows ImagePreview component
 * - processing: Shows OCRProcessing component (OCR active)
 * - review: Shows ReceiptReview component (Story 5.3)
 * - completed: Shows inventory update processing/success (Story 6.1)
 * - error: Shows error message with retry option
 */
export function ReceiptScanner() {
  const navigate = useNavigate();
  const { state, requestCameraPermission, editProductName, addProduct, removeProduct, confirmReview, updateInventoryFromReceipt, clearError } = useReceiptContext();

  // Handle "Scan Receipt" button press
  const handleStartScanning = async () => {
    try {
      await requestCameraPermission();
    } catch (error) {
      // Error is handled by context
      logger.error('Failed to start camera', error);
    }
  };

  // Render different UI based on camera and OCR state
  // OCR state takes precedence when processing, completed, or error
  if (state.ocrState === 'processing') {
    return <OCRProcessing />;
  }

  if (state.ocrState === 'error') {
    return <ReceiptError />;
  }

  // Story 5.3: Show review screen when OCR completes and enters review state
  if (state.ocrState === 'review') {
    return (
      <ReceiptReview
        products={state.productsInReview}
        onEditProduct={(id, name) => {
          // Use setTimeout to avoid state update during render
          setTimeout(() => editProductName(id, name), 0);
        }}
        onAddProduct={(name) => {
          setTimeout(() => addProduct(name), 0);
        }}
        onRemoveProduct={(id) => {
          setTimeout(() => removeProduct(id), 0);
        }}
        onConfirm={async () => {
          // Story 6.1: Confirm review and trigger inventory update
          confirmReview();
          // Small delay to ensure state is updated before calling updateInventoryFromReceipt
          setTimeout(async () => {
            try {
              await updateInventoryFromReceipt();
            } catch (error) {
              logger.error('Inventory update failed', error);
            }
          }, 100);
        }}
      />
    );
  }

  if (state.ocrState === 'completed') {
    // Story 6.1: Show inventory update processing, success, or error
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          p: { xs: 2, sm: 3 },
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={3} alignItems="center" sx={{ maxWidth: 700, width: '100%', mt: { xs: 2, sm: 4 } }}>
          {/* Story 6.1: Show processing state */}
          {state.updatingInventory && (
            <>
              <CircularProgress size={64} />
              <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h1">
                  Updating inventory...
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Please wait while we update your inventory
                </Typography>
              </Stack>
              <LinearProgress sx={{ width: '100%', mt: 2 }} />
            </>
          )}

          {/* Story 6.1: Show error state */}
          {state.updateError && !state.updatingInventory && (
            <>
              <ErrorIcon
                sx={{
                  fontSize: { xs: 64, sm: 80 },
                  color: 'error.main',
                }}
              />
              <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h1">
                  Update Failed
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {state.updateError.message || 'Failed to update inventory. Please try again.'}
                </Typography>
              </Stack>
              <Alert severity="error" sx={{ width: '100%' }}>
                <Typography variant="body2">
                  An error occurred while updating your inventory. Your data has not been modified.
                </Typography>
              </Alert>
              <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={async () => {
                    clearError();
                    try {
                      await updateInventoryFromReceipt();
                    } catch (error) {
                      logger.error('Retry inventory update failed', error);
                    }
                  }}
                  fullWidth
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    clearError();
                    navigate('/inventory');
                  }}
                  fullWidth
                >
                  Go to Inventory
                </Button>
              </Stack>
            </>
          )}

          {/* Story 6.1: Show success state */}
          {!state.updatingInventory && !state.updateError && state.productsUpdated >= 0 && (
            <>
              <CheckCircle
                sx={{
                  fontSize: { xs: 64, sm: 80 },
                  color: 'success.main',
                }}
              />
              <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h1">
                  Inventory Updated!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {state.productsUpdated} product{state.productsUpdated !== 1 ? 's' : ''} replenished
                </Typography>
              </Stack>
              <Alert severity="success" sx={{ width: '100%' }}>
                <Typography variant="body2">
                  Your inventory has been updated with the products from your receipt. Purchased items have been removed from your shopping list.
                </Typography>
              </Alert>

              {/* Confirmed products summary */}
              {state.confirmedProducts.length > 0 && (
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ px: 1 }}>
                    Products Updated:
                  </Typography>
                  <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, maxHeight: { xs: 200, sm: 250 }, overflow: 'auto' }}>
                    {state.confirmedProducts.map((product) => (
                      <ListItem key={product.id} divider>
                        <ListItemText
                          primary={product.name}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Chip size="small" label="Stock: High" color="success" variant="outlined" />
                            </Stack>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/inventory')}
                fullWidth
                sx={{ minHeight: 48 }}
              >
                View Inventory
              </Button>
            </>
          )}
        </Stack>
      </Box>
    );
  }

  // Otherwise render based on camera state
  switch (state.cameraState) {
    case 'idle':
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'background.default',
          }}
        >
          <Stack spacing={4} alignItems="center" sx={{ maxWidth: 400, textAlign: 'center' }}>
            {/* Receipt/Scanner icon illustration */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ReceiptIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            </Box>

            {/* Instructions */}
            <Stack spacing={1}>
              <Typography variant="h5" component="h1">
                Receipt Scanner
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Take a photo of your receipt to update inventory
              </Typography>
            </Stack>

            {/* API Key Configuration Warning */}
            {!state.isOCRConfigured && (
              <Alert
                severity="warning"
                sx={{ width: '100%' }}
                role="alert"
                aria-live="polite"
              >
                <Typography variant="body2" fontWeight="medium">
                  LLM API key not configured
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  For local development: Set <code>VITE_LLM_API_KEY</code> in your .env file.
                  For Vercel: Add it in Project Settings → Environment Variables.
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Get your API key from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a>
                </Typography>
              </Alert>
            )}

            {/* "Scan Receipt" button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleStartScanning}
              fullWidth
              disabled={!state.isOCRConfigured}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                minHeight: 48, // NFR8.1: minimum 44x44 pixels
              }}
            >
              Scan Receipt
            </Button>
          </Stack>
        </Box>
      );

    case 'requesting_permission':
    case 'capturing':
      return <CameraCapture />;

    case 'preview':
      return <ImagePreview />;

    case 'error':
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <CameraCapture />
        </Box>
      );

    default:
      return null;
  }
}
