import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface Props {
  children: ReactNode;
}

/**
 * Main application layout with bottom navigation.
 * Provides consistent spacing and structure across all routes.
 *
 * Layout Strategy:
 * - Outer Box: pb: 7 (56px) padding prevents content from being hidden under fixed BottomNav
 * - Main Box: minHeight ensures content fills viewport even when sparse
 * - BottomNav: Fixed positioning (handled in BottomNav component)
 *
 * Note: minHeight calc(100vh - 56px) ensures content area fills screen minus BottomNav height,
 * preventing awkward white space on routes with little content.
 */
export function AppLayout({ children }: Props) {
  return (
    <Box sx={{ pb: 7 }}> {/* 56px padding = BottomNav height, prevents overlap */}
      <Box component="main" sx={{ minHeight: 'calc(100vh - 56px)' }}>
        {children}
      </Box>
      <BottomNav />
    </Box>
  );
}
