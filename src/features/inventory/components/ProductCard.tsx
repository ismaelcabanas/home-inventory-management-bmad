import { memo, useState, useRef, useCallback } from 'react';
import { Card, Typography, Box, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { Product } from '@/types/product';
import { getStockLevelGradient, getStockLevelBorderColor, getStockLevelText } from '@/utils/stockLevels';

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onCycleStockLevel?: (productId: string) => Promise<void>; // Story 7.1: Tap-to-cycle
}

/**
 * ProductCard with improved UX interactions
 *
 * Interaction design:
 * - Short tap: Cycle stock level (high → medium → low → empty → high)
 * - Long press (0.8s): Open edit modal
 *
 * Based on mobile UX best practices for intuitive gestures.
 */
export const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onCycleStockLevel,
}: ProductCardProps) {
  const [announceMessage, setAnnounceMessage] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLongPress, setIsLongPress] = useState(false);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Story 7.1: Get gradient and border color based on stock level
  const gradient = getStockLevelGradient(product.stockLevel);
  const borderColor = getStockLevelBorderColor(product.stockLevel);
  const statusText = getStockLevelText(product.stockLevel);

  // Long-press handler for edit
  const startPress = useCallback(() => {
    setIsLongPress(false);
    // Start timer for long press (0.8s)
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      // Provide haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 800);
  }, []);

  const cancelPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePressEnd = useCallback(async () => {
    cancelPress();
    if (isLongPress) {
      // Long press detected - open edit modal
      onEdit(product);
    } else if (onCycleStockLevel) {
      // Short tap - cycle stock level
      try {
        setAnnounceMessage(`Stock level changed from ${product.stockLevel}`);
        setTimeout(() => setAnnounceMessage(''), 2000);

        await onCycleStockLevel(product.id);

        setSnackbarMessage('Stock level updated');
        setSnackbarOpen(true);
      } catch {
        // Error handled by parent
      }
    }
    setIsLongPress(false);
  }, [isLongPress, product, onEdit, onCycleStockLevel, cancelPress]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        mx: 0,
        width: '100%',
        background: gradient,
        borderLeft: `4px solid ${borderColor}`,
        cursor: onCycleStockLevel ? 'pointer' : 'default',
        transition: 'background-color 0.2s ease-in-out, transform 0.1s',
        position: 'relative',
        userSelect: 'none',
        // Visual feedback on long press
        ...(isLongPress && {
          transform: 'scale(0.98)',
          boxShadow: 4,
        }),
      }}
      onTouchStart={startPress}
      onTouchEnd={handlePressEnd}
      onMouseDown={startPress}
      onMouseUp={handlePressEnd}
      onMouseLeave={cancelPress}
      aria-label={`${product.name}, ${statusText}. ${onCycleStockLevel ? 'Tap to cycle stock level. Long press to edit.' : 'Long press to edit.'}`}
    >
      {/* ARIA live region for screen readers */}
      <Box
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {announceMessage}
      </Box>

      {/* Edit hint shown on long press */}
      {isLongPress && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 10,
            animation: 'fadeIn 0.2s ease-in-out',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
          <EditIcon color="primary" />
          <Typography variant="body2" fontWeight="medium">
            Edit
          </Typography>
        </Box>
      )}

      {/* Card content */}
      <Box sx={{ p: 2 }}>
        {/* Product name and stock status */}
        <Box>
          <Typography
            variant="body1"
            component="h2"
            sx={{
              fontWeight: 'medium',
              mb: 0.5,
              color: 'text.primary',
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {statusText}
          </Typography>
        </Box>
      </Box>

      {/* Confirmation snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
});
