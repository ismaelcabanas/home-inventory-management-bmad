# Story 7.5: Redesign Shopping List Page Layout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want a cleaner, more efficient shopping list page that matches the inventory page design,
So that I have a consistent visual experience across the app and can easily manage my shopping list.

## Context

This is the **fifth story in Epic 7 - UX Improvements & Polish**. This epic focuses on post-MVP polish based on real usage and competitive analysis, addressing UX friction points discovered during implementation.

**Epic 7 Goal:** Improve the user experience based on competitive analysis and user feedback, making the app more intuitive, efficient, and visually polished.

**Why This Story Now:**
The inventory page was redesigned in Story 7.1 with centered headers, full-width cards, gradient backgrounds, and tap-to-cycle interactions. The shopping list page still uses the old MUI ListItem design, creating visual inconsistency. This story aligns the shopping list with the new inventory design pattern.

**Key UX Changes in This Story:**
1. **Centered header with icon** - Matches inventory page design
2. **Full-width edge-to-edge cards** - Maximizes screen usage (12px edge margins)
3. **Gradient card backgrounds** - Visual stock indication through color, matching inventory
4. **Improved checkbox visibility** - Better positioned for shopping mode
5. **3-dot menu per item** - For remove-from-list action

**Integration Points:**
- **Modifies:** ShoppingList component layout and header
- **Modifies:** ShoppingListItem component to use card design
- **Enhances:** Visual consistency with inventory page
- **Keeps:** ShoppingProgress, SpeedDial, AddProductsDialog from Story 7.4

## Acceptance Criteria

### AC1: Centered Header with Title and Icon

**Given** I open the application to the shopping list page
**When** I view the page header
**Then** I see a centered header with:
- Title "Shopping List"
- Shopping cart icon (🛒 or ShoppingCartIcon)
- Centered horizontally on the page
**And** The header is clearly visible at the top of the screen

### AC2: Full-Width Shopping List Cards with Minimal Padding

**Given** I am viewing the shopping list page
**When** Shopping list items are displayed
**Then** The cards use full screen width with minimal padding
**And** Edge margins are 12px (not the default 16px+)
**And** Cards extend edge-to-edge within the 12px margins
**And** No unnecessary whitespace on card sides

### AC3: Shopping List Card Visual Design

**Given** I am viewing the shopping list page
**When** I look at each shopping list card
**Then** Each card displays:
- Product name on line 1 (prominent)
- Stock status text on line 2 (e.g., "In stock", "Running low", "Almost empty", "Empty")
- Color-coded gradient background indicating stock level
- Checkbox for checking off items (when in Shopping Mode)
- 3-dot action menu icon (⋮) positioned for Remove access

### AC4: Gradient Background Colors by Stock Level

**Given** I view shopping list items with different stock levels
**When** I look at the card backgrounds
**Then** Each stock level has a distinct gradient matching inventory:
- **High:** `linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)` with `border-left: 4px solid #4caf50` (green)
- **Medium:** `linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)` with `border-left: 4px solid #ff9800` (yellow/orange)
- **Low:** `linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)` with `border-left: 4px solid #ff5722` (orange/red)
- **Empty:** `linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)` with `border-left: 4px solid #f44336` (red)
**And** Colors provide sufficient contrast for text readability (NFR8)

### AC5: Checkbox Interaction for Shopping Mode

**Given** I am in Shopping Mode
**When** I tap the checkbox on a shopping list item
**Then** The item is marked as checked
**And** A visual strikethrough or dimming effect appears on the product name
**And** The checkbox shows a checked state
**And** The progress indicator updates to reflect the change
**And** A snackbar confirmation appears

### AC6: 3-Dot Menu for Remove Action

**Given** I want to remove an item from the shopping list
**When** I tap the 3-dot menu (⋮) on an item
**Then** A menu appears with "Remove from list" option
**And** Tapping "Remove from list" removes the item
**And** The item disappears from the list
**And** The change persists to the database

