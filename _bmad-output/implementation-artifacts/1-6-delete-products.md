# Story 1.6: Delete Products

**Status:** done
**Epic:** Epic 1 - Project Foundation & Initial Inventory Setup
**Story ID:** 1.6
**Created:** 2026-01-14
**Priority:** P0 (Critical - Foundation)
**Branch:** feat/story-1-6-delete-products

---

## User Story

**As a** user,
**I want to** delete products from my inventory,
**So that** I can remove items I no longer want to track.

---

## Acceptance Criteria

### AC1: Delete Icon Button on Product Cards
**Given** I have products in my inventory
**When** I view the inventory list
**Then** I see a "Delete" icon button (MUI `IconButton` with delete icon) on each product card
**And** The button is positioned consistently on all cards (e.g., on the right side next to edit button)
**And** The button has appropriate touch target size (≥44x44px) for mobile (NFR8.1)
**And** The button is clearly visible and accessible
**And** The button uses a distinct color (red) to indicate destructive action

### AC2: Confirmation Dialog Appears
**Given** I'm viewing a product card
**When** I click the delete button
**Then** A MUI confirmation `Dialog` appears asking "Delete [Product Name]?"
**And** The dialog clearly shows which product will be deleted
**And** The dialog has "Cancel" and "Delete" buttons
**And** The "Delete" button is styled as a warning/error action (red color)
**And** The dialog has proper modal behavior (backdrop, Esc to close)

### AC3: Deleting a Product
**Given** The confirmation dialog is open
**When** I click "Delete"
**Then** The dialog closes
**And** The product is immediately removed from the list (FR3, FR40)
**And** A success feedback appears (Snackbar: "Product deleted successfully")
**And** The product is permanently removed from the database
**And** The operation completes within 2 seconds (NFR1)

### AC4: Cancel Delete Operation
**Given** The confirmation dialog is open
**When** I click "Cancel" or press Esc or click the backdrop
**Then** The dialog closes without deleting
**And** The product remains in the list unchanged
**And** No deletion occurs in the database

### AC5: Data Persistence
**Given** I have deleted a product
**When** I close and reopen the app
**Then** Deleted products do not reappear (FR36)
**And** Remaining products are still present (FR39)
**And** No data loss occurs for other products

---

## Technical Requirements

### Component Architecture

This story adds **delete capability** to the existing inventory UI established in Stories 1.4 and 1.5.

**New Components to Create:**

1. **`DeleteConfirmationDialog.tsx`** - Modal for confirming product deletion
   - Location: `src/features/inventory/components/DeleteConfirmationDialog.tsx`
   - Simple confirmation dialog pattern
   - Title: "Delete Product?"
   - Message: "Delete [product name]?" (shows actual product name)
   - Buttons: "Cancel" (default) and "Delete" (error/warning color)
   - Calls `onConfirm()` when Delete clicked
   - Calls `onCancel()` when Cancel clicked or dialog closed
   - Uses MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
   - No input fields (just confirmation)
   - Handles loading state during async deletion

**Modifications to Existing Components:**

1. **`ProductCard.tsx`** - Add delete button
   - Add delete icon button (`IconButton` with `DeleteIcon`)
   - Position button in card header (next to edit button)
   - Use red color to indicate destructive action
   - Handle click to trigger delete confirmation flow
   - Pass click handler via prop

2. **`InventoryList.tsx`** - Manage delete dialog state
   - Add state for delete confirmation dialog open/close
   - Add state for product being deleted
   - Pass delete handler to ProductCard
   - Render DeleteConfirmationDialog
   - Handle product deletion from context

### TypeScript Interfaces

**Component Props:**
```typescript
// DeleteConfirmationDialog.tsx
export interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string; // Product name to show in confirmation message
}

// ProductCard.tsx (updated)
export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void; // EXISTS from Story 1.5
  onDelete: (product: Product) => void; // NEW - trigger delete flow
}
```

### MUI Component Usage

**DeleteConfirmationDialog Pattern:**
```typescript
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

// Simple confirmation dialog - no form
<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
  <DialogTitle>Delete Product?</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Delete "{productName}"? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose} disabled={deleting}>
      Cancel
    </Button>
    <Button
      onClick={handleDelete}
      color="error"
      variant="contained"
      disabled={deleting}
    >
      {deleting ? <CircularProgress size={24} /> : 'Delete'}
    </Button>
  </DialogActions>
</Dialog>
```

