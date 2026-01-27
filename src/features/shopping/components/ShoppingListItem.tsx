import { ListItem, ListItemText, Chip } from '@mui/material';
import { STOCK_LEVEL_CONFIG } from '@/features/inventory/components/stockLevelConfig';
import type { Product } from '@/types/product';

interface ShoppingListItemProps {
  product: Product;
}

export function ShoppingListItem({ product }: ShoppingListItemProps) {
  const stockConfig = STOCK_LEVEL_CONFIG[product.stockLevel];

  return (
    <ListItem>
      <ListItemText
        primary={product.name}
        secondary={
          <Chip
            label={stockConfig.label}
            sx={{
              backgroundColor: stockConfig.chipColor,
              color: stockConfig.textColor,
              fontSize: '14px',
              marginTop: 0.5,
            }}
            size="small"
          />
        }
      />
    </ListItem>
  );
}
