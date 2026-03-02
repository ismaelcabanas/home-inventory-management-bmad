# Story 9.3: Post-Shopping Receipt Scan Prompt

Status: backlog

## Story

As a **user**,
I want to be prompted to scan my receipt immediately after ending shopping mode,
So that I can update my inventory while it's top of mind and complete the automation loop.

## Context

This is the third story in Epic 9 - Shopping Lifecycle & Post-Shopping Experience. Currently, there's no bridge between shopping completion and receipt scanning. Users exit shopping mode and are left at the shopping list with no clear next step.

**User Journey:** After completing shopping (confirming in Story 9.2), users are in the perfect moment to scan their receipt. The app should guide them to this next action seamlessly.

**User-Reported Problem:** After shopping, users don't have a clear way to access receipt scanning. The scan action requires manual navigation, breaking the flow and reducing likelihood of completing the inventory update loop.

**Critical Success Factor:** The receipt scan prompt must appear immediately after shopping completion, while receipt is still in hand. This is the critical moment to capture the receipt and complete the automation loop.

**Epic 5 & 9 Dependencies:** Story 5.1-5.4 implemented receipt scanning functionality. Story 9.2 handles shopping completion. Story 9.3 bridges these with a prompt modal.

## Acceptance Criteria

### AC1: Receipt Scan Prompt Modal

**Given** I have confirmed "Yes, I'm done" to end shopping (from Story 9.2)
**When** The shopping completion modal closes
**Then** I immediately see a "Scan Receipt?" prompt modal
**And** The prompt is focused and clear with:
  - Icon: 📸 Receipt/camera icon
  - Title: "Scan Your Receipt"
  - Message: "Update your inventory automatically by scanning your receipt"
  - Primary CTA: "Scan Receipt" button (prominent, bottom of modal)
  - Secondary action: "I'll do it later" link (subtle)

### AC2: Scan Receipt Action

**Given** The receipt scan prompt is displayed
**When** I tap "Scan Receipt"
**Then** I am navigated to the `/scan` route
**And** The receipt scanner camera activates
**And** The normal receipt scanning flow begins (already implemented in Epic 5)
**And** The prompt modal closes

### AC3: Deferred Scanning

**Given** The receipt scan prompt is displayed
**When** I tap "I'll do it later"
**Then** The modal closes
**And** I return to the Shopping List screen
**And** The "Start Shopping" button is available for next shopping trip
**And** No receipt scan reminder is stored (see Epic Note)

### AC4: Seamless Navigation to Scanner

**Given** I tapped "Scan Receipt"
**When** The navigation occurs
**Then** The transition is smooth and immediate
**And** No intermediate screens or loading states
**And** The scanner is ready to capture (camera permission handled by existing flow)

### AC5: Modal Timing and Focus

