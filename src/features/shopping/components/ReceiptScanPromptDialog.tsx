import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

export interface ReceiptScanPromptDialogProps {
  open: boolean;
  onScan: () => void;
  onDefer: () => void;
}

export function ReceiptScanPromptDialog({
  open,
  onScan,
  onDefer,
}: ReceiptScanPromptDialogProps) {
  return (
    <Dialog open={open} onClose={onDefer} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraAltIcon />
          Scan Your Receipt
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Update your inventory automatically by scanning your receipt
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDefer} color="primary">
          I'll do it later
        </Button>
        <Button onClick={onScan} variant="contained" color="primary" autoFocus>
          Scan Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
}
