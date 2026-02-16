# Story 7.4: Add FAB to Shopping List Page for Manual Product Addition

Status: done

## Story

As a user,
I want a Floating Action Button (FAB) on the shopping list page that shows products I can add,
so that I can manually add inventory items to my shopping list when I need them.

## Acceptance Criteria

1. **Given** I am on the Shopping List page
**When** I look at the screen
**Then** I see a Floating Action Button (FAB) displayed on the screen
**And** The FAB uses a "+" icon or shopping cart icon to indicate "add" functionality
**And** The FAB is positioned in the bottom-right corner (standard FAB placement)
**And** The FAB does not overlap the bottom navigation

2. **Given** I tap the FAB on the Shopping List page
**When** The dialog/modal opens
**Then** I see a list of products from my inventory that are NOT already on the shopping list
**And** Each product shows: product name and current stock level
**And** The list is scrollable if there are many products
**And** I see an empty state message if all products are already on the list

3. **Given** the add products dialog is open
**When** I tap on a product in the list
**Then** The product is immediately added to my shopping list
**And** The product is visually marked or checked in the dialog
**And** The product appears on the shopping list behind the dialog
**And** I can tap multiple products to add them all at once

4. **Given** I have added products from the dialog
**When** I close the dialog (tap outside, close button, or back)
**Then** The dialog closes
**And** All selected products remain on my shopping list
**And** The products stay on the list even if their stock level is Medium or High (manual override)

5. **Given** I am on the Shopping List page and there are no products to add
**When** I look at the FAB
**Then** The FAB is still visible (or shows a disabled state)
**And** When tapped, it shows "All products are already on your shopping list" empty state

## Tasks / Subtasks

- [x] Create FAB component on Shopping List page (AC: 1)
  - [x] Add MUI Fab component to ShoppingList component
  - [x] Use "+" or AddShoppingCart icon
  - [x] Position in bottom-left corner with proper margins (to avoid conflict with Shopping Mode FAB)
  - [x] Ensure FAB doesn't overlap bottom navigation (56px height)

- [x] Create AddProductsDialog component (AC: 2, 3, 5)
  - [x] Create dialog that opens when FAB is tapped
  - [x] Fetch products from inventory where isOnShoppingList = false
  - [x] Display products in a list with: name, stock level indicator
  - [x] Handle empty state when all products are already on list
  - [x] Make dialog full-screen or appropriately sized for mobile

- [x] Implement product selection in dialog (AC: 3, 4)
  - [x] Add tap handler to add product to shopping list
  - [x] Call ShoppingService to add product to list
  - [x] Visually mark product as added/checked in dialog
  - [x] Refresh shopping list behind dialog when products are added
  - [x] Support adding multiple products before closing

- [x] Add state management and handlers (AC: 3, 4)
  - [x] State for dialog open/close
  - [x] State for available products (not on shopping list)
  - [x] Handler for FAB tap: open dialog, fetch available products
  - [x] Handler for product tap: add to list, mark as added
  - [x] Handler for dialog close: reset state, close dialog

- [x] Style and layout (AC: 1, 2)
  - [x] Use MUI Dialog component with proper styling
  - [x] Position FAB with absolute/fixed positioning: `position: 'fixed', bottom: 80px, left: 16px`
  - [x] Ensure FAB is above bottom navigation: `zIndex: 1000`
  - [x] Style product list items with consistent spacing
  - [x] Add visual feedback when product is added (checkmark, color change)

- [x] Write/update tests (AC: 1, 2, 3, 4, 5)
  - [x] Test FAB renders on Shopping List page
  - [x] Test FAB opens dialog when tapped
  - [x] Test dialog shows products not on shopping list
  - [x] Test tapping product adds it to shopping list
  - [x] Test adding multiple products
  - [x] Test empty state when no products available
  - [x] Test manual override: added products stay on list

## Dev Notes

### Architecture Patterns and Constraints

**From Architecture Document:**
- **MUI Component Strategy**: Use `Fab` component for FAB, `Dialog` for modal
- **Service Layer**: Use `ShoppingService` to add products to shopping list
- **State Management**: Use `ShoppingContext` for list state
- **Component Location**: `src/features/shopping/components/ShoppingList.tsx`

