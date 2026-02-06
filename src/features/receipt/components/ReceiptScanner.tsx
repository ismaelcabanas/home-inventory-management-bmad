import { Box, Stack, Button, Typography, List, ListItem, ListItemText, Chip, Alert } from '@mui/material';
import { Receipt as ReceiptIcon, CheckCircle } from '@mui/icons-material';
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
 * - completed: Shows completion screen with recognized products (for Story 5.3)
 * - error: Shows error message with retry option
 */
export function ReceiptScanner() {
  const { state, requestCameraPermission, editProductName, addProduct, removeProduct, confirmReview } = useReceiptContext();

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
        onConfirm={() => {
          setTimeout(() => confirmReview(), 0);
        }}
      />
    );
  }

  if (state.ocrState === 'completed') {
    // Story 5.3: After user confirms review, show final completion screen
    // This is the state after confirmReview() is called
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
        <Stack spacing={3} alignItems="center" sx={{ maxWidth: 500, width: '100%' }}>
          {/* Success icon */}
          <CheckCircle
            sx={{
              fontSize: 80,
              color: 'success.main',
            }}
          />

          {/* Success message */}
          <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
            <Typography variant="h5" component="h1">
              Review Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {state.confirmedProducts.length} product{state.confirmedProducts.length !== 1 ? 's' : ''} ready to update inventory
            </Typography>
          </Stack>

          {/* Confirmed products list */}
          {state.confirmedProducts.length > 0 ? (
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Confirmed Products:
              </Typography>
              <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                {state.confirmedProducts.map((product) => (
                  <ListItem key={product.id} divider>
                    <ListItemText
                      primary={product.name}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label="Confirmed"
                            color="success"
                          />
                          {product.matchedProduct && (
                            <Chip size="small" label="In inventory" color="primary" variant="outlined" />
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', p: 3, bgcolor: 'warning.lighter', borderRadius: 1 }}>
              <Typography variant="body1" color="text.warning.dark" gutterBottom>
                No products to update
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All products were removed during review, or OCR found no products.
              </Typography>
            </Box>
          )}

          {/* Note about next step */}
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Inventory update will be available in Epic 6
            </Typography>
          </Box>
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
