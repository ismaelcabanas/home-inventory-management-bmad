# Story 11.2: Fix Shopping Session State Persistence

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want each new shopping session to start fresh without previous receipt data,
so that I can complete a new shopping trip without seeing old receipt information.

## Bug Description

After navigating to the inventory page and starting a new shopping session, when the shopping is completed and the app asks to scan the receipt, the app shows the "Inventory Updated" page with the previously scanned receipt data instead of starting a new session.

**Root Cause Analysis:** The ReceiptContext state persists across shopping sessions. When the user navigates to `/scan` after completing a shopping session, the receipt state still has `ocrState: 'completed'`, `confirmedProducts`, and `productsUpdated` from the previous session, causing the success screen to display again instead of showing the initial scan screen.

## Acceptance Criteria

1. **Given** I have completed a shopping session and scanned a receipt
   **When** I navigate to the inventory page manually
   **And** I start a new shopping session
   **Then** The shopping session state is completely reset
   **And** No previous receipt or shopping data is carried over

2. **Given** I start a new shopping session
   **When** I complete the shopping and the app prompts to scan a receipt
   **Then** I am presented with a fresh receipt scanning flow
   **And** No previous receipt data is displayed
   **And** The "Inventory Updated" page is not shown with old data

3. **Given** I am in a new shopping session
   **When** I view the shopping state
   **Then** All session-specific data (shopping list, collected items, receipt) is empty or reset
   **And** The session ID or identifier is different from the previous session

## Tasks / Subtasks

- [ ] Task 1: Reset receipt state when starting new shopping session (AC: 1, 2, 3)
  - [ ] Subtask 1.1: Add `resetReceipt` function to ReceiptContext that dispatches RESET action
  - [ ] Subtask 1.2: Export `resetReceipt` from ReceiptContextValue interface
  - [ ] Subtask 1.3: Call `resetReceipt` in `startShoppingMode` in ShoppingContext

- [ ] Task 2: Verify navigation triggers proper state cleanup (AC: 1, 3)
  - [ ] Subtask 2.1: Ensure navigation from /scan to / resets the scanner view
  - [ ] Subtask 2.2: Verify navigating to /shopping after scanning starts fresh session

- [ ] Task 3: Add tests for state reset behavior (AC: 1, 2, 3)
  - [ ] Subtask 3.1: Add test for receipt state reset on shopping mode start
  - [ ] Subtask 3.2: Add test for fresh scanner state after navigation
  - [ ] Subtask 3.3: Run all tests to verify no regressions

## Dev Notes

### Root Cause Details

**Problem:** The `ReceiptContext` state persists across shopping sessions. State variables that persist:
- `ocrState`: Stays as 'completed' from previous session
- `confirmedProducts`: Previous receipt products remain in state
- `productsUpdated`: Count from previous update remains (e.g., 5)
- `productsInReview`: May contain old review data

**Expected Behavior:** When starting a new shopping session via `startShoppingMode()`, all receipt-related state should be reset to initial values.

### Architecture Patterns

- **Context Pattern:** State management via React Context (ShoppingContext, ReceiptContext)
- **Reducer Pattern:** Both contexts use `useReducer` for state management
- **Reset Action:** ReceiptContext already has a `RESET` action case that returns `initialState`
- **Cross-Context Communication:** ShoppingContext needs to trigger ReceiptContext reset

### Code Structure

```
src/
├── features/
│   ├── shopping/
│   │   └── context/
│   │       └── ShoppingContext.tsx    # Add receipt reset here
│   └── receipt/
│       └── context/
│           └── ReceiptContext.tsx     # Export reset function
```

### Current State Analysis

**ReceiptContext Initial State:**
```typescript
const initialState: ReceiptState = {
  cameraState: 'idle',
  ocrState: 'idle',
  videoStream: null,
  capturedImage: null,
  processingProgress: 0,
  recognizedProducts: [],
  rawOcrText: null,
  error: null,
  feedbackMessage: '',
  isOnline: true,
  pendingReceiptsCount: 0,
  isOCRConfigured: false,
  productsInReview: [],
  confirmedProducts: [],
  updatingInventory: false,
  updateError: null,
  productsUpdated: -1,  // -1 means not yet updated
};
```

