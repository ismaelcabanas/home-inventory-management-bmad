# Story 9.3: Post-Shopping Receipt Scan Prompt

Status: done

## Story

As a **user**,
I want to be prompted to scan my receipt immediately after ending shopping mode,
So that I can update my inventory while it's top of mind and complete the automation loop.

## Context

This is the third story in Epic 9 - Shopping Lifecycle & Post-Shopping Experience. Story 9.2 added the completion confirmation dialog that provides closure to the shopping experience. Story 9.3 bridges the gap between shopping completion and receipt scanning, creating a seamless transition to the final step of the automation loop.

**User Journey:** After confirming shopping completion, users are in the perfect mental state to scan their receipt - they've just finished shopping, the receipt is in hand (or in the bag), and the inventory update is top of mind. This story captures that moment.

**Critical Success Factor:** The prompt must be immediate and focused. Users should see the receipt scan option as the natural next step, not an interruption. The "I'll do it later" option must be prominent for users who can't scan immediately.

**Epic 9 Dependencies:** Story 9.1 established shopping mode states. Story 9.2 added the completion confirmation dialog. Story 9.3 adds the receipt scan prompt that appears after user confirms completion.

## Acceptance Criteria

### AC1: Receipt Scan Prompt Appears After Shopping Completion

**Given** I have confirmed "Yes, I'm done" in the shopping completion dialog (Story 9.2)
**When** The shopping completion modal closes
**Then** I immediately see a "Scan Receipt?" prompt modal
**And** The modal is focused and clear with:
  - Icon: 📸 Receipt icon
  - Title: "Scan Your Receipt"
  - Message: "Update your inventory automatically by scanning your receipt"
  - Primary CTA: "Scan Receipt" button (prominent, bottom of modal)
  - Secondary action: "I'll do it later" link (subtle, top-right or bottom)

### AC2: Scan Receipt Action Navigates to Scanner

**Given** The receipt scan prompt is displayed
**When** I tap "Scan Receipt"
**Then** I am navigated to the `/scan` route
**And** The receipt scanner camera activates
**And** The normal receipt scanning flow begins (already implemented in Epic 5)

### AC3: Defer Scanning Returns to Shopping List

**Given** The receipt scan prompt is displayed
**When** I tap "I'll do it later"
**Then** The modal closes
**And** I return to the Shopping List screen
**And** The "Start Shopping" button is available for next shopping trip
**And** My checked/unchecked item states are preserved

### AC4: Prompt Design is Focused and Clear

**Given** The receipt scan prompt is displayed
**When** I view the modal
**Then** The modal uses a clean, focused design with:
  - Receipt icon (📸 or CameraIcon) prominently displayed
  - Title "Scan Your Receipt" (large, clear typography)
  - Message explaining the benefit: "Update your inventory automatically by scanning your receipt"
  - "Scan Receipt" button as primary action (contained, prominent)
  - "I'll do it later" as secondary action (text button or link, subtle)
  - Full width on mobile for readability
  - Large touch targets (48px minimum per NFR8.1)

### AC5: Integration with Shopping Completion Flow

**Given** I tap "Yes, I'm done" in the shopping completion dialog (Story 9.2)
**When** Shopping mode exits
**Then** The receipt scan prompt appears immediately (no gap, no delay)
**And** The transition feels like a natural next step
**And** Both modals don't appear simultaneously (completion closes before receipt prompt opens)

## Tasks / Subtasks

### Task 1: Create ReceiptScanPromptDialog Component (AC: #1, #4)
- [ ] Subtask 1.1: Create src/features/shopping/components/ReceiptScanPromptDialog.tsx
  - Use MUI Dialog component
  - Title: "Scan Your Receipt"
  - Icon: 📸 or CameraIcon from MUI icons
  - Message: "Update your inventory automatically by scanning your receipt"
  - Two actions: "Scan Receipt" (primary), "I'll do it later" (secondary)
- [ ] Subtask 1.2: Style dialog for focused, clear appearance (AC4)
  - Full width on mobile (fullWidth prop)
  - Large touch targets (48px minimum per NFR8.1)
  - Prominent "Scan Receipt" button (contained variant)
  - Subtle "I'll do it later" (text button or link)
  - Receipt icon prominently displayed
