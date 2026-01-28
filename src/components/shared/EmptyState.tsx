import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  title?: string;
}

export function EmptyState({ message, icon, title }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      {icon && (
        <Box sx={{ mb: 2, opacity: 0.5 }}>
          {icon}
        </Box>
      )}
      {title && (
        <Typography variant="h6" color="text.primary" align="center" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" align="center">
        {message}
      </Typography>
    </Box>
  );
}
