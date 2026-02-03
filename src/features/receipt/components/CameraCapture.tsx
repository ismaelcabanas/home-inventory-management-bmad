import { useEffect } from 'react';
import { Box, Stack, Fab, CircularProgress, Alert, AlertTitle, Typography, Chip, Badge } from '@mui/material';
import { Camera as CameraIcon, WifiOff, CloudQueue } from '@mui/icons-material';
import { useReceiptContext } from '@/features/receipt/context/ReceiptContext';
import { logger } from '@/utils/logger';

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
  const { state, capturePhoto, clearError, videoRef } = useReceiptContext();

  // Attach stream to video element when available
  useEffect(() => {
    const video = videoRef.current;
    if (video && state.videoStream) {
      video.srcObject = state.videoStream;
    }
  }, [state.videoStream, videoRef]);

  // Handle capture button press
  const handleCapture = async () => {
    try {
      await capturePhoto();
    } catch (error) {
      // Error is handled by context
      logger.error('Capture failed', error);
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
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'black',
        overflow: 'hidden',
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
          aria-label="Camera viewfinder for receipt scanning"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Story 5.4: Offline status indicator (top right) */}
      {!state.isOnline && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <Chip
            icon={<WifiOff />}
            label="Offline"
            color="warning"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 152, 0, 0.9)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
      )}

      {/* Story 5.4: Pending receipts indicator (top left) */}
      {state.pendingReceiptsCount > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
          }}
        >
          <Badge
            badgeContent={state.pendingReceiptsCount}
            color="secondary"
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: 'rgba(156, 39, 176, 0.9)',
              },
            }}
          >
            <Chip
              icon={<CloudQueue />}
              label="Queued"
              color="info"
              size="small"
              sx={{
                bgcolor: 'rgba(33, 150, 243, 0.9)',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Badge>
        </Box>
      )}

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
          aria-label="Capture photo"
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
