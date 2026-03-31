# Story 11.1: Fix "View Inventory" Button Navigation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the "View Inventory" button to navigate me to the inventory page after completing a purchase,
so that I can see my updated inventory without encountering a blank page.

## Bug Description

After completing the purchase workflow and reaching the confirmation page showing products added to inventory, clicking the "View Inventory" button results in a blank page instead of navigating to the inventory page.

**Root Cause Analysis:** The navigation path in the "View Inventory" button uses `/inventory` but the actual route configured in `App.tsx` is `/` (root path). This mismatch causes React Router to render nothing, resulting in a blank page.

## Acceptance Criteria

1. **Given** I have completed a purchase workflow
   **When** The confirmation page is displayed showing products added to inventory
   **And** I tap the "View Inventory" button
   **Then** I am successfully navigated to the inventory page
   **And** The inventory page displays all products correctly
   **And** No blank page is shown

2. **Given** I am on the inventory page via "View Inventory" button
   **When** The page loads
   **Then** The inventory list is visible and populated
   **And** All products are displayed with their correct stock levels
   **And** The page is fully functional (search, scroll, etc.)

3. **Given** The code change is minimal and focused
   **When** The fix is implemented
   **Then** Only the navigation path is corrected
   **And** No other functionality is affected
   **And** Existing tests still pass

## Tasks / Subtasks

- [x] Task 1: Update navigation path in "View Inventory" button (AC: 1, 3)
  - [x] Subtask 1.1: Change `navigate('/inventory')` to `navigate('/')` in ReceiptScanner.tsx line 218
  - [x] Subtask 1.2: Verify the change matches the route definition in App.tsx
  - [x] Subtask 1.3: Test the navigation flow manually or via tests

- [x] Task 2: Check for other incorrect navigation references (AC: 3)
  - [x] Subtask 2.1: Search the codebase for other references to '/inventory' path
  - [x] Subtask 2.2: Verify any other navigation calls use correct paths
  - **Note:** Found second instance at line 159 (error recovery "Go to Inventory" button) and fixed it as well

- [x] Task 3: Update tests if needed (AC: 2, 3)
  - [x] Subtask 3.1: Check if ReceiptScanner.test.tsx exists and needs updating
  - [x] Subtask 3.2: Run existing tests to ensure no regressions
  - **Result:** All 692 tests passed

## Dev Notes

### Root Cause Details

**File:** `src/features/receipt/components/ReceiptScanner.tsx`
**Line:** 218
**Issue:** `onClick={() => navigate('/inventory')}`

**Correct Route Definition:**
**File:** `src/App.tsx`
**Line:** 24-32
```tsx
<Route
  path="/"
  element={
    <FeatureErrorBoundary featureName="Inventory">
      <InventoryList />
    </FeatureErrorBoundary>
  }
/>
```

### Architecture Patterns

- **React Router v6:** Uses `react-router-dom` with `BrowserRouter`, `Routes`, and `Route` components
- **useNavigate Hook:** Imported from 'react-router-dom' for programmatic navigation
- **Route Structure:**
  - `/` → InventoryList (home page)
  - `/shopping` → ShoppingList
  - `/scan` → ReceiptScanner

### Code Structure

```
src/
├── App.tsx                    # Route definitions
├── features/
│   ├── inventory/
│   │   └── components/
│   │       └── InventoryList.tsx
│   └── receipt/
│       └── components/
│           └── ReceiptScanner.tsx  # BUG: navigate('/inventory')
```

### Testing Standards

- Tests use Vitest as the test runner
- Component tests are co-located with source files (e.g., `ReceiptScanner.test.tsx`)
- Test files follow the pattern: `{ComponentName}.test.tsx`
- Run tests with: `npm test` or `npm run test`

### Project Structure Notes

- **Feature-Based Architecture:** Code is organized by feature (inventory, shopping, receipt) rather than by type
- **Path Aliases:** Uses `@/` alias for imports from `src` directory
- **Component Organization:** Each feature has its own `components/` folder
- **Context Pattern:** State management via React Context (InventoryContext, ShoppingContext, ReceiptContext)

### Implementation Guidance

1. **One-Line Fix:** The fix is straightforward - change line 218 in `ReceiptScanner.tsx`:
   ```tsx
   // Before (BUGGY):
   onClick={() => navigate('/inventory')}

   // After (FIXED):
   onClick={() => navigate('/')}
   ```

2. **Alternative Approach:** If named routes are preferred, consider using a route constants file:
   ```tsx
   // src/routes.ts
   export const ROUTES = {
     INVENTORY: '/',
     SHOPPING: '/shopping',
     SCAN: '/scan',
   } as const;

   // In components:
   import { ROUTES } from '@/routes';
   onClick={() => navigate(ROUTES.INVENTORY)}
   ```
   However, for this bug fix, the minimal change is preferred.

3. **Verification Steps:**
   - Start the app: `npm run dev`
   - Complete a shopping flow (or use existing receipt data)
   - Click "View Inventory" button on success screen
   - Verify inventory page loads correctly

### References

- [Source: src/App.tsx#L24-L32] - Route configuration showing inventory at `/`
- [Source: src/features/receipt/components/ReceiptScanner.tsx#L218] - Buggy navigation path
- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.1] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude (glm-4.7)

### Debug Log References

### Completion Notes List

**Implementation Summary:**
- Fixed navigation bug where "View Inventory" and "Go to Inventory" buttons were navigating to `/inventory` instead of `/` (root path)
- The `/inventory` route doesn't exist in the routing configuration, causing a blank page
- Fixed 2 locations in `ReceiptScanner.tsx`:
  - Line 159: Error recovery "Go to Inventory" button
  - Line 218: Success screen "View Inventory" button
- Added test documentation for Story 11.1 in `ReceiptScanner.test.tsx`
- All 692 tests passed with no regressions

**Technical Approach:**
- Minimal one-line fix per location (changed `navigate('/inventory')` to `navigate('/')`)
- No changes to route configuration needed - routes were already correct
- Tests document the expected navigation paths for future reference

### File List

**Modified:**
- `src/features/receipt/components/ReceiptScanner.tsx` - Fixed navigation paths (lines 159, 218)
- `src/features/receipt/components/ReceiptScanner.test.tsx` - Added Story 11.1 test documentation
- `_bmad-output/implementation-artifacts/11-1-fix-view-inventory-button-navigation.md` - Story file updated with completion status
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - Status updated to in-progress → review

---
