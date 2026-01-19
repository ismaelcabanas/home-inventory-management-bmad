import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface Props {
  children: ReactNode;
}

/**
 * Main application layout with bottom navigation.
 * Provides consistent spacing and structure across all routes.
 */
export function AppLayout({ children }: Props) {
  return (
    <Box sx={{ pb: 7 }}> {/* Padding bottom to prevent overlap with BottomNav */}
      <Box component="main" sx={{ minHeight: 'calc(100vh - 56px)' }}>
        {children}
      </Box>
      <BottomNav />
    </Box>
  );
}
