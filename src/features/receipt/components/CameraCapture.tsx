import { useEffect, useRef } from 'react';
import { Box, Stack, Fab, CircularProgress, Alert, AlertTitle, Typography } from '@mui/material';
import { Camera as CameraIcon } from '@mui/icons-material';
import { useReceiptContext } from '@/features/receipt/context/ReceiptContext';

/**
 * CameraCapture Component
 *
 * Displays the live camera feed with:
 * - Video element showing camera stream
 * - Rectangular overlay guide for receipt positioning
 * - Real-time feedback messages
 * - Capture button for taking photos
 * - Loading state during initialization
 * - Error display with retry option
 */
export function CameraCapture() {
  const { state, capturePhoto, clearError } = useReceiptContext();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach stream to video element when available
  useEffect(() => {
    const video = videoRef.current;
    if (video && state.videoStream) {
      video.srcObject = state.videoStream;
    }
  }, [state.videoStream]);

  // Handle capture button press
  const handleCapture = async () => {
    try {
      await capturePhoto();
    } catch (error) {
      // Error is handled by context
      console.error('Capture failed:', error);
    }
  };

  // Handle retry after error
  const handleRetry = () => {
    clearError();
  };

  // Error state
  if (state.cameraState === 'error' && state.error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          p: 2,
        }}
      >
        <Alert
          severity="error"
          onClose={handleRetry}
          action={
            <Typography
              variant="button"
              onClick={handleRetry}
              sx={{ cursor: 'pointer', ml: 2 }}
            >
              Try Again
            </Typography>
          }
        >
          <AlertTitle>Camera Error</AlertTitle>
          {state.error}
        </Alert>
      </Box>
    );
  }

  // Loading state
  if (state.cameraState === 'requesting_permission' || !state.videoStream) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          Starting camera...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'black',
      }}
    >
      {/* Video element for live feed */}
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Overlay guide for receipt positioning */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '60%',
            border: '2px dashed rgba(255, 255, 255, 0.8)',
            borderRadius: 2,
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* Feedback message and capture button */}
      <Stack
        direction="column"
        alignItems="center"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 3,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          gap: 2,
        }}
      >
        {/* Feedback message */}
        {state.feedbackMessage && (
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              textAlign: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {state.feedbackMessage}
          </Typography>
        )}

        {/* Default guidance message */}
        {!state.feedbackMessage && (
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              textAlign: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            Position receipt in frame
          </Typography>
        )}

        {/* Capture button - minimum 48px for NFR8.1 */}
        <Fab
          color="primary"
          onClick={handleCapture}
          sx={{
            width: 72,
            height: 72,
            bgcolor: 'white',
            '&:hover': {
              bgcolor: 'grey.200',
            },
          }}
        >
          <CameraIcon sx={{ fontSize: 36, color: 'black' }} />
        </Fab>
      </Stack>
    </Box>
  );
}