**ProductCard Delete Button:**
```typescript
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';

// Inside ProductCard component:
<IconButton
  onClick={() => onDelete(product)}
  aria-label={`Delete ${product.name}`}
  size="small"
  sx={{ color: 'error.main' }} // Red color for destructive action
>
  <DeleteIcon />
</IconButton>
```

### Error Handling

**Context-Level Deletion:**
- Use existing `deleteProduct(id)` from InventoryContext (Story 1.3)
- Context handles error states and loading
- Errors bubble up to component for user feedback

**Component-Level Feedback:**
- Success: Show `Snackbar` with "Product deleted successfully"
- Error: Show `Snackbar` with error message from context
- Loading: Disable buttons and show `CircularProgress` in confirmation dialog
- Close dialog on successful deletion
- Keep dialog open on error (allow retry)

### State Management

**Local Component State (InventoryList):**
```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [productBeingDeleted, setProductBeingDeleted] = useState<Product | null>(null);
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' as 'success' | 'error'
});
```

**DeleteConfirmationDialog State:**
```typescript
const [deleting, setDeleting] = useState(false);
```

**Context State (from Story 1.3 - Already Available):**
```typescript
const { state, deleteProduct } = useInventory();
// deleteProduct(id: string): Promise<void>
```

---

## Architecture Requirements (From Architecture Document)

### Feature-Based Folder Structure (CRITICAL)

**No changes to folder structure** - New components follow existing pattern:

```
src/
├── features/
│   └── inventory/
│       ├── components/
│       │   ├── InventoryList.tsx          # EXISTS - Update
│       │   ├── ProductCard.tsx            # EXISTS - Update
│       │   ├── AddProductDialog.tsx       # EXISTS (Story 1.4)
│       │   ├── EditProductDialog.tsx      # EXISTS (Story 1.5)
│       │   └── DeleteConfirmationDialog.tsx # NEW - Create
│       ├── context/
│       │   └── InventoryContext.tsx       # EXISTS (Story 1.3) - Use deleteProduct()
│       └── hooks/
└── components/
    └── shared/
        └── EmptyState.tsx                  # EXISTS (Story 1.4)
```

### Service Layer Integration

**Use Existing Service (Story 1.2):**
```typescript
// Context already has deleteProduct method that calls:
// inventoryService.deleteProduct(id: string)
//
// This:
// - Removes product from IndexedDB
// - Returns Promise<void>
```

**No new service methods needed** - Story 1.3 context provides everything.

### Naming Conventions (MUST FOLLOW)

**Components:**
- PascalCase: `DeleteConfirmationDialog`
- File naming: `DeleteConfirmationDialog.tsx`, `DeleteConfirmationDialog.test.tsx`

**Props Interfaces:**
- PascalCase with `Props` suffix: `DeleteConfirmationDialogProps`

**State Variables:**
- camelCase: `deleteDialogOpen`, `productBeingDeleted`, `deleting`

**Event Handlers:**
- camelCase with `handle` prefix: `handleDelete`, `handleCloseDeleteDialog`

---

## Previous Story Intelligence

### Learnings from Story 1.5 (Edit Product Names)

**Git Commit:** 20ca3e4 - Story 1.5: Edit Product Names

**Key Patterns Established:**

1. **Dialog Component Pattern:**
   - `open` prop for visibility control
   - `onClose` callback for closing
   - `onConfirm/onEdit` callback for actions (async)
   - Local state: `deleting`/`submitting`
   - Error handling: catch errors but handle retry logic
   - Clear state on successful operation
   - Disable buttons during operation
   - Proper error boundaries

2. **ProductCard Enhancement Pattern:**
   - IconButton next to existing buttons
   - Consistent spacing and alignment
   - Proper ARIA labels for accessibility
   - Touch target size ≥44x44px
   - Don't break existing functionality

3. **InventoryList State Management:**
   - Local state for dialog visibility
   - Local state for item being acted upon
   - Uses `useInventory()` hook for context
   - Calls context methods for data operations
   - Shows success/error feedback via Snackbar
   - Reuses Snackbar pattern across all operations

