# Story 9.2: User-Initiated Shopping Completion

Status: completed

## Story

As a **user**,
I want to explicitly end my shopping trip when I'm done (regardless of whether I found all items),
So that I can proceed to checkout and receipt scanning on my own terms.

## Context

This is the second story in Epic 9 - Shopping Lifecycle & Post-Shopping Experience. Currently, there's no clear "completion" event when shopping ends. Users just exit shopping mode without a sense of closure or transition to the next step (receipt scanning).

**User Journey:** Users shop at their own pace, finding as many items as they can. When done, they need a clear way to say "I'm finished shopping" that triggers the next step in the journey.

**User-Reported Problem:** Users may not find all items (out of stock, store doesn't carry it, etc.) but still want to end shopping. The completion should be user-initiated, not automatic based on checking all items.

**Critical Success Factor:** Completion must be user-initiated. The user decides when they're done, not the app. However, if all items ARE checked, the app should proactively prompt.

**Epic 4 & 9 Dependencies:** Story 4.4 established shopping mode exit. Story 9.1 added prominent start/end buttons. Story 9.2 adds a completion confirmation dialog that bridges to receipt scanning (Story 9.3).

## Acceptance Criteria

### AC1: Completion Confirmation Modal

**Given** I am in shopping mode with items on my list
**When** I tap "End Shopping" or the ✕ exit button
**Then** I see a completion confirmation modal
**And** The modal asks "Are you done shopping?"
**And** The modal shows how many items I checked off: "You collected 10 of 12 items"
**And** Two options are displayed: "Yes, I'm done" / "No, continue shopping"

### AC2: Confirm Shopping Completion

**Given** The completion modal is displayed
**When** I tap "Yes, I'm done"
**Then** Shopping mode exits (visual state returns to normal)
**And** All checked items remain checked (state preserved)
**And** Unchecked items stay on the list (not removed)
**And** I am immediately prompted with receipt scan option (Story 9.3)

### AC3: Cancel Shopping Completion

**Given** The completion modal is displayed
**When** I tap "No, continue shopping"
**Then** The modal closes
**And** I remain in shopping mode
**And** No state changes occur
**And** I can continue checking off items

### AC4: Auto-Prompt on All Items Checked

**Given** I checked ALL items on my list (checkedCount === totalCount)
**When** I tap the last checkbox
**Then** The completion modal automatically appears
**And** The message is celebratory: "Great job! You got everything! 🎉"
**And** The modal still shows "Yes, I'm done" / "No, continue shopping" options

### AC5: Helpful Messaging for Partial Completion

**Given** I checked SOME but NOT ALL items
**When** I tap "End Shopping"
**Then** The modal shows helpful messaging
**And** The message says: "You collected X of Y items. Any items not collected will stay on your list for next time."
**And** This reassures users that uncollected items won't be lost

## Tasks / Subtasks

### Task 1: Create ShoppingCompletionDialog Component (AC: #1, #4, #5)
- [ ] Subtask 1.1: Create src/features/shopping/components/ShoppingCompletionDialog.tsx
  - Use MUI Dialog component
  - Title: "Are you done shopping?"
  - Content: Shows collection progress ("You collected X of Y items")
  - Two buttons: "Yes, I'm done" (primary), "No, continue shopping" (secondary)
- [ ] Subtask 1.2: Add celebratory message for all items collected (AC4)
  - Detect when checkedCount === totalCount
  - Show "Great job! You got everything! 🎉"
  - Use same dialog structure with different messaging
- [ ] Subtask 1.3: Add helpful messaging for partial completion (AC5)
  - Show: "You collected X of Y items. Any items not collected will stay on your list for next time."
  - Reassure users that uncollected items persist
- [ ] Subtask 1.4: Style dialog for mobile-friendly appearance
  - Full width on mobile
  - Large touch targets for buttons (48px minimum per NFR8.1)
  - Clear visual hierarchy

### Task 2: Add Dialog Props and Callbacks (AC: #2, #3)
- [ ] Subtask 2.1: Define component interface
  - `open: boolean` - Whether dialog is visible
  - `checkedCount: number` - Number of items checked
  - `totalCount: number` - Total items on list
  - `onConfirm: () => void` - Callback when user confirms completion
  - `onCancel: () => void` - Callback when user cancels
- [ ] Subtask 2.2: Implement onConfirm callback
  - Calls endShoppingMode() from ShoppingContext
  - Triggers receipt scan prompt (Story 9.3)
  - Closes dialog
- [ ] Subtask 2.3: Implement onCancel callback
  - Closes dialog only
  - Does NOT exit shopping mode
  - User continues shopping

### Task 3: Integrate Dialog with ShoppingList Component (AC: #1, #2, #3)
- [ ] Subtask 3.1: Add dialog state to ShoppingList component
  - `completionDialogOpen: boolean` state
  - `openCompletionDialog()` and `closeCompletionDialog()` handlers
- [ ] Subtask 3.2: Import and render ShoppingCompletionDialog
  - Pass required props (open, checkedCount, totalCount, callbacks)
  - Position in component tree (outside list, within main Box)
- [ ] Subtask 3.3: Wire "End Shopping" button to open dialog
  - When tapped: open completion dialog (NOT immediate exit)
- [ ] Subtask 3.4: Wire ✕ exit button to open dialog
  - Same behavior as "End Shopping" button
- [ ] Subtask 3.5: Implement onConfirm callback
  - Call `endShoppingMode()` from ShoppingContext
  - Store completion state for Story 9.3 (receipt scan prompt)
  - Close dialog
- [ ] Subtask 3.6: Implement onCancel callback
  - Close dialog only
  - Remain in shopping mode

### Task 4: Auto-Prompt on Last Item Checked (AC: #4)
- [ ] Subtask 4.1: Detect when all items are checked
  - Compare `progress.checkedCount === progress.totalCount`
  - Use useEffect to watch for this condition
- [ ] Subtask 4.2: Auto-open completion dialog when all checked
  - Only if not already open (prevent duplicate dialogs)
  - Show celebratory message
- [ ] Subtask 4.3: Ensure dialog doesn't interfere with checking
  - Small delay after last checkbox before showing dialog
  - Allow user to see the checkmark before dialog appears

### Task 5: Write Comprehensive Tests
- [ ] Subtask 5.1: Create src/features/shopping/components/ShoppingCompletionDialog.test.tsx
  - [ ] Test dialog renders with correct props
  - [ ] Test dialog shows correct item counts
  - [ ] Test celebratory message when all items collected
  - [ ] Test helpful message for partial completion
  - [ ] Test "Yes, I'm done" button calls onConfirm
  - [ ] Test "No, continue shopping" button calls onCancel
- [ ] Subtask 5.2: Update src/features/shopping/components/ShoppingList.test.tsx
  - [ ] Test completion dialog opens when "End Shopping" tapped
  - [ ] Test completion dialog opens when ✕ tapped
  - [ ] Test completion dialog auto-opens when all items checked
  - [ ] Test onConfirm exits shopping mode
  - [ ] Test onCancel keeps user in shopping mode
  - [ ] Test checked/unchecked states preserved after completion

### Task 6: Verify Integration and Regression Testing
- [ ] Subtask 6.1: Verify Story 4.4 shopping mode functionality still works
- [ ] Subtask 6.2: Verify Story 9.1 enhanced entry/exit still works
- [ ] Subtask 6.3: Verify dialog doesn't break existing checkbox functionality
- [ ] Subtask 6.4: Test complete flow:
  - Start shopping → Check some items → End shopping → See dialog
  - Confirm → Exit shopping mode → See receipt scan prompt (Story 9.3)
  - Start shopping → Check all items → Auto-dialog appears
  - Cancel → Remain in shopping mode
- [ ] Subtask 6.5: Verify mobile layout works correctly (dialog sizing)
- [ ] Subtask 6.6: Run ESLint and verify 0 errors, 0 warnings
- [ ] Subtask 6.7: Run TypeScript compiler and verify clean compilation
- [ ] Subtask 6.8: Verify app builds successfully with `npm run build`

## Dev Notes

### Critical Implementation Requirements

**Shopping Completion Pattern:**

Story 9.2 adds a completion confirmation dialog that provides closure to the shopping experience and bridges to receipt scanning. The key is user-initiated completion with helpful messaging.

**Implementation Overview:**

1. **ShoppingCompletionDialog Component:** New dialog component
   - Shows collection progress (X of Y items collected)
   - Two actions: Confirm completion or continue shopping
   - Different messaging based on completion state
   - Celebratory when all items found, helpful when partial

2. **Integration with ShoppingList:** Wire dialog to exit buttons
   - "End Shopping" and ✕ buttons now open dialog (not immediate exit)
   - Dialog provides confirmation before exiting
   - User can cancel and continue shopping

3. **Auto-Prompt on Complete:** Proactive when all items checked
   - Detect when checkedCount === totalCount
   - Auto-open dialog with celebratory message
   - Small delay to avoid interfering with checking

4. **Bridge to Story 9.3:** Prepare for receipt scan prompt
   - Store completion state when user confirms
   - Story 9.3 will use this to trigger receipt scan prompt
   - Ensure smooth transition between stories

**Architecture Compliance:**

**From Architecture Document:**

**UI/UX Requirements (NFR8):**
- Sufficient contrast for in-store (bright) and at-home (dim) environments
- 48px minimum touch targets for dialog buttons
- Clear visual feedback for all interactions

**State Management Pattern:**
- Dialog state managed in ShoppingList component
- Uses existing ShoppingContext for mode state
- No new context state needed

**Integration with Previous Stories:**
- Story 4.4: Uses existing endShoppingMode() method
- Story 9.1: Integrates with enhanced "End Shopping" button
- Story 9.3: Completion triggers receipt scan prompt

**User Experience Considerations:**

**Why User-Initiated?**
- Users may not find all items (out of stock, etc.)
- User decides when shopping is "done", not app
- Partial completion is valid and common

**Why Auto-Prompt on All Checked?**
- Provides positive reinforcement when user succeeds
- Recognizes the accomplishment of finding everything
- Still allows cancellation if user wants to continue

**Helpful Messaging:**
- Reassures users that uncollected items aren't lost
- Makes it clear that items persist for next shopping trip
- Reduces anxiety about "losing" items by not checking them

### Current Implementation Analysis

**ShoppingList.tsx Current Structure (from Story 9.1):**

The ShoppingList component currently has:
- **"Start Shopping" button** (lines 308-322): Contained variant, shows item count
- **"End Shopping" button** (lines 324-337): Outlined variant when in shopping mode
- **Header ✕ exit button** (lines 296-304): Visible only in shopping mode
- **Both buttons call `handleModeToggle()`** (line 45): This toggles shopping mode directly

**Key Changes Required:**

1. **Add Dialog State:** Manage completion dialog open/close state
2. **Modify Exit Handlers:** Both buttons should open dialog instead of immediate exit
3. **Add Auto-Prompt Logic:** Watch for all items checked condition
4. **Create Dialog Component:** New ShoppingCompletionDialog component

**ShoppingContext Methods Available:**
- `startShoppingMode()` - Already exists from Story 4.4
- `endShoppingMode()` - Already exists from Story 4.4
- `isShoppingMode` - State flag from Story 4.4
- `progress.checkedCount` - Number of checked items (from Story 4.2)
- `progress.totalCount` - Total items on list (from Story 4.2)

### Project Structure Notes

**Files to Create:**

1. **src/features/shopping/components/ShoppingCompletionDialog.tsx**
   - Dialog component with completion confirmation
   - Props: open, checkedCount, totalCount, onConfirm, onCancel
   - Different messaging for full vs partial completion
   - Two action buttons

2. **src/features/shopping/components/ShoppingCompletionDialog.test.tsx**
   - Component tests for ShoppingCompletionDialog
   - Test rendering, messaging, callbacks

**Files to Modify:**

1. **src/features/shopping/components/ShoppingList.tsx**
   - Add dialog state (completionDialogOpen, handlers)
   - Import and render ShoppingCompletionDialog
   - Wire "End Shopping" and ✕ buttons to open dialog
   - Implement auto-prompt logic when all items checked
   - Handle onConfirm/onCancel callbacks

2. **src/features/shopping/components/ShoppingList.test.tsx**
   - Add tests for completion dialog integration
   - Add tests for auto-prompt on all items checked
   - Add tests for onConfirm/onCancel behavior

**Testing Strategy:**

- Component tests for ShoppingCompletionDialog
- Integration tests for dialog in ShoppingList
- Tests for auto-prompt behavior
- Regression tests for existing functionality
- Mobile layout tests (dialog sizing)

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9]
- [Source: _bmad-output/implementation-artifacts/9-1-enhanced-shopping-mode-entry-and-visual-states.md]
- [Source: _bmad-output/implementation-artifacts/4-4-shopping-mode-toggle.md]

