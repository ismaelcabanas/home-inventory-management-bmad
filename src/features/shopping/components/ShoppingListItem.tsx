import { ListItem, ListItemText, Chip, Checkbox, Box } from '@mui/material';
import { STOCK_LEVEL_CONFIG } from '@/features/inventory/components/stockLevelConfig';
import type { Product } from '@/types/product';
import { useShoppingList } from '@/features/shopping/context/ShoppingContext';

interface ShoppingListItemProps {
  product: Product;
}

export function ShoppingListItem({ product }: ShoppingListItemProps) {
  const stockConfig = STOCK_LEVEL_CONFIG[product.stockLevel];
  const { toggleItemChecked } = useShoppingList();

  const handleCheckboxChange = () => {
    toggleItemChecked(product.id);
  };

  return (
    <ListItem>
      {/* Story 4.1: Checkbox positioned on left side (standard mobile pattern) */}
      <Checkbox
        checked={product.isChecked}
        onChange={handleCheckboxChange}
        size="medium" // 48px touch target for accessibility
        aria-label={`Mark ${product.name} as ${product.isChecked ? 'uncollected' : 'collected'}`}
        sx={{
          // Ensure sufficient touch target size
          width: 48,
          height: 48,
        }}
      />

      {/* Story 4.1: Conditional styling for checked items */}
      <Box
        sx={{
          textDecoration: product.isChecked ? 'line-through' : 'none',
          opacity: product.isChecked ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
        }}
      >
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
      </Box>
    </ListItem>
  );
}
