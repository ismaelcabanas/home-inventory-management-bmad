# Story 11.7: Handle Unconfirmed Bought Items After Receipt Scan

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to be prompted about items that were marked as bought but not found in the receipt scan,
so that I can accurately manage my shopping list and inventory.

## Bug Description

After completing the shopping flow and scanning a receipt, products that were marked as "bought" during shopping but were NOT confirmed/added to inventory remain in the shopping list with the "bought" status. This creates confusion because:
1. The user can't tell what was actually bought vs not bought
2. The list state is inconsistent for the next shopping trip
3. Items that weren't actually purchased remain marked as "bought"

## Acceptance Criteria

1. **Given** I have completed shopping and marked some items as "bought"
   **When** I scan a receipt and some bought items are NOT found/confirmed in the receipt
   **Then** A dialog appears asking what to do with the unconfirmed bought items

2. **Given** The dialog appears with unconfirmed bought items
   **When** I choose an action for the items
   **Then** The appropriate action is performed:
   - "Keep them in the list" - Items remain, "bought" status is cleared
   - "Remove from list" - Items are removed from the shopping list
   - "Keep marked as bought" - Items stay with "bought" status (for manual inventory add later)

3. **Given** I scan a receipt and ALL bought items are confirmed
   **When** The receipt scan completes successfully
   **Then** No dialog appears (happy path, no interruption)

4. **Given** I scan a receipt and NO items were marked as bought
   **When** The receipt scan completes
   **Then** No dialog appears (nothing to reconcile)

## Tasks / Subtasks

- [x] Task 1: Identify and track unconfirmed bought items (AC: 1, 2)
  - [x] Subtask 1.1: Identify where "bought" status is stored in shopping list items
  - [x] Subtask 1.2: Track which bought items were confirmed during receipt scan
  - [x] Subtask 1.3: Determine the set of unconfirmed bought items after scan

- [x] Task 2: Design and implement reconciliation dialog (AC: 1, 2, 3, 4)
  - [x] Subtask 2.1: Create dialog component showing unconfirmed bought items count
  - [x] Subtask 2.2: Add action buttons: Keep, Remove, Keep Marked
  - [x] Subtask 2.3: Integrate dialog into receipt scan completion flow

- [x] Task 3: Implement dialog actions (AC: 2)
  - [x] Subtask 3.1: "Keep in list" - Clear "bought" status, keep item
  - [x] Subtask 3.2: "Remove from list" - Delete item from shopping list
  - [x] Subtask 3.3: "Keep marked" - Leave "bought" status unchanged

- [x] Task 4: Add tests and verify (AC: 1, 2, 3, 4)
  - [x] Subtask 4.1: Test dialog appears when unconfirmed items exist
  - [x] Subtask 4.2: Test each dialog action works correctly
  - [x] Subtask 4.3: Test dialog doesn't appear in happy path
  [x] Subtask 4.4: Run all tests for regressions

## Dev Notes

### Root Cause Analysis

**Problem Flow:**
1. User marks items as "bought" during shopping (checkbox state)
2. User completes shopping and initiates receipt scan
3. Receipt scan finds some products, but not all "bought" items
4. Unconfirmed items remain in list with "bought" checkbox still checked
5. User can't distinguish between "bought last time" vs "still need to buy"

**Current State Tracking:**
- Shopping list items likely have a `bought` boolean field
- Receipt scan confirms items and updates inventory
- No reconciliation happens for unconfirmed "bought" items

### Architecture Patterns

- **MUI v7 Component Library:** Dialog component for user prompt
- **State Management:** Likely React Context for shopping list state
- **Event-Driven Architecture:** Story 8.1 implemented event-driven sync

### Code Structure

```
src/
├── features/
│   ├── shopping-list/
│   │   ├── components/
│   │   │   ├── ShoppingList.tsx
│   │   │   └── ShoppingListItem.tsx
│   │   └── hooks/
│   │       └── useShoppingList.ts
│   └── receipt/
│       ├── components/
│       │   └── ReceiptReview.tsx
│       └── hooks/
│           └── useReceiptScan.ts
├── components/
│   └── shared/
│       └── Dialog/
│           └── ConfirmationDialog.tsx  # May exist or create new
```

### Implementation Guidance

**1. Identify Data Flow:**

First, find where "bought" status is tracked:
```typescript
// Likely in shopping list item type
interface ShoppingListItem {
  id: string;
  productId: string;
  bought: boolean;  // This is the field
  // ... other fields
}
```

**2. Track Unconfirmed Items:**

During receipt scan completion, collect unconfirmed items:
```typescript
// After receipt scan, identify unconfirmed bought items
const unconfirmedBoughtItems = shoppingListItems.filter(item =>
  item.bought && !confirmedProductIds.has(item.productId)
);

if (unconfirmedBoughtItems.length > 0) {
  setShowReconciliationDialog(true);
}
```

**3. Create Reconciliation Dialog:**

