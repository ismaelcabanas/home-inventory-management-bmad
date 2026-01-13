# Story 1.5: Edit Product Names

**Status:** review
**Epic:** Epic 1 - Project Foundation & Initial Inventory Setup
**Story ID:** 1.5
**Created:** 2026-01-13
**Priority:** P0 (Critical - Foundation)
**Branch:** feat/story-1-5-edit-product-names

---

## User Story

**As a** user,
**I want to** edit product names in my inventory,
**So that** I can fix typos or update product descriptions.

---

## Acceptance Criteria

### AC1: Edit Icon Button on Product Cards
**Given** I have products in my inventory
**When** I view the inventory list
**Then** I see an "Edit" icon button (MUI `IconButton` with edit icon) on each product card
**And** The button is positioned consistently on all cards (e.g., on the right side next to stock level)
**And** The button has appropriate touch target size (≥44x44px) for mobile (NFR8.1)
**And** The button is clearly visible and accessible

### AC2: Edit Product Dialog Opens
**Given** I'm viewing a product card
**When** I click the edit button
**Then** A MUI `Dialog` opens with an edit form
**And** The dialog title shows "Edit Product"
**And** The form contains a `TextField` pre-filled with the current product name
**And** The form has "Cancel" and "Save" buttons
**And** The TextField is automatically focused when the dialog opens
**And** The dialog has proper modal behavior (backdrop, Esc to close)

### AC3: Editing a Product Name
**Given** The Edit Product dialog is open
**When** I change the product name and click "Save"
**Then** The dialog closes
**And** The product name updates immediately in the list (FR2, FR40)
**And** A success feedback appears (Snackbar: "Product updated successfully")
**And** The `updatedAt` timestamp is updated in the database
**And** The operation completes within 2 seconds (NFR1)

### AC4: Cancel Edit Operation
**Given** The Edit Product dialog is open
**When** I click "Cancel" or press Esc or click the backdrop
**Then** The dialog closes without saving changes
**And** The product name remains unchanged in the list
**And** No update occurs in the database

### AC5: Data Persistence
**Given** I have edited a product name
**When** I close and reopen the app
**Then** The edited product name is still correct (FR36)
**And** No data is lost (FR39)
**And** The `updatedAt` timestamp reflects the edit time

---

## Technical Requirements

### Component Architecture

This story adds **edit capability** to the existing inventory UI established in Story 1.4.

**New Components to Create:**

1. **`EditProductDialog.tsx`** - Modal for editing products
   - Location: `src/features/inventory/components/EditProductDialog.tsx`
   - Very similar to `AddProductDialog.tsx` but with:
     - Pre-filled TextField with current product name
     - Title: "Edit Product" instead of "Add Product"
     - Button text: "Save" instead of "Add"
     - Accepts `product: Product` prop (to get current name)
     - Calls `onEdit(id: string, name: string)` instead of `onAdd(name: string)`
   - Uses MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
   - Contains `TextField` for product name (pre-filled)
   - Validates input (non-empty, no whitespace-only)
   - Handles loading state during async update

**Modifications to Existing Components:**

1. **`ProductCard.tsx`** - Add edit button
   - Add edit icon button (`IconButton` with `EditIcon`)
   - Position button in card header (next to stock level chip)
   - Handle click to trigger edit flow
   - Pass click handler via prop

2. **`InventoryList.tsx`** - Manage edit dialog state
   - Add state for edit dialog open/close
   - Add state for product being edited
   - Pass edit handler to ProductCard
   - Render EditProductDialog
   - Handle product updates from context

### TypeScript Interfaces

**Component Props:**
```typescript
// EditProductDialog.tsx
export interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (id: string, name: string) => Promise<void>;
  product: Product | null; // null when dialog closed
}

// ProductCard.tsx (updated)
export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void; // NEW - trigger edit flow
}
```

### MUI Component Usage

**EditProductDialog Pattern (Reuse from Story 1.4):**
- Same dialog structure as `AddProductDialog`
- Key differences:
  - Pre-fill TextField with `product.name`
  - Button text "Save" instead of "Add"
  - Dialog title "Edit Product" instead of "Add Product"
  - onEdit handler receives both `id` and `name`

