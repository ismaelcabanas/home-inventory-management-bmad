import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Product } from '@/types/product';

export interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  product: Product | null;
}

export function EditProductDialog({ open, onClose, onEdit, onDelete, product }: EditProductDialogProps) {
  const [productName, setProductName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Initialize productName when product changes or dialog opens
  useEffect(() => {
    if (product && open) {
      setProductName(product.name);
      setSubmitting(false);
    } else if (!open) {
      setProductName('');
      setSubmitting(false);
      setDeleteDialogOpen(false);
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
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setProductName('');
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!product) return;
    setSubmitting(true);
    try {
      await onDelete!(product.id);
      setProductName('');
      setDeleteDialogOpen(false);
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Edit Product
            {onDelete && (
              <Tooltip title="Delete product">
                <IconButton
                  onClick={handleDeleteClick}
                  disabled={submitting}
                  color="error"
                  aria-label="Delete product"
                  type="button"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </DialogTitle>
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{product?.name}"? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
