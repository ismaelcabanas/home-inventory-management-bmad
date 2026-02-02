import { Box, Stack, Button, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { Receipt as ReceiptIcon, CheckCircle, ArrowForward } from '@mui/icons-material';
import { useReceiptContext } from '@/features/receipt/context/ReceiptContext';
import { logger } from '@/utils/logger';
import { CameraCapture } from '@/features/receipt/components/CameraCapture';
import { ImagePreview } from '@/features/receipt/components/ImagePreview';
import { OCRProcessing } from '@/features/receipt/components/OCRProcessing';
import { ReceiptError } from '@/features/receipt/components/ReceiptError';

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
  const { state, requestCameraPermission } = useReceiptContext();

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

  if (state.ocrState === 'completed') {
    // AC5: Show completion screen with recognized products
    // Navigation to Review screen will happen in Story 5.3
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
              Receipt Processed!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Found {state.recognizedProducts.length} product{state.recognizedProducts.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>

          {/* Recognized products list */}
          {state.recognizedProducts.length > 0 && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recognized Products:
              </Typography>
              <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                {state.recognizedProducts.map((product) => (
                  <ListItem key={product.id} divider>
                    <ListItemText
                      primary={product.name}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={`${Math.round(product.confidence * 100)}% confidence`}
                            color={
                              product.confidence >= 0.9 ? 'success' :
                              product.confidence >= 0.7 ? 'warning' :
                              'default'
                            }
                          />
                          {product.matchedProduct && (
                            <Chip size="small" label="Matched" color="primary" variant="outlined" />
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Note about next step */}
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Review and correction screen coming in Story 5.3
            </Typography>
          </Box>

          {/* Continue button (placeholder for Story 5.3) */}
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForward />}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              minHeight: 48, // NFR8.1: minimum 44x44 pixels
            }}
          >
            Continue to Review
          </Button>
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

            {/* "Scan Receipt" button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleStartScanning}
              fullWidth
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