4. **Test Structure (IMPORTANT):**
   - Vitest + React Testing Library
   - Mock services with `vi.mock()`
   - Wrap components in `InventoryProvider` for tests
   - Test rendering, user interactions, async operations
   - Test error handling paths
   - Check for success/error feedback
   - Test confirmation flow (unique to delete)

5. **MUI Patterns Used:**
   - `Dialog` with `maxWidth="xs"` for confirmation (smaller than form dialogs)
   - `DialogContentText` for confirmation message
   - `Button` with `color="error"` for destructive actions
   - `IconButton` with `sx={{ color: 'error.main' }}` for delete button
   - `CircularProgress` for loading states

### Differences from Story 1.5:

**Delete is simpler than Edit:**
- No form fields (just confirmation)
- No input validation needed
- No pre-filling logic
- Smaller dialog size (`maxWidth="xs"` vs `"sm"`)
- Uses `DialogContentText` for message
- Emphasizes destructive action (red buttons)

**Critical Pattern: Confirmation Before Action:**
- MUST show confirmation dialog before deleting
- MUST display product name in confirmation
- MUST use error/warning colors (red)
- MUST handle accidental clicks gracefully

---

## Implementation Steps

### Step 1: Create DeleteConfirmationDialog Component

**Create:** `src/features/inventory/components/DeleteConfirmationDialog.tsx`

**Pattern:** Simple confirmation dialog (simpler than Edit/Add dialogs)

```typescript
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

export interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
}

export function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  productName,
}: DeleteConfirmationDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose(); // Close on success
    } catch {
      // Error handled by parent, keep dialog open for retry
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Product?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Delete "{productName}"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleting}
        >
          {deleting ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Key Features:**
- No form (simpler than Edit/Add)
- Shows product name in confirmation message
- Red "Delete" button (`color="error"`)
- Handles loading state with CircularProgress
- Closes on success, stays open on error

**Test:** `src/features/inventory/components/DeleteConfirmationDialog.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

