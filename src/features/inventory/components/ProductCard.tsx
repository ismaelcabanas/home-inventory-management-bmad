import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import type { Product } from '@/types/product';
import { STOCK_LEVEL_CONFIG } from './stockLevelConfig';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const stockConfig = STOCK_LEVEL_CONFIG[product.stockLevel];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            {product.name}
          </Typography>
          <Chip
            label={stockConfig.label}
            sx={{
              backgroundColor: stockConfig.color,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