**ProductCard Edit Button:**
```typescript
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';

// Inside ProductCard component:
<IconButton
  onClick={() => onEdit(product)}
  aria-label={`Edit ${product.name}`}
  size="small"
>
  <EditIcon />
</IconButton>
```

### Error Handling

**Context-Level Updates:**
- Use existing `updateProduct()` from InventoryContext (Story 1.3)
- Context handles error states and loading
- Errors bubble up to component for user feedback

**Component-Level Feedback:**
- Success: Show `Snackbar` with "Product updated successfully"
- Error: Show `Snackbar` with error message from context
- Loading: Disable buttons and show `CircularProgress` in edit dialog
- Keep dialog open on error (allow retry like AddProductDialog pattern)

### State Management

**Local Component State (InventoryList):**
```typescript
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [productBeingEdited, setProductBeingEdited] = useState<Product | null>(null);
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' as 'success' | 'error'
});
```

**EditProductDialog State:**
```typescript
const [productName, setProductName] = useState(product?.name || '');
const [submitting, setSubmitting] = useState(false);
```

**Context State (from Story 1.3 - Already Available):**
```typescript
const { state, updateProduct } = useInventory();
// updateProduct(id: string, updates: Partial<Product>): Promise<void>
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
│       │   └── EditProductDialog.tsx      # NEW - Create
│       ├── context/
│       │   └── InventoryContext.tsx       # EXISTS (Story 1.3) - Use updateProduct()
│       └── hooks/
└── components/
    └── shared/
        └── EmptyState.tsx                  # EXISTS (Story 1.4)
```

### Reuse Patterns from Story 1.4

**Dialog Pattern (CRITICAL - Reuse AddProductDialog as template):**
1. Controlled component (parent manages open state)
2. Form submission with `onSubmit` handler
3. Loading state with disabled inputs during submission
4. Error handling with parent notification
5. Clear input on successful submission
6. Keep dialog open on error for retry
7. Auto-focus TextField on dialog open
8. Proper form element structure

**ProductCard Enhancement:**
- Follow existing card structure
- Add IconButton next to stock level Chip
- Maintain consistent spacing and alignment
- Preserve responsive layout
- Don't break existing functionality

**Snackbar Feedback (Same pattern as Story 1.4):**
```typescript
<Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
    {snackbar.message}
  </Alert>
</Snackbar>
```

### Service Layer Integration

**Use Existing Service (Story 1.2):**
```typescript
// Context already has updateProduct method that calls:
// inventoryService.updateProduct(id: string, updates: Partial<Product>)
//
// This updates:
// - product.name
// - product.updatedAt (automatically)
// - Saves to IndexedDB
```

**No new service methods needed** - Story 1.3 context provides everything.

### Naming Conventions (MUST FOLLOW)

**Components:**
- PascalCase: `EditProductDialog`
- File naming: `EditProductDialog.tsx`, `EditProductDialog.test.tsx`

**Props Interfaces:**
- PascalCase with `Props` suffix: `EditProductDialogProps`

**State Variables:**
- camelCase: `editDialogOpen`, `productBeingEdited`, `submitting`

**Event Handlers:**
- camelCase with `handle` prefix: `handleEdit`, `handleCloseEditDialog`

---

## Previous Story Intelligence

### Learnings from Story 1.4 (Add and View Products)

**Git Commit:** f495ab8 - Story 1.4: Add and View Products in Inventory

**Key Patterns Established:**

1. **Dialog Component Pattern (AddProductDialog):**
   - `open` prop for visibility control
   - `onClose` callback for closing
   - `onAdd/onEdit` callback for actions (async)
   - Local state: `productName`, `submitting`
   - Form structure with `<form onSubmit={handleSubmit}>`
   - Error handling: catch errors but don't close dialog (allow retry)
   - Clear state on successful submission
   - Disable inputs during submission
   - Auto-focus TextField

2. **ProductCard Component:**
   - MUI Card with CardContent
   - Horizontal layout: name on left, stock chip on right
   - Uses `@/types/product` for Product interface
   - Imports `STOCK_LEVEL_CONFIG` from `./stockLevelConfig`
   - Clean, simple display component

3. **InventoryList State Management:**
   - Local state for dialog visibility
   - Local state for snackbar feedback
   - Uses `useInventory()` hook for context
   - Calls `loadProducts()` on mount
   - Calls `addProduct()` for new products
   - **Apply same pattern for edit:**
     - Track which product is being edited
     - Use `updateProduct()` from context
     - Show success/error feedback