- [ ] Subtask 1.3: Define component interface
  - `open: boolean` - Whether dialog is visible
  - `onScan: () => void` - Callback when user wants to scan
  - `onDefer: () => void` - Callback when user defers scanning

### Task 2: Integrate Prompt with ShoppingList Component (AC: #1, #5)
- [ ] Subtask 2.1: Add receipt prompt state to ShoppingList component
  - `receiptPromptOpen: boolean` state
  - `openReceiptPrompt()` and `closeReceiptPrompt()` handlers
- [ ] Subtask 2.2: Import and render ReceiptScanPromptDialog
  - Pass required props (open, onScan, onDefer)
  - Position in component tree (outside ShoppingCompletionDialog)
- [ ] Subtask 2.3: Wire shopping completion to open receipt prompt
  - In `handleConfirmCompletion()`, after `endShoppingMode()`:
    - Open receipt scan prompt
    - This creates the seamless transition
- [ ] Subtask 2.4: Implement onScan callback
  - Navigate to `/scan` route using React Router's `useNavigate()`
  - Close receipt prompt dialog
- [ ] Subtask 2.5: Implement onDefer callback
  - Close receipt prompt dialog
  - User stays on Shopping List screen
  - No navigation, no state changes

### Task 3: Add Navigation Hook for Routing (AC: #2)
- [ ] Subtask 3.1: Import useNavigate from react-router-dom
  - Add to ShoppingList.tsx imports
- [ ] Subtask 3.2: Initialize navigate hook in ShoppingListContent
  - `const navigate = useNavigate();`
- [ ] Subtask 3.3: Use navigate in onScan callback
  - `navigate('/scan');`
  - This triggers route change to ReceiptScanner

### Task 4: Handle Receipt Prompt State (AC: #3, #5)
- [ ] Subtask 4.1: Ensure prompt doesn't open if already open
  - Prevent duplicate dialogs
- [ ] Subtask 4.2: Ensure completion dialog closes before prompt opens
  - Sequence: completion dialog closes → small delay → receipt prompt opens
  - Creates natural transition feel
- [ ] Subtask 4.3: Verify both dialogs can't be open simultaneously
  - Only one dialog visible at any time

### Task 5: Write Comprehensive Tests
- [ ] Subtask 5.1: Create src/features/shopping/components/ReceiptScanPromptDialog.test.tsx
  - [ ] Test dialog renders with correct props
  - [ ] Test dialog shows correct title and message
  - [ ] Test "Scan Receipt" button calls onScan
  - [ ] Test "I'll do it later" button calls onDefer
  - [ ] Test receipt icon is displayed
  - [ ] Test dialog styling (full width, touch targets)
- [ ] Subtask 5.2: Update src/features/shopping/components/ShoppingList.test.tsx
  - [ ] Test receipt prompt opens after shopping completion
  - [ ] Test onScan navigates to /scan route
  - [ ] Test onDefer closes prompt without navigation
  - [ ] Test prompt doesn't open after defer
  - [ ] Test completion dialog closes before prompt opens
  - [ ] Test both dialogs can't be open simultaneously

### Task 6: Verify Integration and Regression Testing
- [ ] Subtask 6.1: Verify Story 4.4 shopping mode functionality still works
- [ ] Subtask 6.2: Verify Story 9.1 enhanced entry/exit still works
- [ ] Subtask 6.3: Verify Story 9.2 completion dialog still works
- [ ] Subtask 6.4: Test complete flow:
  - Start shopping → Check items → End shopping → See completion dialog
  - Confirm "Yes, I'm done" → See receipt scan prompt
  - Tap "Scan Receipt" → Navigate to /scan
  - Start shopping → Check items → End shopping → Confirm
  - Tap "I'll do it later" → Return to Shopping List
- [ ] Subtask 6.5: Verify mobile layout works correctly (dialog sizing)
- [ ] Subtask 6.6: Verify /scan route works correctly
- [ ] Subtask 6.7: Run ESLint and verify 0 errors, 0 warnings
- [ ] Subtask 6.8: Run TypeScript compiler and verify clean compilation
- [ ] Subtask 6.9: Verify app builds successfully with `npm run build`