**Key Architecture Sections:**
- UI/UX Requirements: NFR8 (touch targets, contrast)
- Dialog patterns: Use MUI Dialog for confirmations
- State management: ShoppingContext for mode state

**MUI Components to Use:**
- Dialog (completion confirmation)
- DialogTitle, DialogContent, DialogActions (dialog structure)
- Button (confirm and cancel actions)
- Typography (messaging)

### Implementation Examples

**1. ShoppingCompletionDialog Component:**
```tsx
// src/features/shopping/components/ShoppingCompletionDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ShoppingCompletionDialogProps {
  open: boolean;
  checkedCount: number;
  totalCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ShoppingCompletionDialog({
  open,
  checkedCount,
  totalCount,
  onConfirm,
  onCancel,
}: ShoppingCompletionDialogProps) {
  const isComplete = checkedCount === totalCount;
  const isPartial = checkedCount > 0 && checkedCount < totalCount;

  // Determine title and message based on completion state
  const title = isComplete ? "Great job! You got everything! 🎉" : "Are you done shopping?";

  let message = `You collected ${checkedCount} of ${totalCount} items.`;
  if (isPartial) {
    message += " Any items not collected will stay on your list for next time.";
  }

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          No, continue shopping
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary" autoFocus>
          Yes, I'm done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**2. Integration with ShoppingList:**
```tsx
// Add to ShoppingList.tsx imports
import { ShoppingCompletionDialog } from './ShoppingCompletionDialog';

