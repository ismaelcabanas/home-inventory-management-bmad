# Story 9.2: User-Initiated Shopping Completion

Status: backlog

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
  - Large touch targets for buttons
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

### Project Structure Notes

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

**New Files to Create:**

1. **src/features/shopping/components/ShoppingCompletionDialog.tsx**
   - Dialog component with completion confirmation
   - Props: open, checkedCount, totalCount, onConfirm, onCancel
   - Different messaging for full vs partial completion
   - Two action buttons

2. **src/features/shopping/components/ShoppingCompletionDialog.test.tsx**
   - Component tests for ShoppingCompletionDialog
   - Test rendering, messaging, callbacks

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

## Change Log

**2026-03-02:** Story 9.2 created
- Defined user-initiated shopping completion
- 5 acceptance criteria specified
- Ready for implementation