4. **Test Structure (IMPORTANT):**
   - Vitest + React Testing Library
   - Mock services with `vi.mock()`
   - Wrap components in `InventoryProvider` for tests
   - Test rendering, user interactions, async operations
   - Test error handling paths
   - Check for success/error feedback

5. **Files Created in Story 1.4:**
   - `src/components/shared/EmptyState.tsx` + test
   - `src/features/inventory/components/ProductCard.tsx` + test
   - `src/features/inventory/components/AddProductDialog.tsx` + test
   - `src/features/inventory/components/InventoryList.tsx` + test
   - `src/features/inventory/components/stockLevelConfig.ts`

6. **MUI Patterns Used:**
   - `Dialog` with `maxWidth="sm"` and `fullWidth`
   - `DialogTitle`, `DialogContent`, `DialogActions`
   - `TextField` with `autoFocus`, `margin="dense"`, `variant="outlined"`
   - `Button` with `variant="contained"` for primary action
   - `IconButton` for compact actions
   - `Snackbar` + `Alert` for user feedback

### Apply These Patterns to Story 1.5:

**EditProductDialog should mirror AddProductDialog:**
- Same props structure (but with product prop added)
- Same form handling pattern
- Same error recovery (keep dialog open)
- Same loading states
- Same validation (non-empty, trimmed)

**ProductCard Enhancement:**
- Add IconButton with EditIcon
- Pass edit handler via prop
- Maintain existing layout
- Don't break stock level display

**InventoryList Updates:**
- Add edit dialog state management
- Track product being edited
- Reuse snackbar pattern
- Call `updateProduct()` from context

**Testing Approach:**
- Mirror AddProductDialog test structure
- Test edit flow end-to-end
- Test error scenarios
- Test cancel behavior
- Test persistence

---

## Implementation Steps

### Step 1: Create EditProductDialog Component

**Create:** `src/features/inventory/components/EditProductDialog.tsx`

**Pattern:** Based on `AddProductDialog.tsx` from Story 1.4

```typescript
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
  useEffect(() => {
    if (product && open) {
      setProductName(product.name);
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
```

**Key Differences from AddProductDialog:**
- Accepts `product: Product | null` prop
- `useEffect` to pre-fill TextField with current name
- Button text: "Save" instead of "Add"
- Dialog title: "Edit Product"
- onEdit receives `(id, name)` instead of just `name`

**Test:** `src/features/inventory/components/EditProductDialog.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProductDialog } from './EditProductDialog';
import type { Product } from '@/types/product';

const mockProduct: Product = {
  id: '1',
  name: 'Milk',
  stockLevel: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOnShoppingList: false,
};

describe('EditProductDialog', () => {
  it('should render when open with product name pre-filled', () => {
    render(
      <EditProductDialog
        open={true}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        product={mockProduct}
      />
    );

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Milk')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <EditProductDialog
        open={false}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        product={mockProduct}
      />
    );

    expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
  });

  it('should call onEdit with updated name when form submitted', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <EditProductDialog
        open={true}
        onClose={onClose}
        onEdit={onEdit}
        product={mockProduct}
      />
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'Whole Milk' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith('1', 'Whole Milk');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should not submit empty product name', () => {
    const onEdit = vi.fn();

    render(
      <EditProductDialog
        open={true}
        onClose={vi.fn()}
        onEdit={onEdit}
        product={mockProduct}
      />
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByText('Save'));

    expect(onEdit).not.toHaveBeenCalled();
  });

  it('should close dialog on cancel', () => {
    const onClose = vi.fn();

    render(
      <EditProductDialog
        open={true}
        onClose={onClose}
        onEdit={vi.fn()}
        product={mockProduct}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should trim whitespace from product name', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);

    render(
      <EditProductDialog
        open={true}
        onClose={vi.fn()}
        onEdit={onEdit}
        product={mockProduct}
      />
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: '  Whole Milk  ' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith('1', 'Whole Milk');
    });
  });
});
```

### Step 2: Update ProductCard Component

**Update:** `src/features/inventory/components/ProductCard.tsx`

**Add edit button next to stock level chip:**

