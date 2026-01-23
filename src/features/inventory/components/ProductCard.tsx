import { memo, useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Product, StockLevel } from '@/types/product';
import { StockLevelPicker } from '@/components/StockLevelPicker';
import { STOCK_LEVEL_CONFIG } from './stockLevelConfig';

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStockLevelChange?: (productId: string, stockLevel: StockLevel) => Promise<void>;
}

export const ProductCard = memo(function ProductCard({ product, onEdit, onDelete, onStockLevelChange }: ProductCardProps) {
  const [announceMessage, setAnnounceMessage] = useState<string>('');

  // Get stock level configuration for visual chip (Story 2.2)
  const stockConfig = STOCK_LEVEL_CONFIG[product.stockLevel];

  const handleStockLevelChange = async (newLevel: StockLevel) => {
    if (onStockLevelChange) {
      try {
        // Update ARIA live region for screen readers (H4)
        setAnnounceMessage(`Stock level changed to ${newLevel}`);
        setTimeout(() => setAnnounceMessage(''), 2000);

        await onStockLevelChange(product.id, newLevel);
      } catch {
        // Error handled by parent (InventoryList shows snackbar)
        // Silently catch here to prevent unhandled rejection
      }
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* ARIA live region for stock level change announcements (H4) */}
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Product name and actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                onClick={() => onEdit(product)}
                aria-label={`Edit ${product.name}`}
                sx={{ minWidth: 44, minHeight: 44 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => onDelete(product)}
                aria-label={`Delete ${product.name}`}
                sx={{ minWidth: 44, minHeight: 44, color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Story 2.2: Stock Level Visual Indicator Chip (AC1) */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Chip
              label={stockConfig.label}
              size="small"
              sx={{
                backgroundColor: stockConfig.chipColor,
                color: stockConfig.textColor,
                fontWeight: 'medium',
                fontSize: '14px',
              }}
            />
          </Box>

          {/* Stock level picker for changing stock level */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <StockLevelPicker
              currentLevel={product.stockLevel}
              onLevelChange={handleStockLevelChange}
              productId={product.id}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});
