import { memo, useCallback, useRef } from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import type { StockLevel } from '@/types/product';
import { STOCK_LEVEL_CONFIG } from '@/features/inventory/components/stockLevelConfig';

/**
 * StockLevelPicker component for quick stock level updates
 *
 * @description A Material-UI ToggleButtonGroup that allows users to update product
 * stock levels with a single tap. Supports four levels: High, Medium, Low, Empty.
 * Implements debouncing for rapid clicks and meets WCAG accessibility standards.
 *
 * @example
 * ```tsx
 * <StockLevelPicker
 *   currentLevel="high"
 *   onLevelChange={(level) => updateProduct(id, { stockLevel: level })}
 *   productId="product-123"
 * />
 * ```
 *
 * @param {StockLevel} currentLevel - The currently selected stock level
 * @param {(level: StockLevel) => void} onLevelChange - Callback fired when level changes
 * @param {string} productId - Unique identifier for the product
 * @param {boolean} [disabled=false] - If true, disables all interactions
 */
export interface StockLevelPickerProps {
  currentLevel: StockLevel;
  onLevelChange: (level: StockLevel) => void;
  productId: string;
  disabled?: boolean;
}

export const StockLevelPicker = memo(function StockLevelPicker({
  currentLevel,
  onLevelChange,
  productId,
  disabled = false,
}: StockLevelPickerProps) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);

  const handleLevelChange = useCallback((
    _event: React.MouseEvent<HTMLElement>,
    newLevel: StockLevel | null
  ) => {
    if (newLevel !== null && !disabled) {
      // Debounce rapid clicks (AC3 requirement) - throttle to max 1 call per 100ms
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (timeSinceLastCall < 100) {
        // Rapid click - debounce it
        debounceTimerRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          onLevelChange(newLevel);
          debounceTimerRef.current = null;
        }, 100);
      } else {
        // Normal click - immediate
        lastCallRef.current = now;
        onLevelChange(newLevel);
      }
    }
  }, [onLevelChange, disabled]);

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
});