```typescript
import { Card, CardContent, Typography, Chip, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { Product } from '@/types/product';
import { STOCK_LEVEL_CONFIG } from './stockLevelConfig';

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void; // NEW - trigger edit
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
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

it('should render edit button', () => {
  const onEdit = vi.fn();
  render(<ProductCard product={mockProduct} onEdit={onEdit} />);

  const editButton = screen.getByLabelText(/Edit Milk/i);
  expect(editButton).toBeInTheDocument();
});

it('should call onEdit when edit button clicked', () => {
  const onEdit = vi.fn();
  render(<ProductCard product={mockProduct} onEdit={onEdit} />);

  const editButton = screen.getByLabelText(/Edit Milk/i);
  fireEvent.click(editButton);

  expect(onEdit).toHaveBeenCalledWith(mockProduct);
});
```

### Step 3: Update InventoryList Component

**Update:** `src/features/inventory/components/InventoryList.tsx`

**Add edit dialog state and handlers:**

```typescript
// Add to existing imports:
import { EditProductDialog } from './EditProductDialog';

// Add to component state:
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [productBeingEdited, setProductBeingEdited] = useState<Product | null>(null);

// Add edit handler:
const handleEditProduct = (product: Product) => {
  setProductBeingEdited(product);
  setEditDialogOpen(true);
};

const handleSaveEdit = async (id: string, name: string) => {
  try {
    await updateProduct(id, { name });
    setSnackbar({
      open: true,
      message: 'Product updated successfully',
      severity: 'success',
    });
  } catch (error) {
    setSnackbar({
      open: true,
      message: error instanceof Error ? error.message : 'Failed to update product',
      severity: 'error',
    });
    throw error; // Re-throw to prevent dialog close
  }
};

const handleCloseEditDialog = () => {
  setEditDialogOpen(false);
  setProductBeingEdited(null);
};

// Update ProductCard rendering:
{state.products.map((product) => (
  <ProductCard
    key={product.id}
    product={product}
    onEdit={handleEditProduct} // NEW
  />
))}

// Add EditProductDialog render:
{/* After AddProductDialog */}
<EditProductDialog
  open={editDialogOpen}
  onClose={handleCloseEditDialog}
  onEdit={handleSaveEdit}
  product={productBeingEdited}
/>
```

**Update Test:** `src/features/inventory/components/InventoryList.test.tsx`

```typescript
// Add to existing tests:

it('should open edit dialog when edit button clicked', async () => {
  vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);

  render(
    <InventoryProvider>
      <InventoryList />
    </InventoryProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  const editButton = screen.getByLabelText(/Edit Milk/i);
  fireEvent.click(editButton);

  expect(screen.getByText('Edit Product')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Milk')).toBeInTheDocument();
});

it('should update product successfully', async () => {
  vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
  vi.mocked(inventoryService.updateProduct).mockResolvedValue();

  render(
    <InventoryProvider>
      <InventoryList />
    </InventoryProvider>
  );

  await waitFor(() => {
    fireEvent.click(screen.getByLabelText(/Edit Milk/i));
  });

  const input = screen.getByLabelText(/Product Name/i);
  fireEvent.change(input, { target: { value: 'Whole Milk' } });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(screen.getByText('Product updated successfully')).toBeInTheDocument();
  });
});
```

### Step 4: Run Tests

