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
import type { Product } from '@/types/product';

export interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (id: string, name: string) => Promise<void>;
  product: Product | null;
}

export function EditProductDialog({ open, onClose, onEdit, product }: EditProductDialogProps) {
  const [productName, setProductName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize productName when product changes or dialog opens
  // Clear productName and reset submitting state when dialog closes to prevent stale data
  useEffect(() => {
    if (product && open) {
      setProductName(product.name);
      setSubmitting(false); // Reset submitting state when opening dialog
    } else if (!open) {
      setProductName('');
      setSubmitting(false); // Reset submitting state when closing dialog
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !product) return;

    setSubmitting(true);
    try {
      await onEdit(product.id, productName.trim());
      setProductName('');
      onClose();
    } catch {
      // Error handled by parent, keep dialog open for retry
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
        <DialogTitle>Edit Product</DialogTitle>
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
            {submitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