// Add state in ShoppingListContent component
const [completionDialogOpen, setCompletionDialogOpen] = useState(false);

// Open completion dialog (replaces handleModeToggle for exit)
const handleOpenCompletionDialog = () => {
  setCompletionDialogOpen(true);
};

const handleCloseCompletionDialog = () => {
  setCompletionDialogOpen(false);
};

// Confirm completion - exits shopping mode
const handleConfirmCompletion = async () => {
  await endShoppingMode();
  setCompletionDialogOpen(false);
  // Story 9.3: Will trigger receipt scan prompt here
};

// Cancel completion - stays in shopping mode
const handleCancelCompletion = () => {
  setCompletionDialogOpen(false);
};

// Update "End Shopping" button onClick (line 331)
// OLD: onClick={handleModeToggle}
// NEW: onClick={handleOpenCompletionDialog}

// Update ✕ exit button onClick (line 298)
// OLD: onClick={handleModeToggle}
// NEW: onClick={handleOpenCompletionDialog}

// Add dialog at the end of component tree (before closing </Box>)
<ShoppingCompletionDialog
  open={completionDialogOpen}
  checkedCount={progress.checkedCount}
  totalCount={progress.totalCount}
  onConfirm={handleConfirmCompletion}
  onCancel={handleCancelCompletion}