## Dev Notes

### Critical Implementation Requirements

**Receipt Scan Prompt Pattern:**

Story 9.3 adds a receipt scan prompt that appears immediately after shopping completion. The key is making this feel like a natural next step, not an interruption. The prompt should be clear, focused, and easily dismissible.

**Implementation Overview:**

1. **ReceiptScanPromptDialog Component:** New dialog component
   - Focused design with receipt icon
   - Clear title: "Scan Your Receipt"
   - Benefit message: "Update your inventory automatically by scanning your receipt"
   - Primary action: "Scan Receipt" (navigates to /scan)
   - Secondary action: "I'll do it later" (closes prompt)

2. **Integration with ShoppingList:** Wire prompt to completion flow
   - After `endShoppingMode()` in `handleConfirmCompletion()`
   - Open receipt scan prompt
   - Creates seamless transition from shopping → receipt scanning

3. **Navigation to Scanner:** Use React Router for navigation
   - `useNavigate()` hook for programmatic navigation
   - `navigate('/scan')` triggers route change
   - ReceiptScanner component handles camera activation

4. **Defer Handling:** Allow users to scan later
   - "I'll do it later" closes prompt
   - User returns to Shopping List
   - No state changes, preserved for next time

**Architecture Compliance:**

**From Architecture Document:**

**UI/UX Requirements (NFR8):**
- Sufficient contrast for readability
- 48px minimum touch targets for dialog buttons
- Clear visual feedback for all interactions

**State Management Pattern:**
- Dialog state managed in ShoppingList component
- Uses React Router for navigation (not context)
- No new context state needed

**Integration with Previous Stories:**
- Story 4.4: Uses existing shopping mode state
- Story 9.1: Integrates with enhanced shopping mode UI
- Story 9.2: Triggered after completion confirmation
- Epic 5: Leverages existing ReceiptScanner at /scan route

**User Experience Considerations:**

**Why Immediate Prompt?**
- Users have receipt in hand (or in bag)
- Inventory update is top of mind
- Natural continuation of shopping journey
- Reduces chance of forgetting to scan

**Why "I'll do it later"?**
- Not everyone can scan immediately (driving, busy, etc.)
- Prevents user frustration from forced scanning
- Users can still access scanner via SpeedDial (Story 9.4)

**Focused Design:**
- Single purpose: prompt for receipt scan
- Clear benefit messaging
- Two clear actions
- No distractions or extra options

### Current Implementation Analysis

**ShoppingList.tsx Current Structure (from Story 9.2):**

The ShoppingList component currently has:
- **ShoppingCompletionDialog** (lines 178-184 in return): Shows after "End Shopping" or ✕
- **handleConfirmCompletion()** (lines 97-101): Calls `endShoppingMode()` and has comment for Story 9.3
- **Completion dialog state** (line 26): `completionDialogOpen` boolean state

**Key Integration Point:**

In `handleConfirmCompletion()` (line 97), there's a comment:
```tsx
// Story 9.3: Will trigger receipt scan prompt here
```

This is exactly where Story 9.3 should open the receipt scan prompt after completion.

**Existing Navigation:**

The app uses React Router v6 for navigation:
- `/` - InventoryList
- `/shopping` - ShoppingList
- `/scan` - ReceiptScanner (already implemented in Epic 5)

**ShoppingContext Methods Available:**
- `startShoppingMode()` - Already exists from Story 4.4
- `endShoppingMode()` - Already exists from Story 4.4
- `isShoppingMode` - State flag from Story 4.4
- `progress.checkedCount` - Number of checked items (from Story 4.2)
- `progress.totalCount` - Total items on list (from Story 4.2)

### Project Structure Notes

**Files to Create:**

1. **src/features/shopping/components/ReceiptScanPromptDialog.tsx**
   - Dialog component with receipt scan prompt
   - Props: open, onScan, onDefer
   - Focused design with receipt icon
   - Two action buttons

2. **src/features/shopping/components/ReceiptScanPromptDialog.test.tsx**
   - Component tests for ReceiptScanPromptDialog
   - Test rendering, callbacks, styling

**Files to Modify:**

