# Story 11.5: Fix Remove Item Functionality in Shopping Page

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to remove items from my shopping list when needed,
so that I can manage my shopping list accurately.

## Bug Description

The remove item button/functionality in the shopping page does not work, preventing users from removing unwanted items from their shopping list.

## Acceptance Criteria

1. **Given** I am viewing the shopping list
   **When** I tap the remove button/icon for an item
   **Then** The item is immediately removed from the shopping list
   **And** The shopping list updates to reflect the removal
   **And** The item count decreases by one

2. **Given** I remove an item from the shopping list
   **When** The removal is processed
   **Then** The change persists across navigation and app restarts
   **And** The item no longer appears in the shopping list

3. **Given** I accidentally remove an item
   **When** I want to add it back
   **Then** I can manually add the item again through the inventory or shopping list
   **And** The item appears in the shopping list as expected

## Tasks / Subtasks

- [x] Task 1: Investigate remove button implementation (AC: 1)
  - [x] Subtask 1.1: Locate remove button in ShoppingListItem component
  - [x] Subtask 1.2: Check if event handler is wired correctly
  - [x] Subtask 1.3: Check for JavaScript errors in console when clicking remove

- [x] Task 2: Fix remove functionality (AC: 1, 2)
  - [x] Subtask 2.1: Ensure event handler calls ShoppingContext.removeFromList
  - [x] Subtask 2.2: Verify state updates correctly after removal
  - [x] Subtask 2.3: Verify removal persists to database (IndexedDB)

- [x] Task 3: Add visual feedback and verify (AC: 1, 2, 3)
  - [x] Subtask 3.1: Add visual feedback during removal (loading state or animation)
  - [x] Subtask 3.2: Test item can be re-added after removal
  - [x] Subtask 3.3: Run all tests to verify no regressions

## Dev Notes

### Root Cause Analysis

**Possible Causes:**
1. **Missing event handler:** Remove button may not have onClick handler
2. **Handler not wired:** onClick exists but not connected to context action
3. **State update issue:** removeFromList called but state not updating
4. **Async issue:** Removal not awaited properly
5. **Error swallowed:** Exception occurs but is caught and not logged
6. **Button disabled:** Remove button may be disabled conditionally

### Architecture Patterns

- **Context Pattern:** State management via ShoppingContext
- **Service Layer:** ShoppingService handles data operations
- **IndexedDB:** Local database for persistence via Dexie.js

### Code Structure

```
src/
├── features/
│   └── shopping/
│       ├── context/
│       │   └── ShoppingContext.tsx     # removeFromList function
│       └── components/
│           ├── ShoppingList.tsx         # Main list
│           └── ShoppingListItem.tsx     # Individual item (likely has remove button)
└── services/
    └── shopping.ts                      # ShoppingService
```

### Current Implementation Analysis

**ShoppingContext.removeFromList (from earlier read):**
```typescript
const removeFromList = useCallback(
  async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await shoppingService.removeFromList(productId);
      const newCount = await shoppingService.getShoppingListCount();
      dispatch({ type: 'UPDATE_COUNT', payload: newCount });
      logger.info('Product removed from shopping list', { productId });
    } catch (error) {
      // error handling
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  },
  []
);
```

**Issue Found:** The `removeFromList` function calls the service and updates the count, but it **doesn't reload the shopping list items**. After removal, the local `items` array in state is not updated, so the removed item still appears in the UI.

### Implementation Guidance

**Fix Required in ShoppingContext.tsx:**

The `removeFromList` function needs to reload the shopping list after removing the item:

```typescript
const removeFromList = useCallback(
  async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      logger.debug('Removing product from shopping list', { productId });

      await shoppingService.removeFromList(productId);

      // FIX: Reload the shopping list to update items array
      const items = await shoppingService.getShoppingListItems();
      dispatch({ type: 'SET_ITEMS', payload: items });

      logger.info('Product removed from shopping list', { productId });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to remove product from shopping list', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  },
  []
);
```

**Alternative Fix (if using optimistic updates):**

If you want instant UI feedback:
```typescript
const removeFromList = useCallback(
  async (productId: string) => {
    try {
      // Optimistic update: remove from local state immediately
      const updatedItems = state.items.filter(item => item.id !== productId);
      dispatch({ type: 'SET_ITEMS', payload: updatedItems });

      // Then persist to backend
      await shoppingService.removeFromList(productId);

      logger.info('Product removed from shopping list', { productId });
    } catch (error) {
      // Revert on error
      const items = await shoppingService.getShoppingListItems();
      dispatch({ type: 'SET_ITEMS', payload: items });

      const appError = handleError(error);
      logger.error('Failed to remove product', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      throw error;
    }
    // Note: No loading state for single-item removal
  },
  [state.items]
);
```

**ShoppingListItem Component:**

Verify the component has the remove button handler:
```tsx
<IconButton
  onClick={() => onRemove(product.id)}
  aria-label={`Remove ${product.name}`}
>
  <DeleteIcon />
</IconButton>
```

And that the parent passes the handler:
```tsx
<ShoppingListItem
  product={item}
  onRemove={removeFromList}  // or similar
/>
```

### Testing Standards

- Unit tests for ShoppingContext.removeFromList
- Integration tests for ShoppingListItem
- Manual testing for visual feedback
- Test persistence across navigation

### Project Structure Notes

- **Feature-Based Architecture:** Shopping feature in `src/features/shopping/`
- **Path Aliases:** Uses `@/` alias for imports
- **Co-located Tests:** Tests next to components

### Verification Steps

1. Start the app: `npm run dev`
2. Add products to shopping list (mark items as Low/Empty in inventory)
3. Navigate to shopping list
4. **BUG:** Click remove button on an item - nothing happens
5. **FIXED:** Click remove button - item is removed immediately
6. **FIXED:** Item count decreases
7. **FIXED:** Navigate away and back - item still removed
8. **FIXED:** Can re-add the item through inventory

### References

- [Source: src/features/shopping/context/ShoppingContext.tsx#L196-L220] - removeFromList function
- [Source: src/features/shopping/components/ShoppingListItem.tsx] - Remove button component
- [Source: src/features/shopping/components/ShoppingList.tsx] - Main shopping list
- [Source: src/services/shopping.ts] - ShoppingService
- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.5] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude (glm-4.7)

### Debug Log References

### Completion Notes List

### File List

---
