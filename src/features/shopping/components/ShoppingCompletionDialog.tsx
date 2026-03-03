import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export interface ShoppingCompletionDialogProps {
  open: boolean;
  checkedCount: number;
  totalCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ShoppingCompletionDialog({
  open,
  checkedCount,
  totalCount,
  onConfirm,
  onCancel,
}: ShoppingCompletionDialogProps) {
  const isComplete = checkedCount === totalCount && totalCount > 0;
  const isPartial = checkedCount > 0 && checkedCount < totalCount;

  // Determine title and message based on completion state
  const title = isComplete ? "Great job! You got everything! 🎉" : "Are you done shopping?";

  let message = `You collected ${checkedCount} of ${totalCount} items.`;
  if (isPartial) {
    message += " Any items not collected will stay on your list for next time.";
  }

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          No, continue shopping
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary" autoFocus>
          Yes, I'm done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
