# Story 11.9: Add Products by Photo - Empty Inventory Feature

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **new user**,
I want to quickly add products to my empty inventory by scanning a receipt,
so that I can populate my inventory faster without manually adding each product.

## User Story Context

When users first open the app with an empty inventory, they see an empty state with a message telling them to add products. Currently, they can only add products manually one by one. This feature adds a "Scan receipt to add products" button that provides a faster, more convenient way to populate the initial inventory.

This is a **feature enhancement** (not a bug fix) that improves the onboarding experience for new users.

## Acceptance Criteria

1. **Given** My inventory is empty (0 products)
   **When** I view the inventory page
   **Then** I see TWO buttons:
     - Primary: "Add your first product" (existing manual flow)
     - Secondary: "Scan receipt to add products" (NEW photo flow)

2. **Given** My inventory is empty
   **When** I tap "Scan receipt to add products"
   **Then** The receipt scanner opens in **quick-add mode** (?mode=quick-add)
   **And** The camera activates immediately

3. **Given** I am in quick-add mode
   **When** I take a photo of a receipt
   **Then** OCR processes the receipt
   **And** Products are found: System automatically adds them to inventory (NO review screen)
   **And** I see the success screen with products added

4. **Given** I am in quick-add mode
   **When** OCR finds no products in the receipt
   **Then** I see a "No Products Found" error message
   **And** I can retry scanning or go to inventory

5. **Given** Products were successfully added in quick-add mode
   **When** I tap "View Inventory"
   **Then** My inventory shows all the products from the receipt
   **And** All products have stock level set to "High"

## Tasks / Subtasks

- [x] Task 1: Add secondary button support to EmptyState component (AC: 1)
  - [x] Subtask 1.1: Add `secondaryActionLabel` and `onSecondaryAction` props to EmptyState
  - [x] Subtask 1.2: Implement responsive button layout (column on mobile, row on desktop)
  - [x] Subtask 1.3: Style secondary button with outlined variant and camera icon

- [x] Task 2: Update InventoryList empty state with photo button (AC: 1, 2)
  - [x] Subtask 2.1: Import useNavigate from react-router-dom
  - [x] Subtask 2.2: Add secondary action to empty state
  - [x] Subtask 2.3: Navigate to `/scan?mode=quick-add` on button tap

- [x] Task 3: Implement quick-add mode in ReceiptScanner (AC: 2, 3, 4, 5)
  - [x] Subtask 3.1: Parse URL search params for `mode=quick-add`
  - [x] Subtask 3.2: Auto-proceed through review step when products found
  - [x] Subtask 3.3: Handle "no products found" case with custom error UI
  - [x] Subtask 3.4: Provide retry and navigation options on error

- [x] Task 4: Update tests for EmptyState component (AC: 1)
  - [x] Subtask 4.1: Add tests for secondary button rendering
  - [x] Subtask 4.2: Add tests for secondary button click handler
  - [x] Subtask 4.3: Add tests for backward compatibility (single button)

## Dev Notes

### Feature Type

This is a **feature enhancement** for Epic 11 (originally "Production Bug Fixes" but expanded to include UX improvements). This story improves the onboarding experience for new users.

### Architecture Patterns

- **React Router:** Use `useNavigate` and `useSearchParams` for navigation and mode detection
- **Component Props:** EmptyState component now supports optional secondary action
- **URL Parameters:** Quick-add mode triggered by `?mode=quick-add` query parameter
- **Conditional Rendering:** ReceiptScanner shows different UI based on mode

### Code Structure

```
src/
├── components/shared/
│   ├── EmptyState.tsx              # ← ADD secondary button props
│   └── EmptyState.test.tsx         # ← ADD tests for secondary button
├── features/inventory/components/
│   └── InventoryList.tsx           # ← ADD secondary action to empty state
└── features/receipt/components/
    └── ReceiptScanner.tsx          # ← ADD quick-add mode detection and flow
```

### Implementation Guidance

**Step 1: Modify EmptyState.tsx**

```typescript
// Add new optional props
export interface EmptyStateProps {
  // ... existing props
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

// Render both buttons when secondary action provided
<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
  {/* Primary button (contained) */}
  {/* Secondary button (outlined with camera icon) */}
</Box>
```

**Step 2: Update InventoryList.tsx**

```typescript
import { useNavigate } from 'react-router-dom';

export function InventoryList() {
  const navigate = useNavigate();

  return (
    <EmptyState
      title="Your inventory is empty"
      message="Start by adding your first product..."
      actionLabel="Add your first product"
      onAction={() => setDialogOpen(true)}
      secondaryActionLabel="Scan receipt to add products"
      onSecondaryAction={() => navigate('/scan?mode=quick-add')}
    />
  );
}
```

**Step 3: Add Quick-Add Mode to ReceiptScanner.tsx**

