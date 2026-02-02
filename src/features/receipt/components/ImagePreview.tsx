import { Box, Stack, Button } from '@mui/material';
import { useReceiptContext } from '@/features/receipt/context/ReceiptContext';
import { logger } from '@/utils/logger';

/**
 * ImagePreview Component
 *
 * Displays the captured photo for confirmation with:
 * - Captured image preview
 * - "Use This Photo" button (primary action) - triggers OCR processing
 * - "Retake" button (secondary action)
 */
export function ImagePreview() {
  const { state, retakePhoto, processReceiptWithOCR, usePhoto: acceptPhoto } = useReceiptContext();

  const handleUsePhoto = async () => {
    try {
      if (!state.capturedImage) {
        throw new Error('No captured image to process');
      }

      logger.debug('User confirmed photo, starting OCR processing');

      // Stop camera first (synchronous action)
      acceptPhoto();

      // Then trigger OCR processing
      await processReceiptWithOCR(state.capturedImage);
    } catch (error) {
      logger.error('Failed to process receipt with OCR', error);
      // Error is handled by context state
    }
  };

  const handleRetake = () => {
    retakePhoto();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 2,
        bgcolor: 'black',
      }}
    >
      {/* Captured image display */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 2,
          mb: 2,
        }}
      >
        {state.capturedImage && (
          <img
            src={state.capturedImage}
            alt="Captured receipt"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </Box>

      {/* Action buttons */}
      <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
        {/* Primary action - Use This Photo */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUsePhoto}
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            minHeight: 48, // NFR8.1: minimum 44x44 pixels
          }}
        >
          Use This Photo
        </Button>

        {/* Secondary action - Retake */}
        <Button
          variant="outlined"
          color="primary"
          onClick={handleRetake}
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            minHeight: 48, // NFR8.1: minimum 44x44 pixels
            borderColor: 'white',
            color: 'white',
            '&:hover': {
              borderColor: 'grey.300',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Retake
        </Button>
      </Stack>
    </Box>
  );
}
