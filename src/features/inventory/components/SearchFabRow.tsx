import { memo } from 'react';
import { Box, TextField, Fab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { InputAdornment, IconButton } from '@mui/material';

export interface SearchFabRowProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  hasProducts: boolean;
}

/**
 * Story 7.1: Search bar and Add FAB row component
 *
 * Sticky row positioned above bottom navigation containing:
 * - Search bar (70% width)
 * - Add FAB (circular button, 48x48px)
 *
 * This component stays visible when scrolling long product lists.
 */
export const SearchFabRow = memo(function SearchFabRow({
  searchTerm,
  onSearchChange,
  onAddProduct,
  hasProducts,
}: SearchFabRowProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 56, // Height of BottomNav
        zIndex: 10,
        display: 'flex',
        gap: 1,
        px: 1.5, // 12px
        py: 1,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderTopColor: 'divider',
      }}
    >
      {/* Search bar - 70% width */}
      <TextField
        fullWidth
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
        variant="outlined"
        size="small"
        disabled={!hasProducts}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                onClick={() => onSearchChange('')}
                edge="end"
                size="small"
                aria-label="Clear search"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        aria-label="Search products"
        sx={{
          flex: 0.7,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.default',
          },
        }}
      />

      {/* Add FAB - circular button 48x48px */}
      <Fab
        color="primary"
        size="medium"
        onClick={onAddProduct}
        aria-label="Add product"
        disabled={!hasProducts}
        sx={{
          flex: 0.3,
          maxWidth: 48,
          maxHeight: 48,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
});
