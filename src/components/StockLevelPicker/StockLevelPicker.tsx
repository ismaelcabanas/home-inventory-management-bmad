import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import type { StockLevel } from '@/types/product';
import { STOCK_LEVEL_CONFIG } from '@/features/inventory/components/stockLevelConfig';

export interface StockLevelPickerProps {
  currentLevel: StockLevel;
  onLevelChange: (level: StockLevel) => void;
  productId: string;
  disabled?: boolean;
}

export function StockLevelPicker({
  currentLevel,
  onLevelChange,
  productId,
  disabled = false,
}: StockLevelPickerProps) {
  const handleLevelChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLevel: StockLevel | null
  ) => {
    if (newLevel !== null && !disabled) {
      onLevelChange(newLevel);
    }
  };

  const stockLevels: StockLevel[] = ['high', 'medium', 'low', 'empty'];

  return (
    <ToggleButtonGroup
      value={currentLevel}
      exclusive
      onChange={handleLevelChange}
      disabled={disabled}
      size="small"
      aria-label={`Stock level for product ${productId}`}
    >
      {stockLevels.map((level) => {
        const config = STOCK_LEVEL_CONFIG[level];
        return (
          <ToggleButton
            key={level}
            value={level}
            aria-label={`Set stock level to ${config.label}`}
            sx={{
              minWidth: 44,
              minHeight: 44,
              '&.Mui-selected': {
                backgroundColor: config.color,
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: config.color,
                  filter: 'brightness(0.9)',
                },
              },
            }}
          >
            {config.label}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}