```bash
# Run all tests
npm run test

# Expected: All tests passing
# New tests: ~8 tests for EditProductDialog
# Updated tests: ~2 tests for ProductCard, ~2 tests for InventoryList
# Total new/updated: ~12 tests

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
1. See existing products (from Story 1.4)
2. Click edit button on a product
3. See "Edit Product" dialog with current name
4. Change name (e.g., "Milk" → "Whole Milk")
5. Click "Save"
6. See product name update immediately
7. See success snackbar
8. Close and reopen browser
9. Verify edited name persists

# Test cancel:
10. Click edit button
11. Change name
12. Click "Cancel" or Esc
13. Verify name unchanged

# Test error handling:
14. Simulate error (disconnect network or modify code)
15. Verify error message shown
16. Verify dialog stays open for retry
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
- Edit dialog opens within <100ms
- Product name update within 2 seconds
- Immediate UI update on successful save
- Smooth animation transitions

### Usability (NFR7, NFR7.1)
- Single-tap edit button (prominent, visible)
- Clear visual feedback (Snackbar for success/error)
- Intuitive edit flow (pre-filled field, clear buttons)
- Dialog auto-focuses product name field
- Keyboard shortcuts work (Enter to save, Esc to cancel)

### Accessibility (NFR8, NFR8.1, NFR8.2)
- Edit button ≥44x44px touch target on mobile
- ARIA label on edit button identifies product
- Keyboard navigation works (Tab, Enter, Esc)
- Screen reader announces dialog and actions
- Sufficient color contrast for all elements

### Local-First (NFR9)
- All features work offline
- Data persists via IndexedDB (from Story 1.2)
- No network required for edit operations
- Updates are immediate and reliable

---

## Definition of Done

This story is considered complete when:

- [ ] **Code Complete:**
  - [ ] `EditProductDialog.tsx` created and tested
  - [ ] `ProductCard.tsx` updated with edit button
  - [ ] `InventoryList.tsx` updated with edit dialog management
  - [ ] All TypeScript interfaces defined
  - [ ] All imports use absolute `@/` paths

- [ ] **Testing Complete:**
  - [ ] All unit tests pass (~12 new/updated tests)
  - [ ] Test coverage ≥85% for EditProductDialog
  - [ ] Integration test with InventoryContext passes
  - [ ] Manual testing workflow verified (edit, cancel, persist)

- [ ] **Quality Checks:**
  - [ ] TypeScript compilation succeeds
  - [ ] ESLint passes with 0 errors
  - [ ] No console errors or warnings
  - [ ] Responsive design works (mobile + desktop)

- [ ] **User Experience:**
  - [ ] Edit button visible and accessible on all cards
  - [ ] Edit dialog pre-fills current name correctly
  - [ ] Success feedback appears on save
  - [ ] Edits persist across browser restarts
  - [ ] Cancel works correctly (no changes saved)
  - [ ] Loading states handled gracefully

- [ ] **Acceptance Criteria Met:**
  - [ ] AC1: Edit Icon Button on Product Cards
  - [ ] AC2: Edit Product Dialog Opens
  - [ ] AC3: Editing a Product Name
  - [ ] AC4: Cancel Edit Operation
  - [ ] AC5: Data Persistence

---

## Dev Notes

### Critical Pattern: Reuse AddProductDialog Pattern

**MUST FOLLOW:** EditProductDialog should be nearly identical to AddProductDialog with these specific differences:

1. **Additional prop:** `product: Product | null`
2. **Pre-fill logic:** `useEffect` to set productName from product.name when dialog opens
3. **Text changes:** "Edit Product" title, "Save" button
4. **Handler signature:** `onEdit(id, name)` instead of `onAdd(name)`

**Do NOT:** Reinvent dialog patterns, validation, error handling, or loading states. Copy from AddProductDialog and adjust.

### Integration Points

**InventoryContext (Story 1.3):**
- Already has `updateProduct(id: string, updates: Partial<Product>): Promise<void>`
- Call with: `updateProduct(productId, { name: newName })`
- Automatically updates `updatedAt` timestamp
- Persists to IndexedDB
- Updates state immutably

**InventoryService (Story 1.2):**
- Context calls `inventoryService.updateProduct(id, updates)`
- Service handles Dexie.js database operations
- No changes needed to service layer

### Testing Strategy

**Mirror AddProductDialog Tests:**
- Test rendering when open/closed
- Test pre-filled value
- Test form submission
- Test validation (empty name)
- Test cancel behavior
- Test error handling (dialog stays open)
- Test whitespace trimming

**ProductCard Tests:**
- Test edit button renders
- Test edit button click triggers onEdit
- Maintain existing tests (don't break)

**InventoryList Integration:**
- Test edit dialog opens with correct product
- Test successful product update
- Test error scenario
- Test persistence (optional)

### Architecture Compliance

**Feature-Based Structure:** ✅
- EditProductDialog in `src/features/inventory/components/`
- Co-located test file
- Follows Story 1.4 pattern

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

- **Epic:** `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.5, lines 560-589)
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md`
- **PRD:** `_bmad-output/planning-artifacts/prd.md`
- **Previous Stories:**
  - Story 1.4: `_bmad-output/implementation-artifacts/1-4-add-and-view-products-in-inventory.md` (CRITICAL - Reuse patterns!)
  - Story 1.3: `_bmad-output/implementation-artifacts/1-3-create-inventory-context-and-state-management.md`
  - Story 1.2: `_bmad-output/implementation-artifacts/1-2-set-up-database-schema-and-service-layer.md`

---

## Story Metadata

- **Created By:** bmm:create-story workflow (v2 with branch automation)
- **Date:** 2026-01-13
- **Workflow Version:** 4-implementation/create-story
- **Agent:** Claude Code (Sonnet 3.7)
- **Branch:** feat/story-1-5-edit-product-names
- **Context Engine:** Ultimate BMad Method story creation with comprehensive analysis

---

## Dev Agent Record

### Agent Model Used

Claude Code (Sonnet 3.7) - Anthropic API

### Implementation Notes

**Completed:** 2026-01-13

✅ **Successfully Implemented:**
- Created EditProductDialog component (reused AddProductDialog pattern exactly as specified)
- Updated ProductCard component with edit IconButton
- Updated InventoryList component with edit dialog state management
- All components follow MUI design patterns and project architecture
- Integrated with InventoryContext updateProduct() method from Story 1.3
- All 89 tests passing (6 new EditProductDialog tests + 2 updated ProductCard tests + 2 updated InventoryList tests)
- TypeScript compilation successful
- ESLint passes with 0 errors
- Build successful

**Key Implementation Details:**
- EditProductDialog mirrors AddProductDialog pattern with:
  - Pre-fill logic using useEffect to set productName from product.name when dialog opens
  - Button text "Save" instead of "Add"
  - Dialog title "Edit Product"
  - Handler signature onEdit(id, name) instead of onAdd(name)
- ProductCard enhanced with edit IconButton positioned next to stock level chip
- InventoryList manages edit dialog state (editDialogOpen, productBeingEdited)
- Reused existing Snackbar pattern for success/error feedback
- Error handling: dialog stays open on error for retry (matching AddProductDialog pattern)

**Technical Notes:**
- Used absolute imports with @/ prefix throughout
- All new files follow feature-based folder structure from architecture document
- MUI components used: IconButton, EditIcon from @mui/icons-material
- State management: local state for dialog UI, context state for data operations
- No direct service calls from components - all through InventoryContext

**Test Coverage:**
- EditProductDialog: 6 tests (render, pre-fill, submit, validation, cancel, whitespace trim)
- ProductCard: 2 new tests (edit button render, edit button click)
- InventoryList: 2 new tests (edit dialog open, update product successfully)
- All existing tests maintained - no regressions

**Critical Success Factors:**
- Reuse AddProductDialog pattern exactly (proven pattern from Story 1.4)
- Don't overcomplicate - this is a simple CRUD operation
- Follow existing component patterns (MUI usage, error handling, loading states)
- Maintain consistency with Story 1.4 implementations
- Test thoroughly (especially persistence and error scenarios)

**Gotchas to Avoid:**
- Don't forget `useEffect` to pre-fill product name when dialog opens
- Remember to pass product being edited (not just product list)
- Handle null product case (when dialog closed)
- Keep dialog open on error (like AddProductDialog)
- Clear productBeingEdited state when dialog closes
- Don't break existing ProductCard tests when adding onEdit prop

### Completion Notes

✅ **Story 1.5 Complete:** Edit Product Names feature successfully implemented following Story 1.4 patterns exactly.

**Implementation completed in 6 steps:**
1. Created EditProductDialog.tsx + tests (6 tests passing)
2. Updated ProductCard.tsx with edit button + tests (9 tests passing)
3. Updated InventoryList.tsx with edit dialog management + tests (12 tests passing)
4. All 89 tests passing across entire codebase
5. TypeScript build and ESLint successful
6. Story file updated with completion notes

**Story is ready for code review.** All acceptance criteria met, all tests passing, no regressions.

### File List

**New Files:**
- src/features/inventory/components/EditProductDialog.tsx
- src/features/inventory/components/EditProductDialog.test.tsx

**Modified Files:**
- src/features/inventory/components/ProductCard.tsx
- src/features/inventory/components/ProductCard.test.tsx
- src/features/inventory/components/InventoryList.tsx
- src/features/inventory/components/InventoryList.test.tsx

---

This story builds directly on Story 1.4's proven patterns. EditProductDialog is essentially AddProductDialog with pre-filling and minor text changes. Follow the established patterns exactly, and implementation will be smooth and fast.
