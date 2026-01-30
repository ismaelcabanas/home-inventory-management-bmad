# Story 4.1: Check Off Items While Shopping

Status: completed

## Story

As a **user**,
I want to check off items as I collect them while shopping,
So that I can track what I've already grabbed and what I still need.

## Context

This is the first story in Epic 4 - In-Store Shopping Experience. Epic 3 established the shopping list system with automatic item addition and manual management controls. Story 4.1 introduces the core in-store shopping interaction: checking items off as they're collected.

**User Journey:** Users have their shopping list automatically generated (Story 3.1) and can manually manage items (Story 3.3). Now they're in the store, phone in hand, navigating aisles. As they pick items off the shelves, they need to mark them as collected to track progress.

**Critical Success Factor:** The check-off interaction must be fast, reliable, and work offline. Users are often in bright store environments, using their phone with one hand while pushing a cart. The checkbox must be large enough to tap accurately, respond instantly, and provide clear visual feedback.

**Epic 3 Dependencies:** Stories 3.1, 3.2, and 3.3 established ShoppingList, ShoppingContext, ShoppingService, and the isOnShoppingList flag. Story 4.1 adds a NEW state dimension (isChecked) to track collection status separately from list membership.

**New Schema Requirement:** Unlike manual add/remove (Story 3.3), this story REQUIRES a database schema change. The Product interface needs an `isChecked` boolean field to persist collection state across app restarts.

## Acceptance Criteria

### AC1: Checkbox Display on Shopping List Items

**Given** I have items on my shopping list
**When** I'm on the Shopping List screen
**Then** Each item displays a checkbox (unchecked by default)
**And** The checkbox is positioned on the left side of the item (standard mobile pattern)
**And** The checkbox uses MUI Checkbox component with appropriate size (48px touch target)
**And** Unchecked items display normally (no strikethrough, normal opacity)

### AC2: Mark Item as Collected (Check Off)

**Given** I have items on my shopping list
**When** I tap a checkbox to mark an item as collected
**Then** The checkbox shows a checkmark immediately (FR18)
**And** The item visually indicates it's collected (strikethrough text or dimmed opacity)
**And** The action happens with <1 second response time (NFR1)
**And** A subtle visual confirmation appears (FR40) - brief snackbar or animation
**And** The collected state persists to IndexedDB via ShoppingService
**And** ShoppingContext updates state immediately for UI reactivity

### AC3: Unmark Item as Collected (Uncheck)

**Given** I have a checked item on my shopping list
**When** I tap the checked checkbox to unmark the item
**Then** The checkmark disappears immediately (FR20)
**And** The item returns to normal appearance (no strikethrough, full opacity)
**And** The action happens with <1 second response time (NFR1)
**And** A subtle visual confirmation appears (FR40)
**And** The unchecked state persists to IndexedDB
**And** ShoppingContext updates state immediately

### AC4: Persist Collection State Across Navigation

**Given** I have checked items on my shopping list
**When** I navigate away from the Shopping List screen
**And** I return to the Shopping List screen
**Then** Previously checked items remain checked
**And** Previously unchecked items remain unchecked
**And** The state reflects exactly what I set before navigating away
**And** The state persists across app restarts (kill app, reopen)

### AC5: Offline Functionality

**Given** I'm using the app without network connectivity
**When** I check or uncheck items on my shopping list
**Then** All checkbox operations work exactly as online
**And** Collection state persists to local IndexedDB (no network required)
**And** Visual feedback appears immediately
**And** No error messages related to connectivity appear
**And** The app remains fully functional for in-store shopping (FR21, NFR9)

### AC6: Integration with Existing Shopping List System

**Given** Story 3.1 implemented automatic shopping list generation
**Given** Story 3.2 implemented automatic removal when replenished
**Given** Story 3.3 implemented manual add/remove safety nets
**When** I check items off on the shopping list
**Then** The isOnShoppingList flag remains unchanged (checked items stay on list)
**And** The new isChecked flag tracks collection state independently
**And** Manual add/remove buttons from Story 3.3 continue to work
**And** Stock level changes continue to work as before
**And** BottomNav count badge continues to show total items (not affected by isChecked)
**And** No existing functionality is broken by the new isChecked field