### AC7: SpeedDial Positioning (No Changes)

**Given** I want to access shopping list actions
**When** I look at the bottom of the content area
**Then** I see the existing SpeedDial with actions (Add Products, Shopping Mode toggle)
**And** The SpeedDial is positioned in the bottom-right corner (from Story 7.4)
**And** The SpeedDial does not overlap the bottom navigation

### AC8: Shopping Progress Indicator (No Changes)

**Given** I am viewing the shopping list
**When** I look at the top of the list
**Then** I see the progress indicator showing X of Y items collected
**And** The indicator updates when items are checked/unchecked

### AC9: Tap Target Sizes (Accessibility)

**Given** I am using the app on a mobile device
**When** I interact with any interactive element
**Then** All touch targets meet minimum 44x44 pixels (NFR8.1)
**And** The checkbox is 48x48px
**And** The 3-dot menu (⋮) is tappable
**And** Card tap area is appropriate for interactions

### AC10: Visual Feedback for Actions

**Given** I check or uncheck an item
**When** The state change occurs
**Then** A snackbar confirmation appears
**And** The confirmation appears within 100ms (NFR1: <2 second response)
**And** The background color transition is smooth (not jarring)

## Tasks / Subtasks

### Task 1: Update ShoppingList Layout Structure (AC: #1, #2)

- [x] Subtask 1.1: Create centered header component
  - Modify ShoppingList.tsx to add centered header
  - Add shopping cart icon (🛒 or ShoppingCartIcon)
  - Center title "Shopping List" horizontally
  - Apply appropriate padding and styling

- [x] Subtask 1.2: Update container padding for full-width cards
  - Modify ShoppingList container to use 12px edge margins
  - Remove any additional padding that prevents edge-to-edge layout
  - Ensure cards extend to edges within 12px margins

- [x] Subtask 1.3: Write layout tests
  - Test header is centered
  - Test edge margins are 12px
  - Test cards extend full width within margins

### Task 2: Redesign ShoppingListItem with Card and Gradient Backgrounds (AC: #3, #4)

- [x] Subtask 2.1: Update ShoppingListItem to use Card component
  - Modify ShoppingListItem.tsx to use MUI Card instead of ListItem
  - Apply gradient styles based on stock level from stockLevels.ts utility
  - Add border-left color indicator (4px solid)
  - Use 12px margins for edge-to-edge layout

- [x] Subtask 2.2: Update ShoppingListItem content layout
  - Product name on line 1 (Typography variant="body1" or "h6")
  - Stock status text on line 2 (Typography variant="body2")
  - Position checkbox on right side (keep existing functionality)
  - Add 3-dot menu icon (IconButton with MoreVertIcon)

- [x] Subtask 2.3: Write ShoppingListItem visual tests
  - Test each stock level displays correct gradient
  - Test border-left color is correct
  - Test product name and status text are visible
  - Test text contrast meets accessibility standards (NFR8)

### Task 3: Implement 3-Dot Menu with Remove Action (AC: #6)

- [x] Subtask 3.1: Add 3-dot menu to ShoppingListItem
  - Add IconButton with MoreVertIcon to each card
  - Position menu icon appropriately (top-right of card)
  - Ensure menu click does NOT trigger checkbox

- [x] Subtask 3.2: Implement remove from list functionality
  - Add Menu component with "Remove from list" option
  - Call ShoppingService.removeFromList() when remove is tapped
  - Refresh shopping list after removal
  - Add confirmation snackbar

- [x] Subtask 3.3: Write menu and remove tests
  - Test menu opens when 3-dot icon tapped
  - Test remove option removes item from list
  - Test snackbar confirmation appears
  - Test menu click does not trigger checkbox

### Task 4: Maintain Existing Functionality (AC: #5, #7, #8, #9, #10)

