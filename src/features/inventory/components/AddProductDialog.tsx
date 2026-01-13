import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

export interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
}

export function AddProductDialog({ open, onClose, onAdd }: AddProductDialogProps) {
  const [productName, setProductName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset submitting state when dialog opens or closes to prevent stale state
  useEffect(() => {
    if (!open) {
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setSubmitting(true);
    try {
      await onAdd(productName.trim());
      setProductName('');
      onClose();
    } catch {
      // Error handled by parent, keep dialog open for retry
      // User can modify input and try again or click cancel
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setProductName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={submitting}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !productName.trim()}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