### AC7: Comprehensive Test Coverage

**Given** The check-off items feature is implemented
**When** I write tests for the feature
**Then** Unit tests cover:
  - ShoppingService.updateCheckedState() sets isChecked flag correctly
  - ShoppingService.updateCheckedState() persists to IndexedDB
  - ShoppingService.updateCheckedState() preserves other product fields
  - ShoppingContext CHECK_ITEM and UNCHECK_ITEM actions update state
  - ShoppingContext error handling for update operations
**And** Integration tests cover:
  - Checkbox appears on all shopping list items
  - Checkbox toggles between checked and unchecked states
  - Checked items show strikethrough or dimmed appearance
  - Unchecked items show normal appearance
  - Collection state persists across navigation
  - Collection state persists across app restarts
  - Checkbox operations work offline
  - Visual confirmation appears for check/uncheck actions
  - Operations complete within <1 second response time
**And** All tests follow existing test structure (Vitest + React Testing Library)
**And** Test coverage maintains or exceeds 92% (current project standard)
**And** All existing tests still pass (no regressions)

---

## Tasks / Subtasks

### Task 1: Database Schema Extension - Add isChecked Flag (AC: #4, #5, #6)
- [ ] Subtask 1.1: Read src/services/database.ts to understand current Product schema
- [ ] Subtask 1.2: Add isChecked field to Product interface
  - Type: boolean
  - Default: false
  - IndexedDB index: Add 'isChecked' to products table index
- [ ] Subtask 1.3: Create database migration from version 1 to version 2
  - Add isChecked field with default value false for existing products
  - Use Dexie.js version upgrade mechanism
  - Test migration with existing data (no data loss)
- [ ] Subtask 1.4: Update database version in src/services/database.ts
  - Increment version from 1 to 2
  - Add upgrade logic to populate isChecked field
  - Ensure backward compatibility

### Task 2: Extend ShoppingService with Check/Uncheck Methods (AC: #2, #3, #4, #5)
- [ ] Subtask 2.1: Read src/services/shopping.ts to understand current ShoppingService implementation
- [ ] Subtask 2.2: Add updateCheckedState(productId: string, isChecked: boolean) method to ShoppingService
  - Updates the product's isChecked flag
  - Persists change to IndexedDB
  - Returns the updated product
  - Does NOT modify isOnShoppingList (collection state independent)
  - Does NOT modify stockLevel
- [ ] Subtask 2.3: Add error handling with handleError utility
- [ ] Subtask 2.4: Add logging with logger utility
- [ ] Subtask 2.5: Verify offline functionality (no network calls, local IndexedDB only)

### Task 3: Extend ShoppingContext with Check/Uncheck Actions (AC: #2, #3, #6)
- [ ] Subtask 3.1: Read src/features/shopping/context/ShoppingContext.tsx to understand current implementation
- [ ] Subtask 3.2: Add 'CHECK_ITEM' action type to ShoppingAction
  - Payload: { productId: string, isChecked: boolean }
- [ ] Subtask 3.3: Add 'UNCHECK_ITEM' action type to ShoppingAction (or combine with CHECK_ITEM)
  - Consider: Single 'SET_CHECKED_STATE' action with boolean payload is cleaner
- [ ] Subtask 3.4: Update reducer to handle CHECK_ITEM action
  - Update product's isChecked flag in state
  - Preserve immutability (create new state object)
- [ ] Subtask 3.5: Update reducer to handle UNCHECK_ITEM action
- [ ] Subtask 3.6: Add toggleItemChecked(productId: string) method to ShoppingContext provider
  - Dispatches CHECK_ITEM or UNCHECK_ITEM action as appropriate
  - Calls shoppingService.updateCheckedState()
  - Handles errors with try/catch
  - Sets loading state appropriately (if needed for this operation)
