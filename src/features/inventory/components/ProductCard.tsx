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
 * Story 11.4: Touch gesture detection to prevent accidental interactions during scroll
 * - Detects scroll vs tap by tracking touch movement
 * - Only triggers actions when not scrolling
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

  // Story 11.4: Touch gesture tracking to distinguish scroll from tap
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Story 7.1: Get gradient and border color based on stock level
  const gradient = getStockLevelGradient(product.stockLevel);
  const borderColor = getStockLevelBorderColor(product.stockLevel);
  const statusText = getStockLevelText(product.stockLevel);

  // Story 11.4: Touch start - record position
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
    setIsScrolling(false);
  }, []);

  // Story 11.4: Touch move - detect if scrolling
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const deltaX = Math.abs(e.touches[0].clientX - touchStart.x);
    const deltaY = Math.abs(e.touches[0].clientY - touchStart.y);

    // If moved more than 10px, consider it a scroll
    if (deltaX > 10 || deltaY > 10) {
      setIsScrolling(true);
    }
  }, [touchStart]);

  // Story 11.4: Touch end - reset scroll state after delay
  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    // Reset scrolling state after a short delay
    setTimeout(() => setIsScrolling(false), 100);
  }, []);

  // Long-press handler for edit
  const startPress = useCallback(() => {
    // Story 11.4: Don't start press timer if we're scrolling
    if (isScrolling) return;

    setIsLongPress(false);
    // Start timer for long press (0.8s)
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      // Provide haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 800);
  }, [isScrolling]);

  const cancelPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePressEnd = useCallback(async () => {
    cancelPress();
    // Story 11.4: Prevent action if we were scrolling
    if (isScrolling) {
      return;
    }

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
  }, [isLongPress, product, onEdit, onCycleStockLevel, cancelPress, isScrolling]);

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
      // Story 11.4: Use new touch handlers with scroll detection
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