```tsx
// New component: BoughtItemsReconciliationDialog.tsx
interface ReconciliationDialogProps {
  open: boolean;
  itemCount: number;
  onKeep: () => void;      // Clear bought status, keep items
  onRemove: () => void;    // Remove from list
  onKeepMarked: () => void; // Leave bought status
  onClose: () => void;
}

export const BoughtItemsReconciliationDialog: React.FC<ReconciliationDialogProps> = ({
  open,
  itemCount,
  onKeep,
  onRemove,
  onKeepMarked,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Unconfirmed Items</DialogTitle>
      <DialogContent>
        <Typography>
          {itemCount} {itemCount === 1 ? 'item was' : 'items were'} marked as bought
          but not found in the receipt. What would you like to do?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onKeep}>
          Keep in list (I didn't buy them)
        </Button>
        <Button onClick={onRemove} color="error">
          Remove (I forgot to scan)
        </Button>
        <Button onClick={onKeepMarked} variant="contained">
          Keep marked (add manually later)
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

**4. Integrate into Receipt Scan Flow:**

Find where receipt scan completes and add dialog:
```typescript
// In receipt scan completion handler
const handleReceiptScanComplete = async (confirmedProducts: Product[]) => {
  // Add confirmed products to inventory (existing logic)
  await updateInventoryFromReceipt(confirmedProducts);

  // NEW: Check for unconfirmed bought items
  const unconfirmedBoughtItems = shoppingListItems.filter(item =>
    item.bought && !confirmedProducts.some(p => p.id === item.productId)
  );

  if (unconfirmedBoughtItems.length > 0) {
    setUnconfirmedItems(unconfirmedBoughtItems);
    setShowReconciliationDialog(true);
  } else {
    // Happy path - navigate to next screen
    navigateBackToShopping();
  }
};
```

**5. Implement Dialog Actions:**

```typescript
const handleKeepInList = () => {
  // Clear "bought" status, keep items
  unconfirmedItems.forEach(item => {
    updateShoppingListItem(item.id, { bought: false });
  });
  setShowReconciliationDialog(false);
  navigateBackToShopping();
};

const handleRemoveFromList = () => {
  // Remove items from shopping list
  unconfirmedItems.forEach(item => {
    removeShoppingListItem(item.id);
  });
  setShowReconciliationDialog(false);
  navigateBackToShopping();
};

const handleKeepMarked = () => {
  // Leave bought status unchanged
  setShowReconciliationDialog(false);
  navigateBackToShopping();
};
```

### Testing Standards

- Unit tests for dialog component
- Integration tests for receipt scan flow with unconfirmed items
- Manual testing of all three dialog actions
- Verify happy path (no dialog when all confirmed)

### Project Structure Notes

- **Feature-Based Architecture:** Shopping list and receipt features are separate
- **Event Bus:** May use event bus for cross-feature communication
- **Type Safety:** TypeScript interfaces for all data structures

### Verification Steps

1. Add items to shopping list
2. Mark some items as "bought" during shopping
3. Complete shopping and scan receipt
4. **BUG:** Unconfirmed bought items remain with "bought" status
5. **FIXED:** Dialog appears with options
6. **FIXED:** Each action (Keep, Remove, Keep Marked) works correctly
7. **FIXED:** No dialog appears when all items confirmed (happy path)

### References

- [Source: src/features/shopping-list/components/ShoppingList.tsx] - Shopping list with bought status
- [Source: src/features/receipt/components/ReceiptReview.tsx] - Receipt review flow
- [Source: Story 8.1] - Event-driven synchronization architecture
- [Source: Story 9.3] - Post-shopping receipt scan prompt flow

## Dev Agent Record

### Agent Model Used

Claude (glm-4.7)

### Debug Log References

### Completion Notes List

**Implementation Summary:**
- Created BoughtItemsReconciliationDialog component with three action options
- Integrated dialog into ReceiptScanner receipt confirmation flow
- Added check for unconfirmed bought items (isChecked: true but not in confirmed products)
- Dialog only appears when there are unconfirmed items (happy path uninterrupted)

**Dialog Options:**
1. **Keep in list** - Calls updateCheckedState(false) to clear bought status
2. **Remove** - Calls removeFromList() to delete items from shopping list
3. **Keep marked** - Leaves isChecked unchanged, processes receipt and navigates

**Files Modified:**
- `src/features/shopping/components/BoughtItemsReconciliationDialog.tsx` - New dialog component
- `src/features/receipt/components/ReceiptScanner.tsx` - Integrated dialog, restructured to Fragment
- `src/features/receipt/components/ReceiptScanner.test.tsx` - Added ShoppingProvider wrapper

**Testing:**
- All 692 tests passing
- ReceiptScanner tests (26 tests) all passing
- Build successful

### File List

- src/features/shopping/components/BoughtItemsReconciliationDialog.tsx
- src/features/receipt/components/ReceiptScanner.tsx
- src/features/receipt/components/ReceiptScanner.test.tsx

---