- [ ] Subtask 3.7: Update useShoppingList hook to expose toggleItemChecked method

### Task 4: Update ShoppingListItem Component with Checkbox UI (AC: #1, #2, #3)
- [ ] Subtask 4.1: Read src/features/shopping/components/ShoppingListItem.tsx to understand current implementation
- [ ] Subtask 4.2: Import MUI Checkbox component
- [ ] Subtask 4.3: Import useShoppingList hook from ShoppingContext
- [ ] Subtask 4.4: Add Checkbox component to ShoppingListItem layout
  - Position on left side of item (standard mobile pattern)
  - Use size="medium" for 48px touch target (accessibility)
  - Wire checked state to product.isChecked
- [ ] Subtask 4.5: Add onChange handler to Checkbox
  - Call shoppingContext.toggleItemChecked(product.id)
  - Optional: Show snackbar confirmation on check/uncheck
- [ ] Subtask 4.6: Add conditional styling for checked items
  - If isChecked === true: Apply strikethrough to text OR reduce opacity
  - Use MUI Typography with sx prop for strikethrough
  - Use MUI Box with sx prop for opacity
- [ ] Subtask 4.7: Ensure checkbox is accessible
  - Add aria-label for screen readers
  - Ensure sufficient touch target size (48px minimum)
  - Test with keyboard navigation

### Task 5: Write Comprehensive Tests (AC: #7)
- [ ] Subtask 5.1: Update src/services/shopping.test.ts
  - [ ] Test updateCheckedState() sets isChecked to true
  - [ ] Test updateCheckedState() sets isChecked to false
  - [ ] Test updateCheckedState() persists to IndexedDB
  - [ ] Test updateCheckedState() preserves isOnShoppingList
  - [ ] Test updateCheckedState() preserves stockLevel
  - [ ] Test error handling for invalid productId
- [ ] Subtask 5.2: Update src/features/shopping/context/ShoppingContext.test.tsx
  - [ ] Test CHECK_ITEM action updates product isChecked state
  - [ ] Test UNCHECK_ITEM action updates product isChecked state
  - [ ] Test toggleItemChecked() method calls shoppingService.updateCheckedState()
  - [ ] Test error handling sets error state correctly
  - [ ] Test multiple items can be checked independently
- [ ] Subtask 5.3: Update src/features/shopping/components/ShoppingListItem.test.tsx
  - [ ] Test checkbox appears on shopping list items
  - [ ] Test checkbox reflects product.isChecked state
  - [ ] Test clicking checkbox calls toggleItemChecked
  - [ ] Test checked items show strikethrough or dimmed styling
  - [ ] Test unchecked items show normal styling
  - [ ] Test checkbox toggles between checked and unchecked
  - [ ] Test visual confirmation appears (snackbar or animation)
- [ ] Subtask 5.4: Create integration tests for persistence (ShoppingList tests)
  - [ ] Test collection state persists across navigation
  - [ ] Test collection state persists across app restarts
  - [ ] Test checked items remain checked after refresh
  - [ ] Test unchecked items remain unchecked after refresh
- [ ] Subtask 5.5: Create offline functionality tests
  - [ ] Test checkbox operations work without network
  - [ ] Test collection state persists offline
  - [ ] Test no network errors appear during offline check/uncheck
- [ ] Subtask 5.6: Run full test suite and verify all tests pass
- [ ] Subtask 5.7: Check test coverage maintains ≥92%

