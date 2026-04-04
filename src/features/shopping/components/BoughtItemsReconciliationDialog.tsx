/**
 * BoughtItemsReconciliationDialog Component (Story 11.7)
 *
 * Dialog shown after receipt scan when items were marked as "bought"
 * during shopping but were NOT found/confirmed in the receipt.
 *
 * Offers three actions:
 * 1. Keep in list - Clears "bought" status, keeps items
 * 2. Remove - Removes items from shopping list
 * 3. Keep marked - Leaves "bought" status unchanged
 */

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

export interface UnconfirmedItem {
  id: string;
  name: string;
}

interface BoughtItemsReconciliationDialogProps {
  open: boolean;
  itemCount: number;
  items: UnconfirmedItem[];
  onKeep: () => void;
  onRemove: () => void;
  onKeepMarked: () => void;
  onClose: () => void;
}

export const BoughtItemsReconciliationDialog: React.FC<BoughtItemsReconciliationDialogProps> = ({
  open,
  itemCount,
  items,
  onKeep,
  onRemove,
  onKeepMarked,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Unconfirmed Items</DialogTitle>
      <DialogContent>
        <Typography paragraph>
          {itemCount} {itemCount === 1 ? 'item was' : 'items were'} marked as bought but not found in the receipt.
          What would you like to do?
        </Typography>

        {items.length > 0 && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Unconfirmed items:
            </Typography>
            <List dense>
              {items.slice(0, 5).map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemText primary={item.name} />
                </ListItem>
              ))}
              {items.length > 5 && (
                <ListItem>
                  <ListItemText
                    primary={`...and ${items.length - 5} more`}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  />
                </ListItem>
              )}
            </List>
          </>
        )}

        <Typography variant="caption" color="text.secondary">
          Choose what to do with these items:
        </Typography>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', px: 3, pb: 2 }}>
        <Button
          onClick={onKeep}
          variant="outlined"
          sx={{ mb: 1, justifyContent: 'flex-start', textAlign: 'left' }}
        >
          Keep in list (I didn't buy them)
        </Button>
        <Button
          onClick={onRemove}
          color="error"
          variant="outlined"
          sx={{ mb: 1, justifyContent: 'flex-start', textAlign: 'left' }}
        >
          Remove (I forgot to scan them)
        </Button>
        <Button
          onClick={onKeepMarked}
          variant="contained"
          sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
        >
          Keep marked (add to inventory manually later)
        </Button>
      </DialogActions>
    </Dialog>
  );
};
