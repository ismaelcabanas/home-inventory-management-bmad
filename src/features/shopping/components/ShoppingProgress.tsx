// Story 4.2: Shopping Progress Indicator - displays X of Y items collected with visual completion indicator
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface ShoppingProgressProps {
  checkedCount: number;
  totalCount: number;
}

export function ShoppingProgress({ checkedCount, totalCount }: ShoppingProgressProps) {
  const isComplete = totalCount > 0 && checkedCount === totalCount;

  return (
    <Box
      role="status"
      sx={{
        mb: 2,
        p: 2,
        bgcolor: isComplete ? 'success.light' : 'grey.100',
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" component="div">
        {checkedCount} of {totalCount} items collected
      </Typography>
      {isComplete && (
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <CheckCircleIcon color="success" data-testid="check-circle-icon" />
          <Typography color="success.dark" variant="body1">
            Shopping complete!
          </Typography>
        </Box>
      )}
    </Box>
  );
}