### Task 6: Verify Integration and Regression Testing (AC: #1, #2, #3, #4, #5, #6)
- [ ] Subtask 6.1: Verify InventoryContext still works correctly (no regressions)
- [ ] Subtask 6.2: Verify StockLevelPicker still works (no regressions)
- [ ] Subtask 6.3: Verify ShoppingList from Story 3.1 still displays correctly
- [ ] Subtask 6.4: Verify automatic addition (Low/Empty → list) still works
- [ ] Subtask 6.5: Verify automatic removal (High → removed) still works
- [ ] Subtask 6.6: Verify manual add/remove buttons from Story 3.3 still work
- [ ] Subtask 6.7: Verify BottomNav count badge still shows total items (not affected by isChecked)
- [ ] Subtask 6.8: Test navigation between Inventory and Shopping tabs
- [ ] Subtask 6.9: Verify app builds successfully with `npm run build`
- [ ] Subtask 6.10: Run ESLint and verify 0 errors, 0 warnings
- [ ] Subtask 6.11: Run TypeScript compiler and verify clean compilation
- [ ] Subtask 6.12: Test complete shopping flow:
  - Mark item as Low → appears on shopping list
  - Go to shopping list → see unchecked checkbox
  - Check item → see checkmark and strikethrough
  - Navigate away and return → item still checked
  - Uncheck item → see normal appearance
  - Verify offline functionality (airplane mode test)
- [ ] Subtask 6.13: Performance testing: Verify <1 second response time for check/uncheck

---

## Dev Notes

### Critical Implementation Requirements

**Check-Off Interaction Pattern:**

Story 4.1 introduces the core in-store shopping interaction. Users are physically in a store, phone in hand, navigating aisles. They need to quickly mark items as collected without interrupting their shopping flow.

**Implementation Overview:**

1. **Database Schema Extension:** Add `isChecked` boolean field to Product interface
   - NEW field, separate from `isOnShoppingList`
   - Requires database migration (version 1 → version 2)
   - Default value: false (unchecked by default)
   - IndexedDB index for efficient queries

2. **ShoppingService Extensions:** Add method to update collection state
   - `updateCheckedState(productId: string, isChecked: boolean): Promise<Product>`
   - Updates only the `isChecked` flag
   - Does NOT modify `isOnShoppingList` (stays on list when checked)
   - Does NOT modify `stockLevel`

3. **ShoppingContext Extensions:** Add actions and methods for check/uncheck
   - `CHECK_ITEM` and `UNCHECK_ITEM` action types (or `SET_CHECKED_STATE`)
   - `toggleItemChecked(productId: string)` provider method
   - State updates reflect isChecked changes

4. **ShoppingListItem UI Updates:** Add checkbox with visual feedback
   - MUI Checkbox component (48px touch target)
   - Positioned on left side of item
   - Checked state: strikethrough text OR dimmed opacity
   - Unchecked state: normal appearance
   - Immediate visual feedback (<1 second response time)

5. **Offline-First Functionality:** All operations work without network
   - IndexedDB persists isChecked state locally
   - No network calls required
   - PWA service worker enables offline shopping

**Schema Migration Required:**

Unlike Story 3.3 (manual add/remove), this story REQUIRES a database schema change. The Product interface needs an `isChecked` boolean field to track collection state separately from list membership.

**Migration Strategy:**
- Increment database version from 1 to 2
- Add `isChecked` field to products table schema
- Use Dexie.js upgrade mechanism to set default value false for existing products
- Verify no data loss during migration (test with real data)

---

### Architecture Compliance

**From Architecture Document:**

**Service Layer Architecture (Lines 135-152):**
- ShoppingService abstracts shopping list operations
- Methods call Dexie.js directly for MVP
- Error handling with handleError utility
- Logging with logger utility

**State Management Pattern (Lines 146-160):**
- ShoppingContext with useReducer pattern
- Action types as discriminated unions
- Reducer functions are pure and immutable
- Context provider methods handle async operations

**Component Architecture (Lines 154-169):**
- ShoppingListItem component (existing, needs modification)
- Feature-based directory structure maintained
- MUI components used directly (Checkbox)

**Error Handling Standards (Lines 166-172):**
- All errors converted to AppError via handleError()
- logger.error() for debugging
- MUI Alert or Snackbar for user display

**Naming & Code Conventions (Lines 172-179):**
- PascalCase for components
- camelCase for variables, functions, database fields
- Absolute imports with @/ alias
- Date objects for timestamps