**ReceiptContext RESET Action (already exists):**
```typescript
case 'RESET':
  // Cleanup stream if present
  if (state.videoStream) {
    state.videoStream.getTracks().forEach((track) => track.stop());
  }
  return initialState;
```

### Implementation Guidance

**1. Add reset function to ReceiptContext:**
```typescript
// In ReceiptProvider, add:
const resetReceiptState = useCallback(() => {
  logger.debug('Resetting receipt state');
  dispatch({ type: 'RESET' });
}, []);

// Add to context value:
const value: ReceiptContextValue = useMemo(
  () => ({
    // ... existing values
    resetReceiptState,  // NEW
  }),
  [/* ... existing deps */, resetReceiptState]
);
```

**2. Update ReceiptContextValue interface:**
```typescript
export interface ReceiptContextValue {
  // ... existing properties
  resetReceiptState: () => void;  // NEW
}
```

**3. Call reset in ShoppingContext.startShoppingMode:**
```typescript
const startShoppingMode = useCallback(async () => {
  try {
    logger.debug('Starting shopping mode');

    // NEW: Reset receipt state to clear previous session data
    // We need access to receipt context here
    // Option 1: Use a reset function passed from App.tsx
    // Option 2: Use event bus to trigger reset
    // Option 3: Move reset logic to a shared service

    await shoppingService.setShoppingMode(true);
    dispatch({ type: 'SET_SHOPPING_MODE', payload: true });

    logger.info('Shopping mode started');
  } catch (error) {
    // ... error handling
  }
}, []);
```

**4. Alternative Approach - Event Bus:**
Since contexts are siblings in the component tree, use the event bus:
```typescript
// In ShoppingContext.startShoppingMode:
eventBus.emit(EVENTS.RESET_RECEIPT_STATE);

// In ReceiptContext, add listener:
useEffect(() => {
  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };
  eventBus.on(EVENTS.RESET_RECEIPT_STATE, handleReset);
  return () => {
    eventBus.off(EVENTS.RESET_RECEIPT_STATE, handleReset);
  };
}, []);
```

**5. Add Event to eventBus:**
```typescript
// src/utils/eventBus.ts
export const EVENTS = {
  INVENTORY_PRODUCT_UPDATED: 'inventory:product-updated',
  RESET_RECEIPT_STATE: 'receipt:reset-state',  // NEW
};
```

### Testing Standards

- Tests use Vitest as the test runner
- Test files are co-located with source files
- Test patterns: `{ComponentName}.test.tsx`
- Run tests with: `npm test` or `npm run test`

### Project Structure Notes

- **Feature-Based Architecture:** Code organized by feature
- **Path Aliases:** Uses `@/` alias for imports from `src` directory
- **Event Bus Pattern:** Already used for inventory updates (Story 8.1)
- **Context Providers:** Nested in App.tsx: InventoryProvider → ShoppingProvider → ReceiptProvider

### Verification Steps

1. Start the app: `npm run dev`
2. Add products to shopping list
3. Start shopping mode
4. Complete shopping (end mode)
5. Navigate to /scan when prompted
6. **BUG:** Should see "Inventory Updated" screen with old data
7. **FIXED:** Should see fresh "Scan Receipt" screen

### References

- [Source: src/features/shopping/context/ShoppingContext.tsx#L256-L274] - startShoppingMode function
- [Source: src/features/receipt/context/ReceiptContext.tsx#L189-L194] - RESET action case
- [Source: src/features/receipt/context/ReceiptContext.tsx#L24-L42] - initialState definition
- [Source: src/utils/eventBus.ts] - Event bus for cross-context communication
- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.2] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude (glm-4.7)

### Debug Log References

### Completion Notes List

### File List

---
