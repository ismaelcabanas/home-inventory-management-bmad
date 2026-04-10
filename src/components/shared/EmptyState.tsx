import { Box, Typography, Button } from '@mui/material';
import { ReactNode } from 'react';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'default' | 'search';
}

/**
 * Improved EmptyState component based on modern UX best practices
 *
 * Design principles:
 * - Clear visual hierarchy: icon → headline → subtext → CTA
 * - Action-oriented with prominent button
 * - Context-aware messaging (default vs search)
 * - Proper accessibility (contrast, ARIA labels)
 *
 * Sources:
 * - https://www.eleken.co/blog-posts/empty-state-ux
 * - https://www.nngroup.com/articles/empty-state-interface-design/
 */
export function EmptyState({
  message,
  icon,
  title,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default',
}: EmptyStateProps) {
  // Default icons based on variant
  const defaultIcon = variant === 'search' ? <SearchOffIcon /> : <InboxIcon />;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh', // Better use of vertical space
        px: 3,
        py: 4,
        textAlign: 'center',
      }}
    >
      {/* Icon - larger and more prominent */}
      <Box
        sx={{
          mb: 3,
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: '50%',
          color: 'text.secondary',
        }}
      >
        <Box sx={{ fontSize: 40 }}>{icon || defaultIcon}</Box>
      </Box>

      {/* Title/headline - more prominent */}
      {title && (
        <Typography
          variant="h5"
          component="h2"
          color="text.primary"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          {title}
        </Typography>
      )}

      {/* Message/subtext - readable with good contrast */}
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: (actionLabel || secondaryActionLabel) ? 3 : 0, maxWidth: 400, lineHeight: 1.6 }}
      >
        {message}
      </Typography>

      {/* CTA button(s) - prominent and action-oriented */}
      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mt: 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {actionLabel && onAction && (
            <Button
              variant="contained"
              size="large"
              onClick={onAction}
              sx={{ minWidth: 200, py: 1.5 }}
              aria-label={actionLabel}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outlined"
              size="large"
              onClick={onSecondaryAction}
              sx={{ minWidth: 200, py: 1.5 }}
              aria-label={secondaryActionLabel}
              startIcon={<span>📷</span>}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </Box>
      ) : null}
    </Box>
  );
}