**Given** Shopping completion is confirmed
**When** The receipt scan prompt appears
**Then** It appears immediately after completion modal closes (<500ms delay)
**And** It captures focus (user's attention is drawn to it)
**And** It can be dismissed with tap outside or "I'll do it later"

## Tasks / Subtasks

### Task 1: Create ReceiptScanPromptDialog Component (AC: #1, #5)
- [ ] Subtask 1.1: Create src/features/shopping/components/ReceiptScanPromptDialog.tsx
  - Use MUI Dialog component
  - Icon: 📸 (Receipt or CameraIcon from MUI)
  - Title: "Scan Your Receipt"
  - Message: "Update your inventory automatically by scanning your receipt"
  - Primary CTA: "Scan Receipt" button (prominent, bottom)
  - Secondary action: "I'll do it later" link (subtle, top-right or bottom-left)
- [ ] Subtask 1.2: Style dialog for clear focus
  - Larger than standard dialogs for emphasis
  - Clear visual hierarchy (primary action prominent)
  - Mobile-friendly (full width on small screens)
- [ ] Subtask 1.3: Add timing for smooth transition
  - Appear immediately after completion modal closes
  - Slight delay (100-200ms) to avoid jarring transitions
  - Use MUI Fade or Zoom transition

### Task 2: Add Dialog Props and Navigation (AC: #2, #4)
- [ ] Subtask 2.1: Define component interface
  - `open: boolean` - Whether dialog is visible
  - `onScan: () => void` - Callback when user wants to scan
  - `onLater: () => void` - Callback when user defers
- [ ] Subtask 2.2: Implement onScan callback
  - Use React Router's `useNavigate()` hook
  - Navigate to `/scan` route
  - Close dialog via onScan callback
- [ ] Subtask 2.3: Implement onLater callback
  - Close dialog only
  - Return to Shopping List (no navigation)

### Task 3: Integrate with ShoppingList Component (AC: #1, #2, #3)
- [ ] Subtask 3.1: Add receipt prompt state to ShoppingList component
  - `receiptPromptOpen: boolean` state
  - `openReceiptPrompt()` and `closeReceiptPrompt()` handlers
- [ ] Subtask 3.2: Import and render ReceiptScanPromptDialog
  - Pass required props (open, onScan, onLater)
  - Position in component tree (same level as ShoppingCompletionDialog)
- [ ] Subtask 3.3: Wire completion confirmation to open receipt prompt
  - In Story 9.2's onConfirm callback:
    - Call endShoppingMode()
    - Open receipt scan prompt (NOT immediate navigation)
- [ ] Subtask 3.4: Implement onScan handler
  - Use useNavigate() hook from React Router
  - Navigate to `/scan` when "Scan Receipt" tapped
  - Close prompt dialog
- [ ] Subtask 3.5: Implement onLater handler
  - Close prompt dialog only
  - No navigation, remain on Shopping List

### Task 4: Add React Router Navigation Hook (AC: #2, #4)
- [ ] Subtask 4.1: Import useNavigate from react-router-dom
- [ ] Subtask 4.2: Call useNavigate() in ShoppingList component
- [ ] Subtask 4.3: Store navigate reference for onScan handler
- [ ] Subtask 4.4: Test navigation works correctly
  - Navigate to `/scan`
  - Verify scanner activates
  - Verify user can return via back button

### Task 5: Write Comprehensive Tests
- [ ] Subtask 5.1: Create src/features/shopping/components/ReceiptScanPromptDialog.test.tsx
  - [ ] Test dialog renders with correct props
  - [ ] Test dialog shows correct title and message
  - [ ] Test "Scan Receipt" button calls onScan
  - [ ] Test "I'll do it later" link calls onLater
  - [ ] Test dialog can be dismissed with tap outside
- [ ] Subtask 5.2: Update src/features/shopping/components/ShoppingList.test.tsx
  - [ ] Test receipt prompt opens after shopping completion
  - [ ] Test onScan navigates to `/scan` route
  - [ ] Test onLater closes prompt and stays on Shopping List
  - [ ] Test complete flow: completion → prompt → scan navigation

### Task 6: Verify Integration and Regression Testing
- [ ] Subtask 6.1: Verify Story 5.1-5.4 receipt scanning still works
- [ ] Subtask 6.2: Verify Story 9.1-9.2 shopping lifecycle still works
- [ ] Subtask 6.3: Verify prompt doesn't break navigation
- [ ] Subtask 6.4: Test complete flow:
  - Start shopping → Check items → Complete shopping
  - See completion dialog → Confirm
  - See receipt prompt → Tap "Scan Receipt"
  - Navigate to scanner → Scan receipt
  - Complete inventory update
- [ ] Subtask 6.5: Test deferred flow:
  - Complete shopping → Confirm → See receipt prompt
  - Tap "I'll do it later" → Return to Shopping List
- [ ] Subtask 6.6: Verify mobile layout works correctly
- [ ] Subtask 6.7: Run ESLint and verify 0 errors, 0 warnings
- [ ] Subtask 6.8: Run TypeScript compiler and verify clean compilation
- [ ] Subtask 6.9: Verify app builds successfully with `npm run build`

## Dev Notes

### Critical Implementation Requirements

**Receipt Scan Prompt Pattern:**

Story 9.3 creates a bridge between shopping completion and receipt scanning. The key is timing - the prompt appears at the perfect moment when receipt is in hand.

**Implementation Overview:**

1. **ReceiptScanPromptDialog Component:** New prompt dialog
   - Clear, focused messaging about scanning receipt
   - Primary CTA: "Scan Receipt" (prominent)
   - Secondary: "I'll do it later" (subtle, optional)
   - Mobile-friendly layout

2. **Integration with Shopping Completion:** Trigger after Story 9.2
   - When user confirms shopping completion, open receipt prompt
   - Chain of dialogs: Completion → Receipt Scan
   - Smooth transition between dialogs

3. **Navigation to Scanner:** Use React Router
   - "Scan Receipt" navigates to `/scan` route
   - Existing scanner flow handles the rest
   - No changes to scanner needed

4. **Deferred Scanning:** Graceful skip option
   - "I'll do it later" closes prompt
   - User remains on Shopping List
   - No reminder tracking (out of scope, see Epic Note)

**Architecture Compliance:**

**From Architecture Document:**

**Routing & Navigation:**
- Use React Router v6 for all navigation
- `/scan` route already exists (Epic 5)
- ReceiptScanner component handles camera/OCR

**UI/UX Requirements (NFR8):**
- Sufficient contrast for in-store (bright) environments
- 48px minimum touch targets for dialog buttons
- Clear visual hierarchy (primary action prominent)

**Epic Note - Reminder Tracking:**

**Story 9.3 does NOT include reminder/tracking for deferred scans.** This was considered and removed from Epic 9 (Story 9.5). If a user taps "I'll do it later", there's no persistent reminder. Future enhancement could add:
- Pending scan badge on Shopping List icon
- "Scan Pending Receipt" button
- Reminder notification

This is intentionally out of scope to keep Epic 9 focused.

**User Experience Considerations:**

**Why Prompt Immediately?**
- Receipt is in hand right after shopping
- User is in "receipt scanning" mindset
- Delays reduce likelihood of scanning
- Completes the automation loop

**Why "I'll do it later"?**
- Some users prefer to scan at home
- Store might be busy/crowded
- Avoids forcing the action
- Respects user autonomy

**Why No Reminder Tracking?**
- Out of scope for Epic 9
- Keeps story simple and focused
- Can be added as future enhancement
- ReceiptScanPromptDialog remains in ShoppingList for manual access

### Project Structure Notes

**Files to Modify:**

1. **src/features/shopping/components/ShoppingList.tsx**
  - Import useNavigate from react-router-dom
  - Add receipt prompt state (receiptPromptOpen, handlers)
  - Import and render ReceiptScanPromptDialog
  - Chain receipt prompt after shopping completion (Story 9.2)
  - Implement onScan navigation to `/scan`
  - Implement onLater close only

2. **src/features/shopping/components/ShoppingList.test.tsx**
  - Add tests for receipt prompt integration
  - Add tests for navigation to `/scan`
  - Add tests for onLater behavior
  - Test complete flow from shopping to scanner

**New Files to Create:**

1. **src/features/shopping/components/ReceiptScanPromptDialog.tsx**
   - Prompt dialog component for receipt scanning
   - Props: open, onScan, onLater
   - Clear messaging and primary/secondary actions

2. **src/features/shopping/components/ReceiptScanPromptDialog.test.tsx**
   - Component tests for ReceiptScanPromptDialog
   - Test rendering, callbacks, dismissal

**Files Used (No Changes):**

1. **src/features/receipt/components/ReceiptScanner.tsx**
   - Existing scanner from Epic 5
   - No changes needed
   - Accessed via navigation to `/scan`

2. **src/App.tsx**
   - `/scan` route already configured
   - No changes needed

**Testing Strategy:**

- Component tests for ReceiptScanPromptDialog
- Integration tests for prompt in ShoppingList
- Navigation tests for `/scan` route
- End-to-end flow tests (shopping → completion → scan)
- Regression tests for existing scanner functionality

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9]
- [Source: _bmad-output/implementation-artifacts/9-1-enhanced-shopping-mode-entry-and-visual-states.md]
- [Source: _bmad-output/implementation-artifacts/9-2-user-initiated-shopping-completion.md]
- [Source: _bmad-output/implementation-artifacts/5-1-capture-receipt-photo-with-camera.md]

**Key Architecture Sections:**
- Routing: React Router v6 navigation pattern
- Dialog patterns: Use MUI Dialog for prompts
- Scanner flow: Epic 5 receipt scanning implementation

**MUI Components to Use:**
- Dialog (receipt scan prompt)
- DialogTitle, DialogContent, DialogActions (dialog structure)
- Button (primary "Scan Receipt" action)
- Link or Typography ("I'll do it later" secondary action)
- CameraIcon or ReceiptIcon (visual cue)

## Change Log

**2026-03-02:** Story 9.3 created
- Defined post-shopping receipt scan prompt
- 5 acceptance criteria specified
- Ready for implementation