- [x] Subtask 4.1: Verify checkbox functionality still works
  - Test checkbox toggles checked state
  - Test snackbar confirmation appears
  - Test progress indicator updates
  - Test strikethrough/dimming effect works

- [x] Subtask 4.2: Verify SpeedDial still works
  - Test SpeedDial renders in correct position (bottom-right)
  - Test Add Products action opens dialog
  - Test Shopping Mode toggle works

- [x] Subtask 4.3: Verify ShoppingProgress still works
  - Test progress indicator shows correct counts
  - Test indicator updates when items checked

- [x] Subtask 4.4: Verify accessibility standards
  - Test all touch targets are 44x44px minimum
  - Test text contrast on all gradient backgrounds
  - Test keyboard navigation works
  - Test screen reader announcements

### Task 5: Integration and Layout Tests (AC: All)

- [x] Subtask 5.1: Write integration tests for complete shopping list flow
  - Test: Shopping list displays with card layout
  - Test: Checkbox toggles checked state with visual feedback
  - Test: Menu opens and remove action works
  - Test: Progress indicator updates correctly

- [x] Subtask 5.2: Write layout tests for mobile viewport
  - Test header is centered on mobile
  - Test cards are full-width (12px margins)
  - Test SpeedDial doesn't overlap bottom navigation

- [x] Subtask 5.3: Write visual regression tests
  - Test gradients match inventory page design
  - Test text is readable on all backgrounds
  - Test checked state visual feedback

### Task 6: Manual Testing and Polish (AC: All)

- [x] Subtask 6.1: Manual testing on mobile device
  - Test cards look good on mobile screen
  - Test checkbox is easily tappable
  - Test 3-dot menu is accessible
  - Test gradients match inventory page

- [x] Subtask 6.2: Manual testing on desktop viewport
  - Test layout works on larger screens
  - Test cards don't become too wide on desktop
  - Test centered header looks good on desktop

- [x] Subtask 6.3: Visual polish adjustments
  - Fine-tune spacing/margins for visual balance
  - Ensure transitions are smooth (not jarring)
  - Verify overall aesthetic matches inventory page

## Dev Notes

### Critical Implementation Requirements

**This is a UX Redesign Story:**

This story focuses on visual and interaction improvements to align the shopping list with the inventory page design from Story 7.1. The core shopping list functionality already works. This story refines the UX based on the established design pattern.

**Key Changes:**
1. **Visual redesign:** Full-width cards with gradient backgrounds matching inventory
2. **Layout improvement:** Centered header, 12px margins
3. **Interaction enhancement:** 3-dot menu for remove action
4. **Consistency:** Matching inventory page design patterns

**What Stays the Same:**
- Shopping list data model (no changes needed)
- Service layer methods (no changes needed)
- Context pattern (no changes needed)
- Checkbox functionality (keep existing)
- ShoppingProgress component (keep existing)
- SpeedDial actions (keep existing)
- AddProductsDialog (keep existing from Story 7.4)

**What Changes:**
- ShoppingList layout (centered header, 12px margins)
- ShoppingListItem component (Card instead of ListItem, gradient backgrounds, 3-dot menu)
- Visual appearance (match inventory page design)

**Architecture Compliance:**

**From Architecture Document:**

**Component Architecture:**
- Feature-based folder structure: src/features/shopping/components/
- Each feature contains: components/, context/, hooks/, types/ subdirectories
- Shared components in src/components/shared/
- Co-locate test files with source files (Component.test.tsx)

**State Management Pattern:**
- Use React Context API + useReducer for state
- One Context per feature: ShoppingContext
- All state updates immutable (spread operators, no mutations)
- Custom hook throws error if used outside provider

**UX Design Patterns:**

**From UX Design Document:**

**Mobile-First Design:**
- Primary platform: Mobile browsers for end users
- Touch targets minimum 44x44 points (NFR8.1)
- High contrast for bright environments (NFR8)
- Fast response times (<2 seconds for all actions, NFR1)

