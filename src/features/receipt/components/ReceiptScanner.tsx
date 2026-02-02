import { Box, Stack, Button, Typography } from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { useReceiptContext } from '@/features/receipt/context/ReceiptContext';
import { logger } from '@/utils/logger';
import { CameraCapture } from '@/features/receipt/components/CameraCapture';
import { ImagePreview } from '@/features/receipt/components/ImagePreview';

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

  // Render different UI based on camera state
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
