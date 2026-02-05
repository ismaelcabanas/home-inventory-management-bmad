import { Box, Stack, Alert, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { RestartAlt, CameraAlt, ExpandMore } from '@mui/icons-material';
import { useReceiptContext } from '@/features/receipt/context/ReceiptContext';

/**
 * ReceiptError Component
 *
 * Displays OCR processing error with:
 * - Error alert with user-friendly message
 * - "Try Again" button to retry OCR
 * - "Cancel" button to return to camera
 * - Debug info section (development only)
 *
 * Rendered when ocrState === 'error'
 */
export function ReceiptError() {
  const { state, clearError, processReceiptWithOCR } = useReceiptContext();

  // Debug information
  const isDev = import.meta.env.DEV;
  const provider = import.meta.env.VITE_LLM_PROVIDER || 'openai';
  const hasApiKey = Boolean(import.meta.env.VITE_LLM_API_KEY);
  const apiKeyFormat = hasApiKey
    ? `${import.meta.env.VITE_LLM_API_KEY!.slice(0, 3)}...${import.meta.env.VITE_LLM_API_KEY!.slice(-4)}`
    : 'none';

  const handleTryAgain = async () => {
    if (!state.capturedImage) {
      return;
    }

    try {
      // Clear error and retry OCR processing
      clearError();
      await processReceiptWithOCR(state.capturedImage);
    } catch {
      // Error will be handled by context
    }
  };

  const handleCancel = () => {
    // Clear error and return to camera
    clearError();
  };

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
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 400, width: '100%' }}>
        {/* Error Alert */}
        <Alert
          severity="error"
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
          role="alert"
          aria-live="assertive"
        >
          <Stack spacing={1}>
            <Typography variant="body1" fontWeight="medium">
              {state.error || 'Failed to process receipt. Please try again.'}
            </Typography>
          </Stack>
        </Alert>

        {/* Debug Info Section (Development Only) */}
        {isDev && (
          <Accordion sx={{ width: '100%' }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="caption" color="text.secondary">
                🔍 Debug Information
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Typography variant="caption" component="div">
                  <strong>Provider:</strong> {provider}
                </Typography>
                <Typography variant="caption" component="div">
                  <strong>API Key:</strong> {hasApiKey ? apiKeyFormat : '❌ Missing'}
                </Typography>
                <Typography variant="caption" component="div">
                  <strong>Environment:</strong> {import.meta.env.MODE}
                </Typography>
                <Typography variant="caption" component="div">
                  <strong>Error:</strong> {state.error || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="error">
                  {!hasApiKey && (
                    <>
                      <strong>Action Required:</strong>{' '}
                      Set <code>VITE_LLM_API_KEY</code> environment variable in Vercel or local .env file.
                    </>
                  )}
                </Typography>
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Action buttons */}
        <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
          {/* Primary action - Try Again */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleTryAgain}
            startIcon={<RestartAlt />}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              minHeight: 48, // NFR8.1: minimum 44x44 pixels
            }}
          >
            Try Again
          </Button>

          {/* Secondary action - Cancel/Return to Camera */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCancel}
            startIcon={<CameraAlt />}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              minHeight: 48, // NFR8.1: minimum 44x44 pixels
            }}
          >
            Back to Camera
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
