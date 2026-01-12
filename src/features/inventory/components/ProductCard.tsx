import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import type { Product } from '@/types/product';

export interface ProductCardProps {
  product: Product;
}

const stockLevelConfig = {
  high: { label: 'High', color: '#4caf50' as const },
  medium: { label: 'Medium', color: '#ff9800' as const },
  low: { label: 'Low', color: '#ff5722' as const },
  empty: { label: 'Empty', color: '#f44336' as const },
};

export function ProductCard({ product }: ProductCardProps) {
  const stockConfig = stockLevelConfig[product.stockLevel];

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
