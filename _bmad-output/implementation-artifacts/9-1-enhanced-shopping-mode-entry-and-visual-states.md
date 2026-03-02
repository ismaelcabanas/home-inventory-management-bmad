# Story 9.1: Enhanced Shopping Mode Entry & Visual States

Status: backlog

## Story

As a **user**,
I want a clear "Start Shopping" action that transforms the shopping list into a focused shopping mode,
So that I know when I'm in "shopping mode" vs. just viewing my list.

## Context

This is the first story in Epic 9 - Shopping Lifecycle & Post-Shopping Experience. Currently, the Shopping Mode toggle is hidden in the SpeedDial (Story 4.4), making it hard to discover and not prominent enough for a key user action. Users need a clear, intentional entry point to shopping mode.

**User Journey:** Users view their shopping list at home (planning mode), then go to the store, then enter "shopping mode" to start checking off items. The transition between these states should be clear and intentional.

**User-Reported Problem:** The shopping mode toggle is buried in the SpeedDial menu, making it hard to discover. Users should have a prominent "Start Shopping" button that's clearly visible.

**Critical Success Factor:** The transition to shopping mode must be visually obvious. Users should immediately understand they're entering a different mode of interaction.

**Epic 4 Dependencies:** Story 4.4 established the shopping mode toggle functionality. Story 9.1 moves it from SpeedDial to a prominent button and enhances visual feedback.

## Acceptance Criteria

### AC1: Prominent Start Shopping Button

**Given** I have items on my shopping list
**When** I view the shopping list page
**Then** I see a prominent "Start Shopping" button above the list
**And** The button is NOT hidden in SpeedDial
**And** The button shows item count: "Start Shopping (12 items)"
**And** The button is disabled if the list is empty

### AC2: Visual State Change on Shopping Mode Entry

**Given** I tap "Start Shopping"
**When** Shopping mode activates
**Then** The page header changes from "🛒 Shopping List" to "🛒 Shopping Mode"
**And** A visual state change occurs (subtle background color change or accent)
**And** The progress indicator becomes more prominent
**And** Touch targets increase in size (optimized for one-handed use)

### AC3: Exit Button in Shopping Mode

**Given** I am in shopping mode
**When** I view the header
**Then** I see a clear exit button (✕) next to the title
**And** The "Start Shopping" button has changed to "End Shopping"
**And** I can exit via either the ✕ button or "End Shopping"

### AC4: Shopping Mode State Persistence