**Database Schema Management (Lines 523-653):**
- Dexie.js versioning for schema changes
- Upgrade functions handle migrations
- Test migrations with existing data

---

### Previous Story Intelligence

**From Story 3.3 (Manual Shopping List Management Safety Nets):**

**Key Learnings:**
1. **ShoppingService** exists with getShoppingListItems() and getShoppingListCount()
2. **ShoppingContext** exists with useReducer pattern and state management
3. **ShoppingList component** exists with 5-second polling for real-time updates
4. **ShoppingListItem component** exists as the individual item renderer (needs checkbox)
5. **BottomNav count badge** updates independently with polling
6. **isOnShoppingList flag** controls list membership
7. **270 tests passing**, 99.3%+ coverage maintained

**Code Patterns Established:**
- Service layer singleton pattern
- Context provider with useReducer
- Custom hook with error boundary check
- Comprehensive test coverage (unit + integration)
- Error handling with try/catch/finally
- Loading states and error states in UI
- Manual operations update isOnShoppingList flag directly

**Files from Story 3.3:**
- src/services/shopping.ts (ShoppingService with getShoppingListItems, getShoppingListCount)
- src/services/shopping.test.ts
- src/features/shopping/context/ShoppingContext.tsx
- src/features/shopping/context/ShoppingContext.test.tsx
- src/features/shopping/components/ShoppingList.tsx (with 5-second polling)
- src/features/shopping/components/ShoppingListItem.tsx (needs checkbox)
- src/components/shared/Layout/BottomNav.tsx (with independent polling)

**From Story 3.1 (View Shopping List with Automatic Item Addition):**
- ShoppingService, ShoppingContext, ShoppingList foundation
- Automatic addition when Low/Empty (via InventoryService.updateProduct)
- BottomNav count badge with visibility toggle

**From Story 3.2 (Automatic Removal from Shopping List When Replenished):**
- Automatic removal when stock marked High
- Enhanced getShoppingListCount() with defensive filtering
- Critical bug fix: BottomNav independent polling for count badge updates

**From Story 2.1 (Stock Level Picker Component):**
- StockLevelPicker component for changing stock levels
- STOCK_LEVEL_CONFIG exists in stockLevelConfig.ts

**From Story 1.2 (Database Schema and Service Layer):**
- Product interface includes isOnShoppingList boolean
- InventoryService.updateProduct implements auto add/remove logic
- **CRITICAL:** This story established the version 1 database schema

---

### Database Schema Migration Strategy

**Current Schema (Version 1):**
```typescript
// From Story 1.2
interface Product {
  id?: string;
  name: string;
  stockLevel: 'high' | 'medium' | 'low' | 'empty';
  createdAt: Date;
  updatedAt: Date;
  isOnShoppingList: boolean;
}

db.version(1).stores({
  products: '++id, name, stockLevel, isOnShoppingList, updatedAt'
});
```

**New Schema (Version 2):**
```typescript
// For Story 4.1
interface Product {
  id?: string;
  name: string;
  stockLevel: 'high' | 'medium' | 'low' | 'empty';
  createdAt: Date;
  updatedAt: Date;
  isOnShoppingList: boolean;
  isChecked: boolean; // NEW FIELD
}

db.version(2).stores({
  products: '++id, name, stockLevel, isOnShoppingList, isChecked, updatedAt'
}).upgrade(tx => {
  // Migration logic: Set isChecked = false for all existing products
  return tx.products.toCollection().modify(product => {
    product.isChecked = false;
  });
});
```

**Migration Testing:**
- Test with existing data (verify no data loss)
- Test with empty database (first-time install)
- Verify migration only runs once (version 1 → version 2)
- Verify existing products get isChecked = false by default

**Gotcha:** Ensure the upgrade function is efficient for large product lists (hundreds of items).

---

### Critical Success Factors

**Three Keys to Success:**