describe('DeleteConfirmationDialog', () => {
  it('should render when open with product name', () => {
    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        productName="Milk"
      />
    );

    expect(screen.getByText('Delete Product?')).toBeInTheDocument();
    expect(screen.getByText(/Delete "Milk"\?/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <DeleteConfirmationDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        productName="Milk"
      />
    );

    expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button clicked', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        productName="Milk"
      />
    );

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should close dialog on cancel', () => {
    const onClose = vi.fn();

    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        productName="Milk"
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should show loading state during deletion', async () => {
    const onConfirm = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        productName="Milk"
      />
    );

    fireEvent.click(screen.getByText('Delete'));

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('should keep dialog open on error', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('Delete failed'));
    const onClose = vi.fn();

    render(
      <DeleteConfirmationDialog
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        productName="Milk"
      />
    );

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });

    // Dialog should stay open (onClose not called)
    expect(onClose).not.toHaveBeenCalled();
  });
});
```

### Step 2: Update ProductCard Component

**Update:** `src/features/inventory/components/ProductCard.tsx`

**Add delete button next to edit button:**

```typescript
import { Card, CardContent, Typography, Chip, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // NEW
import type { Product } from '@/types/product';
import { STOCK_LEVEL_CONFIG } from './stockLevelConfig';

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void; // EXISTS
  onDelete: (product: Product) => void; // NEW
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const stockConfig = STOCK_LEVEL_CONFIG[product.stockLevel];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              onClick={() => onEdit(product)}
              aria-label={`Edit ${product.name}`}
              size="small"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => onDelete(product)}
              aria-label={`Delete ${product.name}`}
              size="small"
              sx={{ color: 'error.main' }} // Red color for destructive action
            >
              <DeleteIcon />
            </IconButton>
            <Chip
              label={stockConfig.label}
              sx={{
                backgroundColor: stockConfig.color,
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
```

**Update Test:** `src/features/inventory/components/ProductCard.test.tsx`

```typescript
// Add to existing tests:

it('should render delete button', () => {
  const onDelete = vi.fn();
  render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={onDelete} />);

  const deleteButton = screen.getByLabelText(/Delete Milk/i);
  expect(deleteButton).toBeInTheDocument();
});

it('should call onDelete when delete button clicked', () => {
  const onDelete = vi.fn();
  render(<ProductCard product={mockProduct} onEdit={vi.fn()} onDelete={onDelete} />);

  const deleteButton = screen.getByLabelText(/Delete Milk/i);
  fireEvent.click(deleteButton);

  expect(onDelete).toHaveBeenCalledWith(mockProduct);
});
```

### Step 3: Update InventoryList Component

**Update:** `src/features/inventory/components/InventoryList.tsx`

**Add delete dialog state and handlers:**

```typescript
// Add to existing imports:
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

// Add to component state:
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [productBeingDeleted, setProductBeingDeleted] = useState<Product | null>(null);

// Add delete handler:
const handleDeleteProduct = (product: Product) => {
  setProductBeingDeleted(product);
  setDeleteDialogOpen(true);
};

const handleConfirmDelete = async () => {
  if (!productBeingDeleted) return;

  try {
    await deleteProduct(productBeingDeleted.id);
    setSnackbar({
      open: true,
      message: 'Product deleted successfully',
      severity: 'success',
    });
  } catch (error) {
    setSnackbar({
      open: true,
      message: error instanceof Error ? error.message : 'Failed to delete product',
      severity: 'error',
    });
    throw error; // Re-throw to prevent dialog close
  }
};

const handleCloseDeleteDialog = () => {
  setDeleteDialogOpen(false);
  setProductBeingDeleted(null);
};

// Update ProductCard rendering:
{state.products.map((product) => (
  <ProductCard
    key={product.id}
    product={product}
    onEdit={handleEditProduct} // EXISTS
    onDelete={handleDeleteProduct} // NEW
  />
))}

// Add DeleteConfirmationDialog render:
{/* After EditProductDialog */}
<DeleteConfirmationDialog
  open={deleteDialogOpen}
  onClose={handleCloseDeleteDialog}
  onConfirm={handleConfirmDelete}
  productName={productBeingDeleted?.name || ''}
/>
```

**Update Test:** `src/features/inventory/components/InventoryList.test.tsx`

```typescript
// Add to existing tests:

it('should open delete confirmation dialog when delete button clicked', async () => {
  vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);

  render(
    <InventoryProvider>
      <InventoryList />
    </InventoryProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  const deleteButton = screen.getByLabelText(/Delete Milk/i);
  fireEvent.click(deleteButton);

  expect(screen.getByText('Delete Product?')).toBeInTheDocument();
  expect(screen.getByText(/Delete "Milk"\?/)).toBeInTheDocument();
});

it('should delete product successfully', async () => {
  vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
  vi.mocked(inventoryService.deleteProduct).mockResolvedValue();

  render(
    <InventoryProvider>
      <InventoryList />
    </InventoryProvider>
  );

  await waitFor(() => {
    fireEvent.click(screen.getByLabelText(/Delete Milk/i));
  });

  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => {
    expect(screen.getByText('Product deleted successfully')).toBeInTheDocument();
  });
});

it('should cancel delete operation', async () => {
  vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);

  render(
    <InventoryProvider>
      <InventoryList />
    </InventoryProvider>
  );

  await waitFor(() => {
    fireEvent.click(screen.getByLabelText(/Delete Milk/i));
  });

  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument();
  });

  // Product should still be in the list
  expect(screen.getByText('Milk')).toBeInTheDocument();
});
```

### Step 4: Run Tests

```bash
# Run all tests
npm run test

# Expected: All tests passing
# New tests: ~6 tests for DeleteConfirmationDialog
# Updated tests: ~2 tests for ProductCard, ~3 tests for InventoryList
# Total new/updated: ~11 tests

# Check coverage
npm run test:coverage

# Expected: ≥85% coverage maintained
```

### Step 5: Manual Testing

```bash
# Start dev server
npm run dev

# Open http://localhost:5173

# Test workflow:
1. See existing products (from previous stories)
2. Click delete button on a product (red icon)
3. See "Delete Product?" confirmation dialog
4. See product name in confirmation message
5. Click "Delete"
6. See product disappear immediately from list
7. See success snackbar
8. Close and reopen browser
9. Verify deleted product does not reappear