/>
```

**3. Auto-Prompt on All Items Checked:**
```tsx
// Add useEffect to ShoppingListContent component
useEffect(() => {
  // Auto-open completion dialog when all items are checked
  if (
    progress.checkedCount === progress.totalCount &&
    progress.totalCount > 0 &&
    !completionDialogOpen &&
    isShoppingMode
  ) {
    // Small delay to allow user to see the last checkmark
    const timer = setTimeout(() => {
      setCompletionDialogOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }
}, [progress.checkedCount, progress.totalCount, completionDialogOpen, isShoppingMode]);
```

### Integration with Event Bus (Story 8.1)

The ShoppingList component already uses event-driven synchronization from Story 8.1:
- Lines 24-35: Event listener for `INVENTORY_PRODUCT_UPDATED`
- When stock levels change in Inventory, ShoppingList auto-refreshes
- This behavior must be maintained - no changes to event handling needed

### Previous Story Intelligence (Story 9.1)

**Story 9.1 Key Learnings:**

1. **Button Positioning:** The "Start/End Shopping" buttons work well at 12px margins with 56px height
2. **Header Exit Button:** The ✕ button in header is positioned absolutely at right: 16px
3. **State Management:** ShoppingContext methods are reliable and work as expected
4. **Visual Feedback:** Background color change (action.hover) provides good visual indication

**Story 9.1 Code Patterns to Reuse:**

1. **Conditional Rendering:** Use `isShoppingMode` flag for conditional UI
2. **Button Styling:** Use `minHeight: 56, py: 1.5` for touch targets
3. **Handler Pattern:** Async handlers for mode changes

**Story 9.1 Potential Issues:**

1. **Immediate Exit:** The current `handleModeToggle` exits immediately - this needs to change
2. **No Confirmation:** Users might accidentally exit shopping mode - dialog solves this
3. **No Completion State:** There's no concept of "finished shopping" - Story 9.2 adds this

**Story 9.1 File Locations:**

- ShoppingList component: `src/features/shopping/components/ShoppingList.tsx`
- ShoppingContext: `src/features/shopping/context/ShoppingContext.tsx`
- Test file: `src/features/shopping/components/ShoppingList.test.tsx`

### Git Intelligence

**Recent Work Patterns:**

From the last 5 commits:
1. **Story 9.1** - Enhanced Shopping Mode Entry & Visual States
2. **Epic 9** - Shopping Lifecycle & Post-Shopping Experience setup
3. **Story 8.1** - Event-Driven Synchronization (replaced polling)
4. **Story 7.5** - Redesign Shopping List Page Layout
5. **Story 7.4** - Add FAB to Shopping List Page with SpeedDial

**Code Patterns Established:**

1. **MUI Component Usage:** Consistent use of MUI components (Dialog, Button, etc.)
2. **State Management:** React Context API with useReducer pattern
3. **Testing:** Vitest for unit/integration tests, co-located test files
4. **Styling:** Emotion (MUI's default) with sx prop
5. **Event-Driven:** EventBus for cross-context communication (Story 8.1)

**Recent Learning - Dialog Pattern:**

The codebase doesn't have many dialogs yet. Story 9.2 establishes the completion dialog pattern that Story 9.3 (receipt scan prompt) will also use.

### Dev Agent Record

### Agent Model Used

glm-4.7 (Claude Code)

### Debug Log References

None - story creation completed successfully.

### Completion Notes List

**Story 9.2 Context Analysis Complete:**

Epic 9, Story 9.2 focuses on user-initiated shopping completion with a confirmation dialog. The story provides closure to the shopping experience and bridges to receipt scanning (Story 9.3).

**Key Developer Guidance:**
1. Dialog must NOT exit shopping mode immediately - it requires user confirmation
2. Auto-prompt when all items checked provides positive reinforcement
3. Helpful messaging reassures users that uncollected items persist
4. Integration with existing ShoppingContext methods is critical
5. Dialog state is managed locally in ShoppingList component

**Technical Requirements:**
- New ShoppingCompletionDialog component
- Modify exit handlers in ShoppingList to open dialog
- Auto-prompt logic with useEffect watching progress
- Comprehensive test coverage for dialog and integration

**Architecture Alignment:**
- Uses existing ShoppingContext (no new state)
- MUI Dialog component for consistency
- 48px minimum touch targets (NFR8.1)
- Mobile-friendly full-width layout

**Next Steps:**
Story 9.3 will build on this by adding the receipt scan prompt after completion confirmation.

### File List

**New Files to Create:**
- `src/features/shopping/components/ShoppingCompletionDialog.tsx` - Completion confirmation dialog
- `src/features/shopping/components/ShoppingCompletionDialog.test.tsx` - Dialog component tests

**Files to Modify:**
- `src/features/shopping/components/ShoppingList.tsx` - Integrate dialog, modify exit handlers
- `src/features/shopping/components/ShoppingList.test.tsx` - Add integration tests

## Change Log

**2026-03-03:** Story 9.2 created with comprehensive context analysis
- Loaded epic requirements and story details
- Analyzed previous story (9.1) for context and patterns
- Extracted architecture requirements and compliance notes
- Reviewed current ShoppingList implementation
- Identified all files to create/modify
- Status set to ready-for-dev