1. **src/features/shopping/components/ShoppingList.tsx**
   - Add receipt prompt state (receiptPromptOpen, handlers)
   - Import and render ReceiptScanPromptDialog
   - Import useNavigate from react-router-dom
   - Modify `handleConfirmCompletion()` to open receipt prompt after completion
   - Implement onScan (navigate to /scan) and onDefer (close prompt) callbacks

2. **src/features/shopping/components/ShoppingList.test.tsx**
   - Add tests for receipt prompt integration
   - Add tests for navigation to /scan
   - Add tests for onDefer behavior
   - Add tests for dialog sequencing (completion → receipt prompt)

**Testing Strategy:**

- Component tests for ReceiptScanPromptDialog
- Integration tests for prompt in ShoppingList
- Navigation tests for /scan route
- Dialog sequencing tests
- Regression tests for existing functionality
- Mobile layout tests (dialog sizing)

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9]
- [Source: _bmad-output/implementation-artifacts/9-2-user-initiated-shopping-completion.md]
- [Source: _bmad-output/implementation-artifacts/4-4-shopping-mode-toggle.md]

**Key Architecture Sections:**
- UI/UX Requirements: NFR8 (touch targets, contrast)
- Dialog patterns: Use MUI Dialog for prompts
- Navigation: React Router v6 for route changes
- State management: Local component state for dialogs

**MUI Components to Use:**
- Dialog (receipt scan prompt)
- DialogTitle, DialogContent, DialogActions (dialog structure)
- Button (scan and defer actions)
- Typography (title and message)
- CameraIcon or receipt icon (📸)

### Implementation Examples

**1. ReceiptScanPromptDialog Component:**
```tsx
// src/features/shopping/components/ReceiptScanPromptDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import CameraIcon from '@mui/icons-material/CameraAlt';

export interface ReceiptScanPromptDialogProps {
  open: boolean;
  onScan: () => void;
  onDefer: () => void;
}

export function ReceiptScanPromptDialog({
  open,
  onScan,
  onDefer,
}: ReceiptScanPromptDialogProps) {
  return (
    <Dialog open={open} onClose={onDefer} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraIcon />
          Scan Your Receipt
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Update your inventory automatically by scanning your receipt
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDefer} color="primary">
          I'll do it later
        </Button>
        <Button onClick={onScan} variant="contained" color="primary" autoFocus>
          Scan Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**2. Integration with ShoppingList:**
```tsx
// Add to ShoppingList.tsx imports
import { useNavigate } from 'react-router-dom';
import { ReceiptScanPromptDialog } from './ReceiptScanPromptDialog';

// In ShoppingListContent component, add:
const navigate = useNavigate();

// Add receipt prompt state
const [receiptPromptOpen, setReceiptPromptOpen] = useState(false);

// Open receipt prompt handler
const handleOpenReceiptPrompt = () => {
  setReceiptPromptOpen(true);
};

// Close receipt prompt handler
const handleCloseReceiptPrompt = () => {
  setReceiptPromptOpen(false);
};

// Navigate to scanner handler
const handleNavigateToScanner = () => {
  setReceiptPromptOpen(false);
  navigate('/scan');
};

// Update handleConfirmCompletion (line 97)
const handleConfirmCompletion = async () => {
  await endShoppingMode();
  setCompletionDialogOpen(false);
  // Story 9.3: Open receipt scan prompt after completion
  setTimeout(() => {
    setReceiptPromptOpen(true);
  }, 100); // Small delay for smooth transition
};

// Add ReceiptScanPromptDialog to component tree (after ShoppingCompletionDialog)
<ReceiptScanPromptDialog
  open={receiptPromptOpen}
  onScan={handleNavigateToScanner}
  onDefer={handleCloseReceiptPrompt}
/>
```

**3. Dialog Sequencing:**
```tsx
// Ensure dialogs don't overlap
// In handleConfirmCompletion:
const handleConfirmCompletion = async () => {
  await endShoppingMode();
  setCompletionDialogOpen(false); // Close completion dialog first
  // Small delay ensures completion dialog closes before receipt prompt opens
  setTimeout(() => {
    setReceiptPromptOpen(true); // Then open receipt prompt
  }, 100);
};