# Test cancel:
10. Click delete button
11. Click "Cancel" or Esc
12. Verify product still in list

# Test error handling:
13. Simulate error (disconnect network or modify code)
14. Verify error message shown
15. Verify dialog stays open for retry
```

### Step 6: Build and Lint

```bash
# Check TypeScript compilation
npm run build
# Should build successfully

# Run linter
npm run lint
# Should pass with 0 errors
```

---

## Non-Functional Requirements

### Performance (NFR1)
- Delete confirmation dialog opens within <100ms
- Product deletion within 2 seconds
- Immediate UI update on successful delete
- Smooth animation transitions

### Usability (NFR7, NFR7.1)
- Single-tap delete button (prominent, visible)
- Clear confirmation dialog (prevents accidental deletion)
- Visual distinction (red color for destructive action)
- Clear visual feedback (Snackbar for success/error)
- Intuitive delete flow

### Accessibility (NFR8, NFR8.1, NFR8.2)
- Delete button ≥44x44px touch target on mobile
- ARIA label on delete button identifies product
- Keyboard navigation works (Tab, Enter, Esc)
- Screen reader announces dialog and confirms deletion
- Red color supplemented with text ("Delete" label)
- Sufficient color contrast for all elements

### Local-First (NFR9)
- All features work offline
- Data persists via IndexedDB (from Story 1.2)
- No network required for delete operations
- Deletions are immediate and permanent

---

## Definition of Done

This story is considered complete when:

- [ ] **Code Complete:**
  - [ ] `DeleteConfirmationDialog.tsx` created and tested
  - [ ] `ProductCard.tsx` updated with delete button
  - [ ] `InventoryList.tsx` updated with delete dialog management
  - [ ] All TypeScript interfaces defined
  - [ ] All imports use absolute `@/` paths

- [ ] **Testing Complete:**
  - [ ] All unit tests pass (~11 new/updated tests)
  - [ ] Test coverage ≥85% for DeleteConfirmationDialog
  - [ ] Integration test with InventoryContext passes
  - [ ] Manual testing workflow verified (delete, cancel, persist)

- [ ] **Quality Checks:**
  - [ ] TypeScript compilation succeeds
  - [ ] ESLint passes with 0 errors
  - [ ] No console errors or warnings
  - [ ] Responsive design works (mobile + desktop)

- [ ] **User Experience:**
  - [ ] Delete button visible and accessible on all cards
  - [ ] Delete button uses red color (error.main)
  - [ ] Confirmation dialog appears before deletion
  - [ ] Product name shown in confirmation message
  - [ ] Success feedback appears on delete
  - [ ] Deleted products don't reappear after restart
  - [ ] Cancel works correctly (no deletion)
  - [ ] Loading states handled gracefully

- [ ] **Acceptance Criteria Met:**
  - [ ] AC1: Delete Icon Button on Product Cards
  - [ ] AC2: Confirmation Dialog Appears
  - [ ] AC3: Deleting a Product
  - [ ] AC4: Cancel Delete Operation
  - [ ] AC5: Data Persistence

---

## Dev Notes

### Critical Pattern: Confirmation Before Deletion

**MUST FOLLOW:** Always show confirmation dialog before destructive actions:

1. **Visual Warning:** Red delete button on card (`sx={{ color: 'error.main' }}`)
2. **Confirmation Dialog:** MUST appear before actual deletion
3. **Product Name:** MUST display in confirmation message
4. **Error Color:** MUST use `color="error"` on Delete button
5. **Cancel Option:** MUST be default action (not destructive)

**Do NOT:** Delete immediately without confirmation - this violates UX best practices and can lead to accidental data loss.

### DeleteConfirmationDialog vs Edit/Add Dialogs

**Simpler Than Edit/Add:**
- No form fields (just confirmation text)
- No input validation needed
- No pre-filling logic required
- Smaller dialog size (`maxWidth="xs"` instead of `"sm"`)
- Uses `DialogContentText` for message
- Focuses on preventing accidental deletion

**Key Difference:**
```typescript
// Add/Edit: Form-based dialog
<form onSubmit={handleSubmit}>...</form>