1. **Fast, Reliable Interaction** - Checkbox must respond instantly (<1 second) with clear visual feedback. Users are in a rush while shopping.

2. **Independent State Tracking** - isChecked is separate from isOnShoppingList. Checking an item doesn't remove it from the list.

3. **Offline-First Functionality** - Complete offline operation is critical. Stores often have poor WiFi, and users rely on the app working anywhere.

**Gotchas to Avoid:**

- **Don't break existing functionality**: Automatic addition/removal, manual add/remove, and count badge must continue working.
- **Don't confuse isChecked with isOnShoppingList**: These are independent flags. Checked items stay on the shopping list.
- **Don't skip the migration**: Database must be upgraded to version 2. Test migration thoroughly.
- **Don't create race conditions**: Checkbox state updates must be atomic and reliable.
- **Don't break existing navigation**: All three tabs must work. Back button must work. Routes must be correct.
- **Don't forget offline testing**: Verify the app works in airplane mode or with no network.
- **Don't break existing tests**: All 270+ tests must still pass after changes.
- **Don't skip error handling**: Checkbox operations need error handling just like other operations.
- **Don't ignore accessibility**: Checkbox must be 48px minimum touch target, have aria-labels, work with keyboard.
- **Don't forget visual feedback**: Checked items need clear visual indication (strikethrough or dimmed).

**Validation Checklist:**

Before marking this story complete, verify:
- [ ] Checkbox appears on all shopping list items (unchecked by default)
- [ ] Checkbox shows checkmark when tapped
- [ ] Checked items show strikethrough or dimmed appearance
- [ ] Unchecked items show normal appearance
- [ ] Checkbox can be unchecked (checkmark disappears)
- [ ] Collection state persists across navigation
- [ ] Collection state persists across app restarts
- [ ] Checkbox operations work offline
- [ ] Visual confirmation appears for check/uncheck actions
- [ ] Operations complete within <1 second response time
- [ ] Automatic addition (Low/Empty → list) still works
- [ ] Automatic removal (High → removed) still works
- [ ] Manual add/remove buttons still work
- [ ] BottomNav count badge still shows total items
- [ ] Navigation works between all three tabs
- [ ] Browser back button works correctly
- [ ] Database migration succeeds without data loss
- [ ] All unit tests pass (shopping service, context, components)
- [ ] All integration tests pass (persistence, offline)
- [ ] All existing tests still pass (no regression)
- [ ] Test coverage maintains ≥92%
- [ ] ESLint shows 0 errors, 0 warnings
- [ ] TypeScript compiles with no errors
- [ ] Production build succeeds

---

### State Model Clarity

**Two Independent Boolean Flags:**

```typescript
interface Product {
  isOnShoppingList: boolean;  // "Is this item on the list?"
  isChecked: boolean;         // "Have I collected this item?"
}
```

**State Combinations:**

| isOnShoppingList | isChecked | Meaning | Display |
|-----------------|-----------|---------|---------|
| true | false | On list, not yet collected | Show on list, unchecked checkbox |
| true | true | On list, already collected | Show on list, checked checkbox, strikethrough |
| false | false | Not on list, not collected | Don't show on list |
| false | true | Not on list, but collected (edge case) | Don't show on list (respect isOnShoppingList) |

**Key Insight:** The shopping list displays items where `isOnShoppingList === true`. The `isChecked` flag only affects the visual state of items already on the list.

**Edge Case Handling:**
- What if user manually removes a checked item? → Item disappears from list (isOnShoppingList takes precedence)
- What if user marks a checked item as High (replenished)? → Item disappears from list (automatic removal from Story 3.2)
- What if user marks item as Low again? → Item reappears on list, unchecked (reset isChecked to false)

**Decision:** Should isChecked reset to false when item reappears on list? This is a UX decision. Recommend: YES, reset to false for consistency (every new shopping trip starts fresh).

---

### User Experience Considerations

**In-Store Context:**
- Bright environment (high contrast needed)
- One-handed operation (large touch targets)
- Quick interactions (fast response times)
- Distractions (clear visual feedback)

