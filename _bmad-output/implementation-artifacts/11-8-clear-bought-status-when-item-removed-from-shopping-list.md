# Story 11.8: Clear Bought Status When Item Removed from Shopping List

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want items that are removed from the shopping list to have their "bought" status cleared,
so that when they are re-added later, they start in a fresh "not bought" state.

## Bug Description

When an item is removed from the shopping list, its `isChecked` (bought) status is NOT cleared. If the same product runs low again and is automatically re-added to the shopping list, it appears with the "bought" checkbox still checked from the previous shopping session.

### Problem Flow

1. Product runs low → Auto-added to shopping list (isChecked: false) ✓
2. User marks product as "bought" (isChecked: true) ✓
3. User removes product from shopping list (isOnShoppingList: false, but isChecked: true persists) ✗
4. Product runs low again → Auto-added to shopping list (isOnShoppingList: true, isChecked: still true) ✗

### Root Cause

The `removeFromList()` method in `src/services/shopping.ts` only sets `isOnShoppingList: false` but does NOT clear the `isChecked` flag.

## Acceptance Criteria

1. **Given** An item is marked as "bought" in the shopping list
   **When** I remove the item from the shopping list
   **Then** Both `isOnShoppingList` AND `isChecked` are set to false

2. **Given** An item was previously removed with "bought" status
   **When** The product runs low and is auto-added to the shopping list again
   **Then** The item appears with "bought" checkbox UNCHECKED (fresh state)

3. **Given** I manually add an item to the shopping list
   **When** The item is added
   **Then** The "bought" checkbox is always UNCHECKED (regardless of previous state)

## Tasks / Subtasks

- [ ] Task 1: Fix removeFromList to clear isChecked (AC: 1, 2)
  - [ ] Subtask 1.1: Update `removeFromList()` in shopping.ts to set `isChecked: false`
  - [ ] Subtask 1.2: Verify database update clears both flags

- [ ] Task 2: Ensure addToList always initializes isChecked as false (AC: 3)
  - [ ] Subtask 2.1: Update `addToList()` in shopping.ts to explicitly set `isChecked: false`
  - [ ] Subtask 2.2: Verify new items always start unchecked

- [ ] Task 3: Add tests and verify fix (AC: 1, 2, 3)
  - [ ] Subtask 3.1: Add unit test for removeFromList clearing isChecked
  - [ ] Subtask 3.2: Add unit test for addToList initializing isChecked
  - [ ] Subtask 3.3: Manually test the full flow (mark bought, remove, re-add)
  - [ ] Subtask 3.4: Run all tests for regressions

## Dev Notes

### Root Cause Analysis

**Current Code (BUGGY):**
```typescript
// src/services/shopping.ts line 65-78
async removeFromList(productId: string): Promise<void> {
  await db.products.update(productId, {
    isOnShoppingList: false,  // ✅ Cleared
    // isChecked: NOT CLEARED ❌
  });
}
```

**What Happens:**
1. User marks item as "bought" → `isChecked: true`
2. User removes item → `isOnShoppingList: false`, but `isChecked: true` persists
3. Item auto-added later → `isOnShoppingList: true`, `isChecked: still true` from before

### Architecture Patterns

- **Dexie.js:** Database ORM for IndexedDB
- **Service Layer:** ShoppingService handles all shopping list operations
- **Transaction Safety:** Updates are single-field operations

### Code Structure

```
src/
└── services/
    ├── shopping.ts           # ShoppingService class
    │   ├── addToList()
    │   ├── removeFromList()   # ← FIX HERE
    │   └── updateCheckedState()
    └── shopping.test.ts      # Unit tests
```

### Implementation Guidance

**Fix 1: Update removeFromList()**

```typescript
// src/services/shopping.ts line 65-78
async removeFromList(productId: string): Promise<void> {
  try {
    logger.debug('Removing product from shopping list', { productId });

    // Clear BOTH flags when removing from list
    await db.products.update(productId, {
      isOnShoppingList: false,
      isChecked: false,  // ✅ Clear the "bought" status
    });

    logger.info('Product removed from shopping list', { productId });
  } catch (error) {
    const appError = handleError(error);
    logger.error('Failed to remove product from shopping list', appError.details);
    throw appError;
  }
}
```

**Fix 2: Update addToList() to be explicit (recommended)**

```typescript
// src/services/shopping.ts line 50-63
async addToList(productId: string): Promise<void> {
  try {
    logger.debug('Adding product to shopping list', { productId });

    // Explicitly set both flags
    await db.products.update(productId, {
      isOnShoppingList: true,
      isChecked: false,  // ✅ Always start as not bought
    });

    logger.info('Product added to shopping list', { productId });
  } catch (error) {
    const appError = handleError(error);
    logger.error('Failed to add product to shopping list', appError.details);
    throw appError;
  }
}
```

**Why Fix 2 is recommended:**
- Defense in depth - even if isChecked wasn't cleared on removal, adding always resets it
- Makes intent explicit - new items should never be "pre-bought"
- Future-proof against other code paths that might add items

### Testing Standards

- Unit tests for both service methods
- Test directly verifies database state
- Manual testing of full user flow

### Project Structure Notes

- **Service Layer:** All database operations go through services
- **Type Safety:** Product type includes both `isOnShoppingList` and `isChecked` fields
- **Test Coverage:** Existing tests in `shopping.test.ts`

### Verification Steps

1. Add product to inventory with Low stock → Auto-added to shopping list
2. Mark product as "bought" (checkbox checked)
3. Remove product from shopping list
4. Change product stock to Low again → Auto-added to shopping list
5. **BUG:** Product appears with checkbox already checked
6. **FIXED:** Product appears with checkbox UNCHECKED
7. **FIXED:** Manual removal and re-add also starts unchecked

### References

- **Bug Location:** [Source: src/services/shopping.ts#L65-L78] - removeFromList method
- **Related:** [Source: src/services/shopping.ts#L50-L63] - addToList method
- **Tests:** [Source: src/services/shopping.test.ts] - Existing unit tests
- **Related Issue:** Story 11.7 - Also deals with bought status persistence

## Dev Agent Record

### Agent Model Used

Claude (glm-4.7)

### Debug Log References

### Completion Notes List

### File List

---