// Delete: Simple confirmation dialog
<DialogContentText>
  Delete "{productName}"? This action cannot be undone.
</DialogContentText>
```

### Integration Points

**InventoryContext (Story 1.3):**
- Already has `deleteProduct(id: string): Promise<void>`
- Call with: `deleteProduct(productId)`
- Removes from IndexedDB permanently
- Updates state immutably (removes from products array)

**InventoryService (Story 1.2):**
- Context calls `inventoryService.deleteProduct(id)`
- Service handles Dexie.js database operations
- No changes needed to service layer

### Testing Strategy

**DeleteConfirmationDialog Tests:**
- Test rendering when open/closed
- Test product name display in message
- Test Delete button triggers onConfirm
- Test Cancel button triggers onClose
- Test loading state during deletion
- Test error handling (dialog stays open)

**ProductCard Tests:**
- Test delete button renders
- Test delete button has red color
- Test delete button click triggers onDelete
- Maintain existing tests (don't break)

**InventoryList Integration:**
- Test delete dialog opens with correct product
- Test successful product deletion
- Test cancel scenario (product remains)
- Test error scenario
- Test persistence (deleted products don't reappear)

### Architecture Compliance

**Feature-Based Structure:** ✅
- DeleteConfirmationDialog in `src/features/inventory/components/`
- Co-located test file
- Follows Stories 1.4 and 1.5 patterns

**Absolute Imports:** ✅
- Use `@/types/product` for Product interface
- Use `@/features/inventory/...` paths

**Naming Conventions:** ✅
- PascalCase components
- camelCase variables/handlers
- Props interfaces with `Props` suffix

**State Management:** ✅
- Local state for dialog UI
- Context state for data operations
- No direct service calls from components

---

## Related Documents

- **Epic:** `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.6, lines 590-619)
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md`
- **PRD:** `_bmad-output/planning-artifacts/prd.md`
- **Previous Stories:**
  - Story 1.5: `_bmad-output/implementation-artifacts/1-5-edit-product-names.md` (Dialog patterns!)
  - Story 1.4: `_bmad-output/implementation-artifacts/1-4-add-and-view-products-in-inventory.md`
  - Story 1.3: `_bmad-output/implementation-artifacts/1-3-create-inventory-context-and-state-management.md`
  - Story 1.2: `_bmad-output/implementation-artifacts/1-2-set-up-database-schema-and-service-layer.md`

---

## File List

**New Files:**
- src/features/inventory/components/DeleteConfirmationDialog.tsx
- src/features/inventory/components/DeleteConfirmationDialog.test.tsx
- _bmad-output/implementation-artifacts/1-6-delete-products.md

**Modified Files:**
- src/features/inventory/components/ProductCard.tsx
- src/features/inventory/components/ProductCard.test.tsx
- src/features/inventory/components/InventoryList.tsx
- src/features/inventory/components/InventoryList.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- **2026-01-14:** Story created (create-story workflow v2)
- **2026-01-14:** Story implemented - Delete products functionality complete (RED-GREEN-REFACTOR TDD cycle, all 102 tests passing)
- **2026-01-14:** Code review completed - Fixed 9 issues (5 High, 4 Medium), added 3 tests, all 105 tests passing

## Story Metadata

- **Created By:** bmm:create-story workflow (v2 with branch automation)
- **Date:** 2026-01-14
- **Workflow Version:** 4-implementation/create-story
- **Agent:** Claude Code (Sonnet 3.7)
- **Branch:** feat/story-1-6-delete-products
- **Context Engine:** Ultimate BMad Method story creation with comprehensive analysis

---

## Dev Agent Record

### Agent Model Used

Claude Code (Sonnet 3.7) - Anthropic API

### Implementation Notes

**Implementation Date:** 2026-01-14
**Approach:** RED-GREEN-REFACTOR TDD cycle

**Step 1: DeleteConfirmationDialog Component**
- src/features/inventory/components/DeleteConfirmationDialog.tsx:65
- src/features/inventory/components/DeleteConfirmationDialog.test.tsx:115
- Simple confirmation dialog (no form, just yes/no)
- Uses MUI Dialog with DialogContentText for warning message
- Red delete button (color="error") per story specs
- Loading state with CircularProgress
- Keeps dialog open on error for retry
- 6/6 tests passing

**Step 2: ProductCard Component Update**
- src/features/inventory/components/ProductCard.tsx:45
- Added DeleteIcon button next to EditIcon
- Red color (error.main) to indicate destructive action
- Touch target 44x44px (NFR8.1 compliant)
- Calls onDelete(product) handler
- 11/11 tests passing (9 existing + 2 new)

**Step 3: InventoryList Component Update**
- src/features/inventory/components/InventoryList.tsx:203
- Added deleteDialogOpen and productBeingDeleted state
- Added handleDeleteProduct, handleConfirmDelete, handleCloseDeleteDialog handlers
- Integrated with existing useInventory().deleteProduct()
- Reused Snackbar pattern for success/error feedback
- Rendered DeleteConfirmationDialog component
- 15/15 tests passing (12 existing + 3 new)

**Testing:**
- All 102 tests passing (no regressions)
- New tests: 11 (6 + 2 + 3)
- TypeScript compilation successful
- ESLint 0 errors

**Technical Decisions:**
- Followed Story 1.5 (Edit) dialog patterns exactly
- DeleteConfirmationDialog simpler than Edit/Add (no form validation)
- Used maxWidth="xs" for smaller dialog size
- Error handling: re-throw to prevent dialog close on failure
- Context method deleteProduct() already existed from Story 1.3

### Completion Notes

✅ **Story 1.6 Complete: Delete Products**

**Implemented (2026-01-14):**
1. DeleteConfirmationDialog component with confirmation flow
2. ProductCard delete button with red color indication
3. InventoryList delete dialog state management
4. Full integration with InventoryContext.deleteProduct()

**All Acceptance Criteria Met:**
- ✅ AC1: Delete Icon Button on Product Cards (red, ≥44x44px, accessible)
- ✅ AC2: Confirmation Dialog Appears (shows product name, proper modal)
- ✅ AC3: Deleting a Product (immediate removal, success feedback, <2s)
- ✅ AC4: Cancel Delete Operation (dialog closes, no deletion)
- ✅ AC5: Data Persistence (deleted products don't reappear)

**Test Coverage:**
- 102 tests passing (11 new for delete functionality)
- Zero regressions
- DeleteConfirmationDialog: 100% coverage
- ProductCard: All delete button tests passing
- InventoryList: End-to-end delete flow tests passing

**Quality Checks:**
- TypeScript compilation: ✅ Success
- ESLint: ✅ 0 errors
- Build: ✅ Success (558KB bundle)
- All imports use absolute @/ paths
- Architecture patterns followed (feature-based structure)

**Story completed and code review passed.**

**Code Review Fixes Applied (2026-01-14):**
1. CircularProgress now inherits button color (was blue in red button)
2. Dialog state properly resets on success
3. ARIA live region added for screen reader announcements
4. Console.error logging added for debugging
5. Import statements alphabetized
6. Added 3 new tests: red color verification, 44x44px touch target, null edge case
7. File List updated with story.md and sprint-status.yaml

**Post-Review Status:**
- Tests: 105/105 passing (3 new tests added)
- Build: ✅ TypeScript + ESLint pass
- Accessibility: NFR8.1 & NFR8.2 compliant (touch targets + screen readers)
- All High and Medium issues resolved

---

## Critical Success Factors

**Three Keys to Success:**

1. **Show Confirmation Dialog** - NEVER delete without user confirmation
2. **Use Red Color** - Delete button must be visually distinct as destructive action
3. **Follow Edit Pattern** - Reuse established dialog patterns from Story 1.5

**Gotchas to Avoid:**

- Don't delete immediately without confirmation
- Don't use default button colors (must be red/error)
- Don't forget to show product name in confirmation
- Don't break existing ProductCard tests when adding onDelete prop
- Remember to clear productBeingDeleted state when dialog closes
- Handle null product case (when dialog closed)
- Keep dialog open on error (like Edit/Add patterns)

**This story is simpler than Story 1.5 (Edit)** - No form, no validation, just confirmation and deletion. Focus on clear UX and preventing accidental data loss.