**Checkbox Design:**
- Position: Left side of item (standard mobile pattern)
- Size: 48px minimum touch target (accessibility + usability)
- Visual feedback: Immediate checkmark appearance
- Item styling: Strikethrough text OR opacity reduction (choose one consistently)

**Visual Confirmation (FR40):**
- Snackbar message: "Item collected" / "Item uncollected"
- OR: Brief animation (checkmark bounces)
- OR: Color flash (item briefly highlights)
- **Recommendation:** Snackbar is clearest and follows Story 3.3 pattern

**Progress Tracking (Preview of Story 4.2):**
- This story implements the checkbox
- Story 4.2 will add "X of Y items collected" progress indicator
- Design with Story 4.2 in mind (progress count will use isChecked field)

---

## References

**Epic:** `_bmad-output/planning-artifacts/epics.md` (Epic 4, Story 4.1, Lines 881-910)

**Architecture:**
- Service Layer: `_bmad-output/planning-artifacts/architecture.md` (Lines 135-152)
- State Management: `_bmad-output/planning-artifacts/architecture.md` (Lines 146-160)
- Component Architecture: `_bmad-output/planning-artifacts/architecture.md` (Lines 154-169)
- Error Handling: `_bmad-output/planning-artifacts/architecture.md` (Lines 166-172)
- Database Schema Management: `_bmad-output/planning-artifacts/architecture.md` (Lines 523-653)

**PRD:**
- In-Store Shopping Experience: `_bmad-output/planning-artifacts/prd.md` (FR17-FR21)
- Functional Requirements: `_bmad-output/planning-artifacts/prd.md` (Lines 44-62)
- Non-Functional Requirements: `_bmad-output/planning-artifacts/prd.md` (NFR1: <1 second response time, NFR9: Offline functionality)

**UX Design:**
- Shopping List UX: `_bmad-output/planning-artifacts/ux-design-specification.md` (Shopping List patterns)
- Mobile Interaction: `_bmad-output/planning-artifacts/ux-design-specification.md` (One-handed operation, touch targets)
- Visual Feedback: `_bmad-output/planning-artifacts/ux-design-specification.md` (FR40: Visual confirmation)

**Previous Stories:**
- Story 1.2: `_bmad-output/implementation-artifacts/1-2-set-up-database-schema-and-service-layer.md` (Product schema, database version 1)
- Story 2.1: `_bmad-output/implementation-artifacts/2-1-implement-stock-level-picker-component.md` (StockLevelPicker)
- Story 3.1: `_bmad-output/implementation-artifacts/3-1-view-shopping-list-with-automatic-item-addition.md` (ShoppingService, ShoppingContext, ShoppingList)
- Story 3.2: `_bmad-output/implementation-artifacts/3-2-automatic-removal-from-shopping-list-when-replenished.md` (Auto-removal, BottomNav polling)
- Story 3.3: `_bmad-output/implementation-artifacts/3-3-manual-shopping-list-management-safety-nets.md` (Manual add/remove, 270 tests baseline)
- Database Schema: `src/services/database.ts` (version 1, needs upgrade to version 2)
- ShoppingService: `src/services/shopping.ts` (existing service to extend)
- ShoppingContext: `src/features/shopping/context/ShoppingContext.tsx` (existing context to extend)
- ShoppingListItem: `src/features/shopping/components/ShoppingListItem.tsx` (existing component to modify)

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (glm-4.7)

### Debug Log References

No debug issues anticipated. This story extends the shopping list with checkbox functionality:
- Database schema requires migration (version 1 → version 2)
- ShoppingService needs updateCheckedState() method
- ShoppingContext needs CHECK_ITEM/UNCHECK_ITEM actions
- ShoppingListItem needs MUI Checkbox component
- isChecked flag independent from isOnShoppingList

