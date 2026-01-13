import { Card, CardContent, Typography, Chip, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { Product } from '@/types/product';
import { STOCK_LEVEL_CONFIG } from './stockLevelConfig';

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  const stockConfig = STOCK_LEVEL_CONFIG[product.stockLevel];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              onClick={() => onEdit(product)}
              aria-label={`Edit ${product.name}`}
              size="small"
            >
              <EditIcon />
            </IconButton>
            <Chip
              label={stockConfig.label}
              sx={{
                backgroundColor: stockConfig.color,
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