// In handleCancelCompletion (from Story 9.2):
const handleCancelCompletion = () => {
  setCompletionDialogOpen(false);
  setReceiptPromptOpen(false); // Ensure receipt prompt is closed too
};
```

### Integration with Event Bus (Story 8.1)

The ShoppingList component already uses event-driven synchronization from Story 8.1:
- Lines 24-35: Event listener for `INVENTORY_PRODUCT_UPDATED`
- When stock levels change in Inventory, ShoppingList auto-refreshes
- This behavior must be maintained - no changes to event handling needed

### Previous Story Intelligence (Story 9.2)

**Story 9.2 Key Learnings:**

1. **Dialog Pattern:** ShoppingCompletionDialog established the dialog pattern for Story 9.3
2. **Dialog State Management:** Local component state works well for dialogs
3. **Sequencing:** Completion dialog closes before next action begins
4. **User Confirmation:** Two-step process (confirm → action) prevents accidental actions

**Story 9.2 Code Patterns to Reuse:**

1. **Dialog Structure:** Use MUI Dialog with DialogTitle, DialogContent, DialogActions
2. **Dialog State:** `open` boolean state with open/close handlers
3. **Callback Pattern:** onConfirm/onCancel pattern for dialog actions
4. **Button Styling:** Primary action (contained), secondary (text or outlined)

**Story 9.2 Integration Point:**

Story 9.2's `handleConfirmCompletion()` has a comment specifically for Story 9.3:
```tsx
// Story 9.3: Will trigger receipt scan prompt here
```

This is the exact integration point - open receipt scan prompt after completion.

### Navigation Integration (React Router v6)

The app uses React Router v6 for navigation:
- Import `useNavigate` hook from 'react-router-dom'
- Call `navigate('/scan')` to trigger route change
- This is the standard pattern for programmatic navigation in React Router v6

**Note:** The ReceiptScanner component already exists and handles camera activation. Story 9.3 only needs to navigate to the /scan route.

### Dev Agent Record

### Agent Model Used

glm-4.7 (Claude Code)

### Debug Log References

None - story creation completed successfully.

### Completion Notes List

**Story 9.3 Context Analysis Complete:**

Epic 9, Story 9.3 focuses on prompting users to scan their receipt immediately after shopping completion. The story creates a seamless transition from shopping → receipt scanning, completing the automation loop.

**Key Developer Guidance:**
1. Receipt prompt must open AFTER completion dialog closes (no overlap)
2. Navigation to /scan uses React Router's useNavigate hook
3. "I'll do it later" allows users to defer scanning without penalty
4. Focused dialog design - single purpose, clear actions
5. Integration point is handleConfirmCompletion() in ShoppingList.tsx

**Technical Requirements:**
- New ReceiptScanPromptDialog component
- Modify handleConfirmCompletion to open receipt prompt
- Add useNavigate hook for /scan navigation
- Implement dialog sequencing (completion closes → receipt opens)
- Comprehensive test coverage for dialog and navigation

**Architecture Alignment:**
- Uses existing /scan route (ReceiptScanner from Epic 5)
- MUI Dialog component for consistency
- 48px minimum touch targets (NFR8.1)
- Mobile-friendly full-width layout
- React Router v6 for navigation

**Next Steps:**
Story 9.4 will add "Scan Receipt" to the Shopping List SpeedDial, allowing users to access receipt scanning at any time (not just after shopping completion).

### File List

**New Files to Create:**
- `src/features/shopping/components/ReceiptScanPromptDialog.tsx` - Receipt scan prompt dialog
- `src/features/shopping/components/ReceiptScanPromptDialog.test.tsx` - Dialog component tests

**Files to Modify:**
- `src/features/shopping/components/ShoppingList.tsx` - Integrate receipt prompt, add navigation
- `src/features/shopping/components/ShoppingList.test.tsx` - Add integration and navigation tests

## Change Log

**2026-03-03:** Story 9.3 created with comprehensive context analysis
- Loaded epic requirements and story details
- Analyzed previous stories (9.1, 9.2) for context and patterns
- Analyzed current ShoppingList implementation
- Analyzed existing ReceiptScanner navigation
- Identified all files to create/modify
- Status set to ready-for-dev