Potential issues:
- Database migration must be tested thoroughly (ensure no data loss)
- Checkbox state must persist offline (IndexedDB, no network calls)
- Visual feedback must be clear and immediate (<1 second response time)
- isChecked vs isOnShoppingList confusion (document clearly in code comments)

### Completion Notes List

**Story Creation Summary:**

Story 4.1 successfully created with comprehensive developer context for check-off items while shopping. Key insight: isChecked is a NEW database field independent from isOnShoppingList. Requires database schema migration (version 1 → version 2).

**Key Technical Context Provided:**
1. **Schema Migration Required**: Add isChecked boolean field to Product interface
2. **Database Version Upgrade**: Migrate from version 1 to version 2 with Dexie.js
3. **Service Extensions**: ShoppingService.updateCheckedState() method
4. **Context Extensions**: ShoppingContext CHECK_ITEM and UNCHECK_ITEM actions
5. **UI Updates**: ShoppingListItem with MUI Checkbox component
6. **Independent State**: isChecked separate from isOnShoppingList (checked items stay on list)

**Architecture Extracted:**
- Service layer patterns from architecture document
- State management patterns (Context + useReducer)
- Component architecture (ShoppingListItem modification)
- Error handling standards (handleError utility, logger)
- Naming conventions (PascalCase, camelCase, @/ imports)
- Database schema management (Dexie.js versioning and migrations)

**Previous Story Intelligence:**
- All files from Stories 3.1, 3.2, and 3.3 documented
- ShoppingService, ShoppingContext, ShoppingList patterns established
- ShoppingListItem component exists (needs checkbox)
- BottomNav independent polling from Story 3.2
- 270 tests passing baseline
- isOnShoppingList flag exists (Story 1.2)

**Technical Decisions:**
- Add isChecked field to Product interface (schema change required)
- Database migration from version 1 to version 2
- isChecked independent from isOnShoppingList (checked items stay on list)
- Strikethrough OR opacity for checked items (choose one consistently)
- Snackbar visual confirmation (follows Story 3.3 pattern)
- Comprehensive test coverage for check/uncheck + persistence + offline

**Challenges to Consider:**
- Database migration must be tested thoroughly (no data loss)
- Checkbox state synchronization with IndexedDB
- isChecked vs isOnShoppingList confusion (document clearly)
- No regressions to existing shopping list features
- Offline functionality verification (airplane mode testing)

### File List

**Files to be Created:**
- (None - no new files, only modifications to existing files)

**Files to be Modified:**
- src/services/database.ts - Add isChecked field to Product interface, upgrade to version 2
- src/services/shopping.ts - Add updateCheckedState() method
- src/services/shopping.test.ts - Add tests for updateCheckedState()
- src/features/shopping/context/ShoppingContext.tsx - Add CHECK_ITEM and UNCHECK_ITEM actions and toggleItemChecked() method
- src/features/shopping/context/ShoppingContext.test.tsx - Add tests for new actions and methods
- src/features/shopping/components/ShoppingListItem.tsx - Add Checkbox component with styling
- src/features/shopping/components/ShoppingListItem.test.tsx - Add tests for checkbox behavior

**Files to be Read/Verified:**
- src/services/inventory.ts (verify auto add/remove logic unchanged)
- src/components/shared/Layout/BottomNav.tsx (verify count badge still works)
- src/features/inventory/context/InventoryContext.tsx (verify no regressions)
- All existing test files (verify no regressions)

---

## Change Log

**Date: 2026-01-30**
- Story created via create-story workflow
- Comprehensive context extracted from PRD, Architecture, UX Design, and Epics (Story 4.1, Lines 881-910)
- Previous story intelligence gathered from Stories 1.2, 2.1, 3.1, 3.2, and 3.3
- Git analysis of most recent commit (fc7e152) for code patterns
- Identified that isChecked flag requires database schema change (version 1 → version 2)
- Service layer, context, and component architecture specified
- Database migration strategy documented
- Story marked as ready-for-dev
- Feature branch to be created: feat/story-4-1-check-off-items-while-shopping
