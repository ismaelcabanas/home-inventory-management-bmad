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
 * Search bar and Add FAB row component
 *
 * Full-width row positioned at bottom above navigation:
 * - Search bar takes remaining space (flex: 1)
 * - Add FAB fixed size (48x48px) on the right
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
        position: 'fixed',
        bottom: 56, // Height of BottomNav
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        gap: 1,
        px: 0, // No edge padding - full width
        py: 1,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderTopColor: 'divider',
      }}
    >
      {/* Search bar - takes remaining space */}
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
          flex: 1,
          pl: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.default',
          },
        }}
      />

      {/* Add FAB - fixed size 48x48px */}
      <Fab
        color="primary"
        size="medium"
        onClick={onAddProduct}
        aria-label="Add product"
        disabled={!hasProducts}
        sx={{
          flex: '0 0 48px',
          width: 48,
          height: 48,
          margin: '0 8px',
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
});