**Given** I am in shopping mode
**When** I navigate away and return to the Shopping tab
**Then** Shopping mode state persists (I'm still in shopping mode)
**And** All visual indicators remain
**And** Checked/unchecked states are preserved

## Tasks / Subtasks

### Task 1: Move Shopping Mode Toggle from SpeedDial to Prominent Button (AC: #1)
- [ ] Subtask 1.1: Remove shopping mode toggle from SpeedDial in ShoppingList.tsx
- [ ] Subtask 1.2: Add prominent "Start Shopping" button above the shopping list
  - Position: Below header, above progress indicator
  - Style: MUI Button with contained variant, prominent styling
  - Text: "Start Shopping (X items)" - show item count dynamically
- [ ] Subtask 1.3: Disable button when shopping list is empty
  - Show "No items to shop" or similar message instead
- [ ] Subtask 1.4: Update button to "End Shopping" when in shopping mode
  - Change text and styling to indicate different action

### Task 2: Add Header Exit Button (AC: #3)
- [ ] Subtask 2.1: Add ✕ button to header when in shopping mode
  - Position: Right side of header, next to title
  - Use MUI IconButton with CloseIcon
- [ ] Subtask 2.2: Wire exit button to endShoppingMode() method
- [ ] Subtask 2.3: Hide exit button when not in shopping mode
- [ ] Subtask 2.4: Ensure both exit buttons (✕ and "End Shopping") work identically

### Task 3: Implement Enhanced Visual States for Shopping Mode (AC: #2)
- [ ] Subtask 3.1: Update header to show "🛒 Shopping Mode" when active
  - Change from "🛒 Shopping List" when entering mode
  - Revert to "Shopping List" when exiting mode
- [ ] Subtask 3.2: Add background color or accent change for shopping mode
  - Subtle change: Different background color or border accent
  - Make it visually obvious but not distracting
- [ ] Subtask 3.3: Make progress indicator more prominent in shopping mode
  - Increase size, make it sticky, or add visual emphasis
- [ ] Subtask 3.4: Increase touch target sizes in shopping mode
  - Ensure all checkboxes are minimum 48x48px
  - Optimize for one-handed use

### Task 4: Update ShoppingList Component Layout (AC: #1, #2)
- [ ] Subtask 4.1: Read src/features/shopping/components/ShoppingList.tsx to understand current structure
- [ ] Subtask 4.2: Restructure layout to accommodate prominent start button
  - Header → Start Shopping Button → Progress → List (planning mode)
  - Header → Progress → List (shopping mode, button changes to "End Shopping")
- [ ] Subtask 4.3: Ensure smooth transitions between modes
- [ ] Subtask 4.4: Test layout on mobile devices (responsive design)

### Task 5: Write Comprehensive Tests
- [ ] Subtask 5.1: Update src/features/shopping/components/ShoppingList.test.tsx
  - [ ] Test "Start Shopping" button renders prominently above list
  - [ ] Test button shows correct item count
  - [ ] Test button is disabled when list is empty
  - [ ] Test button changes to "End Shopping" in shopping mode
  - [ ] Test header changes from "Shopping List" to "Shopping Mode"
  - [ ] Test ✕ exit button appears in shopping mode
  - [ ] Test ✕ button is hidden when not in shopping mode
  - [ ] Test both exit buttons (✕ and "End Shopping") call endShoppingMode()
- [ ] Subtask 5.2: Test visual state changes
  - [ ] Test background/accent changes when entering shopping mode
  - [ ] Test visual state reverts when exiting shopping mode
- [ ] Subtask 5.3: Test state persistence
  - [ ] Test shopping mode persists across navigation
  - [ ] Test shopping mode persists across app restarts

### Task 6: Verify Integration and Regression Testing
- [ ] Subtask 6.1: Verify Story 4.4 shopping mode functionality still works
- [ ] Subtask 6.2: Verify SpeedDial still has other actions (Add Products)
- [ ] Subtask 6.3: Verify mode transitions are smooth (<1 second response time)
- [ ] Subtask 6.4: Verify mobile layout works correctly
- [ ] Subtask 6.5: Test complete flow:
  - Open shopping list → See "Start Shopping" button
  - Tap button → Enter shopping mode, see visual changes
  - Navigate away and return → Still in shopping mode
  - Tap exit → Exit shopping mode, visual state reverts
- [ ] Subtask 6.6: Run ESLint and verify 0 errors, 0 warnings
- [ ] Subtask 6.7: Run TypeScript compiler and verify clean compilation
- [ ] Subtask 6.8: Verify app builds successfully with `npm run build`

## Dev Notes

### Critical Implementation Requirements

**Shopping Mode Entry Pattern:**

Story 9.1 enhances the shopping mode entry by making it more prominent and visually clear. The key improvement is moving from a hidden SpeedDial action to a prominent button above the list.

**Implementation Overview:**

1. **Remove from SpeedDial:** Remove shopping mode toggle from the SpeedDial menu
   - Keep other SpeedDial actions (Add Products, Scan Receipt - Story 9.4)
   - Simplify SpeedDial to focus on secondary actions

2. **Add Prominent Button:** Add "Start Shopping" button above the list
   - Position: Below header, above progress indicator
   - Style: MUI Button with contained variant
   - Text: "Start Shopping (X items)" - dynamic item count
   - Disabled state when list is empty

3. **Header Exit Button:** Add ✕ button in header for easy exit
   - Only visible in shopping mode
   - Calls same endShoppingMode() as "End Shopping" button
   - Provides clear exit option

4. **Visual State Changes:** Enhance visual feedback for shopping mode
   - Header text change: "Shopping List" → "Shopping Mode"
   - Background/accent color change (subtle but obvious)
   - Progress indicator becomes more prominent
   - Touch targets increase (48x48px minimum)

**Architecture Compliance:**

**From Architecture Document:**

**UI/UX Requirements (NFR8):**
- Sufficient contrast for in-store (bright) and at-home (dim) environments
- Single-tap actions (<2 second response time per NFR1)
- 48px minimum touch targets (NFR8.1)

**State Management Pattern:**
- Shopping mode state uses existing ShoppingContext (isShoppingMode)
- No new state needed - enhance existing visual feedback
- State persistence via existing localStorage implementation

**Integration with Story 4.4:**
- Story 4.4 established shopping mode toggle functionality
- Story 9.1 moves toggle from SpeedDial to prominent button
- Uses existing startShoppingMode() and endShoppingMode() methods
- No logic changes - UI/visual enhancement only

### Project Structure Notes

**Files to Modify:**

1. **src/features/shopping/components/ShoppingList.tsx**
   - Remove shopping mode toggle from SpeedDial
   - Add prominent "Start Shopping" button above list
   - Add ✕ exit button to header
   - Implement visual state changes (header text, background)
   - Update layout to accommodate new button position

2. **src/features/shopping/components/ShoppingList.test.tsx**
   - Add tests for new "Start Shopping" button
   - Add tests for visual state changes
   - Add tests for ✕ exit button
   - Update existing tests for new layout

**New Files to Create:**

None - all changes in existing ShoppingList component

**Testing Strategy:**

- Component tests for new "Start Shopping" button
- Component tests for visual state changes
- Component tests for ✕ exit button
- Integration tests for mode persistence
- Regression tests for existing Story 4.4 functionality

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9]
- [Source: _bmad-output/implementation-artifacts/4-4-shopping-mode-toggle.md] - Previous shopping mode implementation

**Key Architecture Sections:**
- UI/UX Requirements: NFR8 (touch targets, contrast)
- Performance Requirements: NFR1 (<2 second response time)
- State Management: ShoppingContext with isShoppingMode state

**MUI Components to Use:**
- Button (prominent "Start Shopping" button)
- IconButton (✕ exit button in header)
- Box (visual state changes, background/accent)

## Change Log

**2026-03-02:** Story 9.1 created
- Defined enhanced shopping mode entry and visual states
- 4 acceptance criteria specified
- Ready for implementation
