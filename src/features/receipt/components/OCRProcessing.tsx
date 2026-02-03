import { Box, Stack, CircularProgress, Typography } from '@mui/material';
import { useReceiptContext } from '@/features/receipt/context/ReceiptContext';

/**
 * OCRProcessing Component
 *
 * Displays processing screen while OCR is running:
 * - Loading indicator (circular progress)
 * - Status message showing current processing state
 * - Optional receipt image preview in background
 *
 * Rendered when ocrState === 'processing'
 */
export function OCRProcessing() {
  const { state } = useReceiptContext();

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
        position: 'relative',
      }}
      aria-label="Processing receipt with OCR"
      role="status"
      aria-live="polite"
    >
      {/* Optional background preview of receipt */}
      {state.capturedImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url(${state.capturedImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}

      {/* Loading indicator and status message */}
      <Stack
        spacing={3}
        alignItems="center"
        sx={{ maxWidth: 400, textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        {/* Circular progress indicator */}
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: 'primary.main',
          }}
          aria-label="Loading OCR processing"
          aria-busy="true"
        />

        {/* Status message */}
        <Stack spacing={1} role="status" aria-live="polite">
          <Typography variant="h6" component="h2" id="ocr-status-title">
            Recognizing products...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we process your receipt
          </Typography>
        </Stack>

        {/* Progress indicator (if available) */}
        {state.processingProgress > 0 && state.processingProgress < 100 && (
          <Typography
            variant="caption"
            color="text.secondary"
            aria-live="polite"
            aria-atomic="true"
          >
            {Math.round(state.processingProgress)}% complete
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