**Interaction Principles:**
- Single-tap primary actions (no confirmation dialogs for common operations)
- Immediate visual feedback (<2 second response times build trust)
- 4-state stock system (High/Medium/Low/Empty)

**Design Consistency:**
- Shopping list should match inventory page visual design
- Gradient backgrounds indicate stock level
- Centered headers with icons
- Full-width cards with minimal padding

### Project Structure Notes

**Files to Modify:**
```
src/
├── features/
│   └── shopping/
│       ├── components/
│       │   ├── ShoppingList.tsx              # MODIFY - Layout structure (header, margins)
│       │   ├── ShoppingList.test.tsx         # MODIFY - Add layout tests
│       │   ├── ShoppingListItem.tsx          # MODIFY - Card design, gradients, 3-dot menu
│       │   └── ShoppingListItem.test.tsx     # MODIFY - Add visual and interaction tests
│       └── context/
│           └── ShoppingContext.tsx           # NO CHANGES - Use existing methods
└── utils/
    └── stockLevels.ts                         # REUSE - Get gradient styles from this utility
```

**Reusing stockLevels Utility (from Story 7.1):**
```typescript
// Already exists in src/utils/stockLevels.ts
export const getStockLevelGradient = (level: StockLevel): string => {
  const gradients = {
    high: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    medium: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
    low: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    empty: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  };
  return gradients[level];
};

export const getStockLevelBorderColor = (level: StockLevel): string => {
  const colors = {
    high: '#4caf50',    // green
    medium: '#ff9800',  // yellow/orange
    low: '#ff5722',     // orange/red
    empty: '#f44336',   // red
  };
  return colors[level];
};

export const getStockLevelText = (level: StockLevel): string => {
  const labels = {
    high: 'In stock',
    medium: 'Running low',
    low: 'Almost empty',
    empty: 'Empty',
  };
  return labels[level];
};
```

**Card Component Implementation:**
```typescript
// ShoppingListItem.tsx - New card structure
import { Card, CardContent, Box, IconButton } from '@mui/material';
import { getStockLevelGradient, getStockLevelBorderColor, getStockLevelText } from '@/utils/stockLevels';

<Card
  sx={{
    background: getStockLevelGradient(product.stockLevel),
    borderLeft: `4px solid ${getStockLevelBorderColor(product.stockLevel)}`,
    margin: '0 12px 12px 12px', // 12px edge margins
    borderRadius: 1,
  }}
>
  <CardContent sx={{ padding: '12px 16px' }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      {/* Product info */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {product.name}
        </Typography>
        <Typography variant="body2">
          {getStockLevelText(product.stockLevel)}
        </Typography>
      </Box>

      {/* Checkbox (when in Shopping Mode) */}
      {isShoppingMode && (
        <Checkbox checked={product.isChecked} onChange={handleCheckboxChange} />
      )}

      {/* 3-dot menu */}
      <IconButton onClick={handleMenuOpen}>
        <MoreVertIcon />
      </IconButton>
    </Box>
  </CardContent>
</Card>
```

### Previous Story Learnings

**From Story 7.1 (Redesign Inventory Page Layout):**
- Created stockLevels.ts utility with gradient styles
- Used Card component with gradient backgrounds
- Centered header pattern with icon
- 12px edge margins for full-width layout
- Tap-to-cycle interaction (different from shopping list - we use checkbox)

**From Story 7.4 (Add FAB to Shopping List Page):**
- ShoppingList.tsx structure with SpeedDial
- AddProductsDialog component (keep unchanged)
- SpeedDial positioning: bottom: 80px, right: 16px
- ShoppingContext methods: addToList, removeFromList, toggleItemChecked

**From Epic 4 (Shopping Mode):**
- ShoppingProgress component (keep unchanged)
- Checkbox functionality with snackbar confirmation
- isShoppingMode state for conditional checkbox rendering
- Checked state visual feedback (strikethrough, opacity)