```typescript
import { useSearchParams } from 'react-router-dom';

export function ReceiptScanner() {
  const [searchParams] = useSearchParams();
  const [isQuickAddMode, setIsQuickAddMode] = useState(false);

  // Detect quick-add mode on mount
  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsQuickAddMode(mode === 'quick-add');
  }, [searchParams]);

  // Auto-proceed when in quick-add mode and products found
  useEffect(() => {
    if (isQuickAddMode && state.ocrState === 'review' && state.productsInReview.length > 0) {
      // Auto-confirm and update inventory
      const products = state.productsInReview.map(p => ({ ...p, isCorrect: true }));
      confirmReview();
      await updateInventoryFromReceipt(products);
    }
  }, [isQuickAddMode, state.ocrState, state.productsInReview]);

  // Show "No Products Found" error in quick-add mode
  if (isQuickAddMode && state.ocrState === 'review' && state.productsInReview.length === 0) {
    return <NoProductsFoundError onRetry={resetReceipt} onGoBack={() => navigate('/')} />;
  }

  // Skip review screen in quick-add mode
  if (isQuickAddMode && state.ocrState === 'review') {
    return null; // useEffect handles auto-proceed
  }
}
```

### Edge Cases

1. **OCR fails during quick-add:** Show error with retry option
2. **No products found:** Show "No Products Found" message with retry/back options
3. **User cancels mid-flow:** Normal receipt scanner cancellation flow
4. **Network error:** Use existing error handling in ReceiptScanner

### Testing Standards

- Unit tests for EmptyState secondary button functionality
- Test both buttons render and click independently
- Test backward compatibility (single button still works)
- Manual testing of quick-add flow end-to-end

### Previous Story Intelligence (11.8)

Story 11.8 dealt with clearing bought status when items are removed from shopping list. Key learnings:
- ShoppingService methods need to clear ALL relevant flags
- Defense in depth - be explicit about state initialization
- Future-proof against other code paths

For this story (11.9):
- Be explicit about mode detection (use `useSearchParams`)
- Ensure quick-add mode doesn't break normal receipt scanner flow
- Clear separation between quick-add and normal modes

### Git Intelligence

Recent commits show patterns:
- Feature branches: `feat/story-XX-YYYY-description`
- Commit messages follow conventional commit format
- All changes tested before commit

### Project Structure Notes

- **Shared Components:** EmptyState is used across multiple features
- **Feature-Based Structure:** Components organized by feature domain
- **Type Safety:** Props interfaces explicitly defined

### References

- **EmptyState Component:** [Source: src/components/shared/EmptyState.tsx]
- **Inventory List:** [Source: src/features/inventory/components/InventoryList.tsx]
- **Receipt Scanner:** [Source: src/features/receipt/components/ReceiptScanner.tsx]
- **Receipt Context:** [Source: src/features/receipt/context/ReceiptContext.tsx]
- **Related:** Story 5.3 - Receipt Review UI (existing normal flow)
- **Related:** Story 6.1 - Update inventory from confirmed products

## Dev Agent Record

### Agent Model Used

Claude (glm-4.7)

### Debug Log References

### Completion Notes List

**Implementation Status: COMPLETED (Retroactively)**

This story was implemented BEFORE the formal story creation workflow. The following changes were already made:

**Files Modified:**
1. `src/components/shared/EmptyState.tsx`
   - Added `secondaryActionLabel` and `onSecondaryAction` props
   - Implemented responsive button layout (column on mobile, row on desktop)
   - Secondary button uses outlined variant with camera emoji icon

2. `src/features/inventory/components/InventoryList.tsx`
   - Added `useNavigate` import from react-router-dom
   - Updated empty state to include secondary action button
   - Secondary action navigates to `/scan?mode=quick-add`

3. `src/features/receipt/components/ReceiptScanner.tsx`
   - Added `useSearchParams` to read URL parameters
   - Detects `mode=quick-add` parameter on mount
   - Auto-proceeds through review step when products found
   - Directly updates inventory without showing review screen
   - Clears shopping list after successful scan
   - Shows custom "No Products Found" message when OCR returns no products
   - Provides "Try Again" and "Go to Inventory" options on error

4. `src/components/shared/EmptyState.test.tsx`
   - Added comprehensive tests for secondary button functionality
   - Tests verify both buttons render correctly
   - Tests verify click handlers work independently
   - Tests verify backward compatibility with single button

**Testing Results:**
- All EmptyState tests pass (10/10)
- All ReceiptScanner tests pass (26/26)
- TypeScript compilation successful
- Production build successful
- No breaking changes to existing functionality

**User Flow Implemented:**
1. User views empty inventory page
2. User sees two buttons: "Add your first product" (manual) and "Scan receipt to add products" (photo)
3. Tapping "Scan receipt" opens camera at `/scan?mode=quick-add`
4. OCR processes the receipt
5. If products found: directly adds to inventory and shows success
6. If no products found: shows error message with retry option
7. User returned to inventory page with products added

**Note:** This story is being created retroactively to document the implementation that was completed before following the formal BMAD workflow.

**Test Fix Applied (2026-04-10):**
- Fixed InventoryList.test.tsx to wrap component with BrowserRouter
- This was required because InventoryList now uses useNavigate() hook
- All tests passing: 703/703

### File List

- src/components/shared/EmptyState.tsx
- src/components/shared/EmptyState.test.tsx
- src/features/inventory/components/InventoryList.tsx
- src/features/inventory/components/InventoryList.test.tsx
- src/features/receipt/components/ReceiptScanner.tsx

---