**From Epic 3 (Automatic Shopping List Generation):**
- Automatic: Products with Low/Empty stock automatically appear on list
- Manual: Users can manually add products (this story provides the UI for that)
- Manual Override: Manually added products stay on list even if stock is Medium/High

**From Story 7.1:**
- Bottom navigation is 56px height
- FAB should be positioned above nav: `bottom: 80px` (56px + margin)

**Query Logic:**
```tsx
// Products to show in dialog: NOT on shopping list
const availableProducts = products.filter(p => !p.isOnShoppingList);
```

### Source Tree Components to Touch

**Primary File:**
- `src/features/shopping/components/ShoppingList.tsx` - Add FAB here
- `src/features/shopping/components/AddProductsDialog.tsx` - NEW component
- `src/features/shopping/components/AddProductsDialog.test.tsx` - NEW test file

**ShoppingService Methods:**
```typescript
// Already exists from Epic 3, Story 3.3:
addToShoppingList(productId: string): Promise<void>
```

**Component Structure:**
```tsx
// ShoppingList.tsx structure
<Box>
  {/* Progress indicator */}
  <ShoppingProgress />

  {/* Shopping list items */}
  <List>{/* items */}</List>

  {/* NEW: FAB for adding products */}
  <Fab
    color="primary"
    sx={{ position: 'fixed', bottom: 80, right: 16 }}
    onClick={handleOpenAddDialog}
  >
    <AddIcon />
  </Fab>

  {/* NEW: Add products dialog */}
  <AddProductsDialog
    open={addDialogOpen}
    onClose={handleCloseAddDialog}
    onAddProduct={handleAddProduct}
  />
</Box>
```

### Testing Standards

**From Architecture Document:**
- Vitest for unit/integration tests
- Playwright for E2E tests
- Co-locate test files with source files

**Test Coverage:**
1. **Unit Tests** (AddProductsDialog):
   - Renders correctly
   - Shows available products
   - Handles empty state
   - Calls onAddProduct when item tapped

2. **Integration Tests** (ShoppingList):
   - FAB renders in correct position
   - FAB opens dialog
   - Dialog close works
   - Shopping list updates when products added

3. **E2E Tests** (Playwright):
   - User opens shopping list
   - User taps FAB
   - User selects products from dialog
   - Products appear on shopping list
   - Manual override: products stay on list

### Project Structure Notes

**New Component to Create:**
- `src/features/shopping/components/AddProductsDialog.tsx`

**Alignment:** Follows feature-based structure at `src/features/shopping/`

**No Conflicts:** This is additive work building on existing shopping list functionality.

### References

- **Epic 3, Story 3.3**: Manual Shopping List Management - established the manual add/remove functionality
- **Story 7.3**: Remove "Add to Shopping List" from Inventory Page - removes the old UI
- **Architecture Document**: Service Layer (ShoppingService), State Management (ShoppingContext)
- **MUI Documentation**: Fab component, Dialog component

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

None - implementation completed successfully without issues.

### Completion Notes List

Story implementation completed successfully. Created AddProductsDialog component with MUI Dialog, showing products not on shopping list with tap-to-add functionality. Added green FAB (AddIcon) on bottom-left of Shopping List page, positioned above BottomNav. The FAB opens a dialog showing available products from inventory that are not already on the shopping list. Users can tap products to add them, with visual feedback (CheckIcon) when added. The dialog supports adding multiple products before closing. All 614 tests pass, including 12 new tests for AddProductsDialog.

### File List

- `src/features/shopping/components/ShoppingList.tsx` (added FAB, dialog state, and handlers)
- `src/features/shopping/components/AddProductsDialog.tsx` (NEW)
- `src/features/shopping/components/AddProductsDialog.test.tsx` (NEW - 12 tests)
- `src/features/shopping/components/ShoppingList.test.tsx` (added InventoryContext mock)
- `src/features/shopping/components/ShoppingListMobile.test.tsx` (added InventoryContext mock)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-13 | Story created via correct-course workflow - UX redesign with FAB showing products not on shopping list | Isma |
| 2026-02-13 | Implementation complete - Added FAB to Shopping List page with AddProductsDialog component | Amelia (Dev Agent) |