**From Story 4.1 (Check Off Items While Shopping):**
- ShoppingListItem originally created with ListItem
- Checkbox with snackbar confirmation
- toggleItemChecked() method in ShoppingContext

**Applying to Story 7.5:**
- Reuse stockLevels.ts utility from Story 7.1
- Follow card design pattern from Story 7.1
- Keep ShoppingProgress from Epic 4
- Keep checkbox functionality from Epic 4
- Add 3-dot menu for remove action (new)
- Replace ListItem with Card component

**Key Considerations:**
- This is primarily a **visual redesign**, not new features
- Database and service layer need NO changes
- Focus on component-level changes (ShoppingList, ShoppingListItem)
- Tests should verify visual rendering and interactions
- Accessibility is important: contrast, touch targets, screen readers

### Technical Implementation Notes

**Gradient Background Implementation (same as inventory):**

Using MUI's sx prop:
```typescript
<Card
  sx={{
    background: getStockLevelGradient(product.stockLevel),
    borderLeft: `4px solid ${getStockLevelBorderColor(product.stockLevel)}`,
    margin: '0 12px 12px 12px',
    borderRadius: 1,
  }}
>
  {/* Card content */}
</Card>
```

**Centered Header Implementation (same as inventory):**
```typescript
<Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    py: 2,
  }}
>
  <ShoppingCartIcon sx={{ mr: 1 }} />
  <Typography variant="h6">
    Shopping List
  </Typography>
</Box>
```

**3-Dot Menu Implementation:**
```typescript
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  setAnchorEl(event.currentTarget);
};

const handleMenuClose = () => {
  setAnchorEl(null);
};

const handleRemove = async () => {
  await removeFromList(product.id);
  handleMenuClose();
  // Show confirmation snackbar
};

<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleMenuClose}
>
  <MenuItem onClick={handleRemove}>Remove from list</MenuItem>
</Menu>
```

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7 Story 7.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Pattern]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Mobile-First Design]

**Previous Stories for Context:**
- [Source: _bmad-output/implementation-artifacts/7-1-redesign-inventory-page-layout-and-navigation.md] - Design pattern to follow
- [Source: _bmad-output/implementation-artifacts/7-4-add-fab-to-shopping-list-page.md] - Shopping list context
- [Source: _bmad-output/implementation-artifacts/4-1-check-off-items-while-shopping.md] - Checkbox functionality

**Current Implementation Files:**
- [Source: src/features/shopping/components/ShoppingList.tsx]
- [Source: src/features/shopping/components/ShoppingListItem.tsx]
- [Source: src/features/shopping/components/ShoppingProgress.tsx]
- [Source: src/utils/stockLevels.ts] - Reuse for gradients

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

### Completion Notes List

Story 7.5 implementation completed successfully. Redesigned Shopping List page to match Inventory page design from Story 7.1. Added centered header with shopping cart icon, full-width cards with 12px margins, and gradient backgrounds indicating stock levels. Replaced ListItem component with Card component and added 3-dot menu for remove-from-list action. All 619 tests pass including new tests for 3-dot menu functionality.

### File List

- `src/features/shopping/components/ShoppingList.tsx` (added centered header with icon, 12px margins)
- `src/features/shopping/components/ShoppingList.test.tsx` (updated for centered header and dual icon test)
- `src/features/shopping/components/ShoppingListItem.tsx` (replaced ListItem with Card, gradient backgrounds, 3-dot menu)
- `src/features/shopping/components/ShoppingListItem.test.tsx` (updated for Card design, new tests for 3-dot menu)
- `src/features/shopping/components/ShoppingListMobile.test.tsx` (updated for Box container instead of List)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-02-16 | Story created - UX redesign to match inventory page layout | Isma (via dev agent) |
| 2026-02-16 | Implementation complete - Shopping list redesigned with centered header, Card components, gradient backgrounds, and 3-dot menu | Amelia (Dev Agent) |
