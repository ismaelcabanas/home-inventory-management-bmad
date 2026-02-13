# Story 7.3: Remove "Add to Shopping List" from Inventory Page

Status: ready-for-dev

## Story

As a user,
I want a cleaner inventory page without the "Add to Shopping List" button on each product card,
so that the inventory page is focused on viewing and managing stock levels.

## Acceptance Criteria

1. **Given** I am viewing the inventory page
**When** I look at any product card
**Then** I do NOT see an "Add to Shopping List" button or icon on the product card
**And** The product card only shows: product name, stock status, and the 3-dot action menu (⋮) for Edit/Delete

2. **Given** I want to manually add a product to the shopping list
**When** I am on the inventory page
**Then** There is NO way to add products to shopping list from this page
**And** I must go to the Shopping List page to add items manually (via Story 7.4)

3. **Given** a product was previously on the shopping list
**When** I mark it as "High" stock level
**Then** It is still automatically removed from the shopping list (existing automation)
**And** No manual "Add" button exists on inventory page

4. **Given** I am on the inventory page
**When** I tap on a product card
**Then** The stock level cycles (High → Medium → Low → Empty) as designed in Story 7.1
**And** No "Add to Shopping List" action appears

## Tasks / Subtasks

- [ ] Remove "Add to Shopping List" button/icon from product cards (AC: 1, 4)
  - [ ] Locate where the button is rendered in InventoryList component
  - [ ] Remove the button/icon from the product card JSX
  - [ ] Remove any associated state handlers (handleAddToShoppingList)
  - [ ] Clean up unused imports if any

- [ ] Verify product card layout is clean after removal (AC: 1)
  - [ ] Ensure product card still shows: name, stock status, 3-dot menu
  - [ ] Check for any layout shifts or visual gaps
  - [ ] Confirm spacing is consistent

- [ ] Update/remove any related state or handlers (AC: 2, 3)
  - [ ] Remove manual add-to-list handlers if they existed in InventoryList
  - [ ] Ensure automatic list generation (Low/Empty → shopping list) still works
  - [ ] Ensure automatic removal (High → removed from list) still works

- [ ] Update tests (AC: 1, 2, 3, 4)
  - [ ] Remove tests for "Add to Shopping List" button on inventory page
  - [ ] Add tests confirming the button is not present
  - [ ] Verify automatic list generation/removal still works

## Dev Notes

### Architecture Patterns and Constraints

**From Epic 3, Story 3.3:**
- Previously had "Add to Shopping List" button on Medium/High stock products
- Previously had "Remove from Shopping List" button on products already on list
- This functionality was a "manual safety net" for the automatic system

**From Story 7.1:**
- Product cards show: product name, stock status text, color-coded background, 3-dot action menu (⋮)
- Tap on card cycles stock level (no visible button grid)

**UX Rationale:**
- Shopping list management moves to Shopping List page (Story 7.4)
- Inventory page becomes purely about stock level tracking
- Cleaner separation of concerns: view stock (inventory) vs manage list (shopping list)

### Source Tree Components to Touch

**Primary File:**
- `src/features/inventory/components/InventoryList.tsx` - Main inventory list component
- `src/features/inventory/components/ProductCard.tsx` - Individual product card (if separated)

**Look for code to remove (pattern):**
```tsx
// REMOVE: Button or icon like this
<IconButton onClick={() => handleAddToShoppingList(product.id)}>
  <AddShoppingListIcon />
</IconButton>

// OR: Button in action menu
<Button onClick={() => handleAddToShoppingList(product.id)}>
  Add to Shopping List
</Button>

// OR: Conditional button based on stock level
{!product.isOnShoppingList && (
  <Button onClick={() => handleAddToShoppingList(product.id)}>
    Add to List
  </Button>
)}
```

**Also remove associated handlers:**
```tsx
// REMOVE or CLEANUP: Handler functions
const handleAddToShoppingList = (productId: string) => {
  // ... implementation to remove
}
```

### Testing Standards

**From Architecture Document:**
- Vitest for unit/integration tests
- Playwright for E2E tests
- Co-locate test files with source files

**Test Updates:**
1. Remove tests that verify "Add to Shopping List" button exists/works
2. Add tests that confirm button is NOT present
3. Verify automatic list generation still works:
   - Mark product as Low/Empty → appears on shopping list
   - Mark product as High → removed from shopping list

### Project Structure Notes

**Alignment:** Maintains feature-based structure at `src/features/inventory/`

**No Conflicts:** This removal is part of planned UX redesign (Epic 7).

### References

- **Epic 3, Story 3.3**: Manual Shopping List Management (Safety Nets) - originally added these buttons
- **Story 7.1**: Redesign Inventory Page Layout and Navigation - current card design
- **Story 7.4**: Add FAB on Shopping List Page - where the manual add functionality moves to

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

None (story not yet implemented)

### Completion Notes List

Story created as part of UX redesign to move manual shopping list management from inventory page to shopping list page (Story 7.4).

### File List

(Expected files to be modified during implementation):
- `src/features/inventory/components/InventoryList.tsx` (remove button)
- `src/features/inventory/components/ProductCard.tsx` (if exists, remove button)
- `src/features/inventory/components/InventoryList.test.tsx` (update tests)
- `src/features/inventory/components/ProductCard.test.tsx` (update tests, if exists)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-13 | Story created via correct-course workflow - UX redesign | Isma |
