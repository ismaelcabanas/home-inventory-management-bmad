# Technical Debt

This document tracks known technical debt items identified during code reviews and development. These are non-critical issues that should be addressed in future iterations.

---

## Story 1.3 Code Review - Inventory Context

### Issue #1: Inconsistent Loading State Management in Reducer
**Priority:** Medium
**Category:** Code Quality / Refactoring
**Location:** `src/features/inventory/context/InventoryContext.tsx:50-108`

**Description:**
Reducer currently doesn't set loading state (handled by finally blocks in context methods), but reducer actions still have patterns suggesting loading management.

**Current Behavior:**
- Loading state is managed by `SET_LOADING` action and finally blocks
- Reducer actions (`LOAD_PRODUCTS`, `ADD_PRODUCT`, etc.) don't set loading
- Code patterns suggest loading was previously managed in reducer

**Proposed Enhancement:**
Remove any loading-related patterns from reducer actions entirely since loading is now exclusively managed by:
1. `SET_LOADING` action
2. Finally blocks in async methods

**Benefits:**
- Cleaner separation of concerns
- Reducer becomes simpler and more predictable
- Less confusion for future developers

**Estimated Effort:** 1-2 hours

---

### Issue #2: Missing Defensive Programming in Context
**Priority:** Medium
**Category:** Validation / Error Handling
**Location:** `src/features/inventory/context/InventoryContext.tsx:166`

**Description:**
Context should validate `updates` parameter before calling service layer. Currently relies on service-layer validation only, resulting in generic error messages.

**Current Behavior:**
- Context passes updates directly to service without validation
- User gets generic service error instead of friendly context error
- Empty updates object allowed (unnecessary service call)

**Proposed Enhancement:**
Add defensive validation in context before service call:

```tsx
const updateProduct = async (id: string, updates: Partial<Product>) => {
  // Validate updates is not empty
  if (!updates || Object.keys(updates).length === 0) {
    const appError = { message: 'No fields to update', code: 'INVALID_INPUT' };
    dispatch({ type: 'SET_ERROR', payload: appError.message });
    throw new Error(appError.message);
  }
  // ... existing code
};
```

**Benefits:**
- Better user experience with clear error messages
- Prevents unnecessary service calls
- Catches errors earlier in the call stack

**Estimated Effort:** 1-2 hours

---

### Issue #3: Test Coverage Gap - Concurrent Operations
**Priority:** Medium
**Category:** Testing / Concurrency
**Location:** `src/features/inventory/context/InventoryContext.tsx` (all async methods)

**Description:**
Current implementation uses "last call wins" pattern. No tests verify behavior when multiple operations run concurrently.

**Examples of Missing Test Coverage:**
- User clicks "Load" button twice quickly
- User adds product while loading
- User updates product while searching

**Current Behavior:**
- Acceptable but undocumented
- "Last call wins" - concurrent calls may show stale data
- No race condition handling

**Industry Solutions:**
1. **React Query/SWR** (Recommended for future): Automatic request deduplication, caching
2. **AbortController Pattern**: Cancel previous requests
3. **Request Deduplication**: Return same promise for concurrent calls
4. **Version/Sequence Numbers**: Ignore stale responses

**Proposed Solutions (Pick One):**

**Option A: Document Current Behavior (Quick)**
Add tests that verify and document "last call wins" behavior:
```tsx
it('should handle concurrent loadProducts calls (last wins)', async () => {
  // Test showing documented behavior
});
```

**Option B: Add Request Deduplication**
```tsx
let pendingRequest: Promise<Product[]> | null = null;

const loadProducts = async () => {
  if (pendingRequest) return pendingRequest;

  pendingRequest = inventoryService.getProducts();
  try {
    const products = await pendingRequest;
    dispatch({ type: 'LOAD_PRODUCTS', payload: products });
  } finally {
    pendingRequest = null;
  }
};
```

**Option C: Migrate to React Query (Future Story)**
Replace custom context with React Query for production-grade solution.

**Recommended Path:**
1. **Now:** Add tests documenting current behavior
2. **Future:** Evaluate React Query for production app

**Benefits:**
- Clear documentation of expected behavior
- Prevents future bugs from misunderstanding
- Foundation for future improvements

**Estimated Effort:**
- Option A (tests only): 2-3 hours
- Option B (deduplication): 4-6 hours
- Option C (React Query): 8-12 hours (separate story)

---

### Issue #4: ESLint Disable Comment Lacks Explanation
**Priority:** Low
**Category:** Documentation
**Location:** `src/features/inventory/context/InventoryContext.tsx:3`

**Description:**
Line 3 has `/* eslint-disable react-refresh/only-export-components */` without explanation of why this rule is disabled.

**Current State:**
```tsx
/* eslint-disable react-refresh/only-export-components */
```

**Proposed Enhancement:**
```tsx
/* eslint-disable react-refresh/only-export-components */
// Context files require exporting multiple items (Provider, hook, types)
// This is a standard React Context pattern and doesn't affect hot module reloading
```

**Benefits:**
- Future developers understand why rule is disabled
- Prevents confusion or accidental removal
- Better code maintainability

**Estimated Effort:** 5 minutes

---

### Issue #5: Missing TypeScript readonly Modifiers
**Priority:** Low
**Category:** Type Safety
**Location:** `src/features/inventory/context/InventoryContext.tsx:13-17`

**Description:**
State fields could be marked readonly for extra compile-time safety to prevent accidental mutations.

**Current State:**
```tsx
export interface InventoryState {
  products: Product[];
  loading: boolean;
  error: string | null;
}
```

**Proposed Enhancement:**
```tsx
export interface InventoryState {
  readonly products: readonly Product[];
  readonly loading: boolean;
  readonly error: string | null;
}
```

**Benefits:**
- TypeScript prevents direct state mutations
- Compiler catches mutation bugs at build time
- Better type safety without runtime cost

**Trade-offs:**
- Slightly more complex type signatures
- May require updates to code expecting mutable types
- Deep readonly can be verbose for nested structures

**Estimated Effort:** 1-2 hours (including testing impacts)

---

## Summary

| Issue | Priority | Estimated Effort | Impact |
|-------|----------|------------------|--------|
| #1: Loading state refactoring | Medium | 1-2 hours | Maintainability |
| #2: Defensive validation | Medium | 1-2 hours | User Experience |
| #3: Concurrent operations | Medium | 2-6 hours | Correctness |
| #4: ESLint comment | Low | 5 minutes | Documentation |
| #5: readonly modifiers | Low | 1-2 hours | Type Safety |

**Total Estimated Effort:** 5-13 hours depending on approach

## Prioritization Guidance

**Address Now (Before Production):**
- Issue #3 (Concurrent operations) - At least add tests documenting behavior

**Address Before Scale:**
- Issue #2 (Defensive validation) - Better UX as app grows
- Issue #1 (Loading refactoring) - Easier maintenance

**Address When Convenient:**
- Issue #4 (ESLint comment) - Quick win
- Issue #5 (readonly modifiers) - Nice to have

---

## Story 1.9 Code Review - Additional Notes

The tech debt items listed above (Issues #1-5) from Story 1.3 all have corresponding TODO comments in `src/features/inventory/context/InventoryContext.tsx`:
- **TD-1** (line 51): Cleanup loading state management
- **TD-2** (line 163): Add validation for updates parameter
- **TD-3** (line 121): Add concurrency handling
- **TD-4** (line 1): Add explanation for ESLint disable
- **TD-5** (line 11): Consider readonly modifiers

These are tracked and should be addressed as per the prioritization guidance above.

---

## Story 1.10 Code Review - Deployment & PWA

### Issue #6: Desktop PWA Verification Checklist
**Priority:** Medium
**Category:** Testing / Quality Assurance
**Location:** Story 1.10, Tasks 4.1-4.6

**Description:**
Complete desktop PWA verification checklist was not fully validated during code review due to time constraints and desktop-only testing environment. AC3 (PWA Features Work in Production) only partially verified.

**Current State:**
- ✅ Basic verification completed: Service worker registration, manifest accessible, HTTPS working
- ⚠️ Incomplete verification: Full desktop PWA checklist including offline scenarios, cache validation, standalone mode testing
- ❌ Mobile testing not performed: iOS "Add to Home Screen", Android "Install app", mobile camera access

**Proposed Comprehensive Verification:**

**Desktop Checks (11 items):**
1. Service worker activated and running (Application > Service Workers)
2. Manifest loads correctly with all metadata (Application > Manifest)
3. Icons configured in manifest (192x192, 512x512)
4. Cache storage populated with expected files (~9 files, ~569KB)
5. Offline mode works (toggle offline in DevTools)
6. All routes work offline (/, /shopping, /scan)
7. Desktop PWA install icon appears in address bar
8. Standalone window opens without browser chrome
9. HTTPS certificate valid (lock icon verified)
10. Camera permission prompt works without HTTPS errors
11. No console errors in production build

**Mobile Checks (Required for Full AC3 Compliance):**
1. iOS Safari "Add to Home Screen" functionality
2. Android Chrome "Install app" prompt
3. App opens in standalone mode (full-screen, no browser UI)
4. Touch gestures work correctly
5. Camera access works on mobile devices
6. Service worker updates properly on mobile

**Benefits:**
- Full AC3 compliance verification
- Production PWA readiness confirmed
- User experience validated across platforms
- Catches mobile-specific issues early

**Estimated Effort:** 1-2 hours (requires mobile device access)

**Recommended Approach:**
1. Complete all desktop checks systematically
2. Test on iOS device (iPhone/iPad)
3. Test on Android device (phone/tablet)
4. Document results in story file
5. Mark AC3 as fully satisfied

---

### Issue #7: Bundle Size Optimization
**Priority:** Medium
**Category:** Performance / Build Optimization
**Location:** Production build output

**Description:**
Main JavaScript bundle exceeds recommended 500KB limit (currently 581KB after minification), triggering Vite build warning. This impacts initial load time, especially on slow networks.

**Current State:**
```
dist/assets/index-CcHdZGMy.js   581.31 kB │ gzip: 183.80 kB
Warning: Some chunks are larger than 500 kB after minification
```

**Impact:**
- Slower initial page load (especially on 3G/slow networks)
- Potential poor performance scores (Lighthouse, PageSpeed)
- Not meeting performance best practices
- May affect NFR1 (<2 second response time) on slower connections

**Root Causes:**
- All dependencies bundled into single main chunk
- No code splitting implemented
- MUI components fully loaded (heavy library)
- React Router not using lazy loading
- No dynamic imports for route components

**Proposed Solutions:**

**Option A: Route-Based Code Splitting (Recommended)**
```tsx
// src/App.tsx
const InventoryPage = lazy(() => import('./features/inventory/pages/InventoryPage'));
const ShoppingPage = lazy(() => import('./features/shopping/pages/ShoppingPage'));
const ScanPage = lazy(() => import('./features/scan/pages/ScanPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<InventoryPage />} />
        <Route path="/shopping" element={<ShoppingPage />} />
        <Route path="/scan" element={<ScanPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Option B: Manual Chunk Configuration**
```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-data': ['dexie'],
        }
      }
    }
  }
});
```

**Option C: Combined Approach (Best Results)**
Implement both route-based code splitting AND manual chunk configuration for optimal bundle sizes.

**Expected Results:**
- Main bundle: <300 KB
- Vendor chunks: 200-250 KB (cached across pages)
- Route chunks: 50-100 KB each (loaded on demand)
- Total initial load: ~400-450 KB (vs current 581 KB)
- Faster Time to Interactive (TTI)

**Benefits:**
- Faster initial page load
- Better performance scores
- Improved user experience on slow networks
- Better caching strategy (vendors cached separately)
- Meets performance best practices

**Trade-offs:**
- Slightly more complex build configuration
- Route transitions may have brief loading state
- More HTTP requests (mitigated by HTTP/2)

**Estimated Effort:** 4-6 hours
- Implement route-based code splitting: 2-3 hours
- Configure manual chunks: 1-2 hours
- Test and validate: 1 hour
- Measure performance improvements: 30 minutes

**Recommended Path:**
1. Start with Option A (route-based splitting) - quick wins
2. Measure results
3. Add Option B (manual chunks) if still >500KB
4. Validate all features work correctly after optimization
5. Run Lighthouse/PageSpeed tests to measure improvement

---

## Summary (Updated)

| Issue | Priority | Estimated Effort | Impact | Story |
|-------|----------|------------------|--------|-------|
| #1: Loading state refactoring | Medium | 1-2 hours | Maintainability | 1.3 |
| #2: Defensive validation | Medium | 1-2 hours | User Experience | 1.3 |
| #3: Concurrent operations | Medium | 2-6 hours | Correctness | 1.3 |
| #4: ESLint comment | Low | 5 minutes | Documentation | 1.3 |
| #5: readonly modifiers | Low | 1-2 hours | Type Safety | 1.3 |
| #6: Desktop PWA verification | Medium | 1-2 hours | Quality Assurance | 1.10 |
| #7: Bundle size optimization | Medium | 4-6 hours | Performance | 1.10 |

**Total Estimated Effort:** 10-21 hours depending on approach

## Prioritization Guidance (Updated)

**Address Now (Before Production):**
- Issue #3 (Concurrent operations) - At least add tests documenting behavior
- Issue #6 (Desktop PWA verification) - Required for full AC3 compliance

**Address Before Scale:**
- Issue #7 (Bundle optimization) - Important for performance and UX
- Issue #2 (Defensive validation) - Better UX as app grows
- Issue #1 (Loading refactoring) - Easier maintenance

**Address When Convenient:**
- Issue #4 (ESLint comment) - Quick win
- Issue #5 (readonly modifiers) - Nice to have

---

## Story 2.2 Implementation - Stock Level UI Space Optimization

### Issue #8: StockLevelPicker Takes Excessive Vertical Space
**Priority:** High
**Category:** UX / Mobile Optimization
**Location:** `src/features/inventory/components/ProductCard.tsx`, `src/components/StockLevelPicker/StockLevelPicker.tsx`

**Description:**
The current ProductCard implementation displays both a visual Chip indicator (Story 2.2) AND the full StockLevelPicker (Story 2.1) always visible. This consumes excessive vertical space on mobile devices, forcing users to scroll significantly to see their inventory list.

**Current State:**
```
[Product Name]                    [Edit] [Delete]
[🟢 High]                         ← Chip (Story 2.2)
[HIGH | MEDIUM | LOW | EMPTY]    ← Picker (Story 2.1) - Always visible, takes full row
---
[Product Name 2]                  [Edit] [Delete]
[🟠 Low]
[HIGH | MEDIUM | LOW | EMPTY]
---
(repeat for every product...)
```

**Problems:**
1. **Excessive scrolling on mobile** - Primary target platform (NFR11, NFR12)
2. **Poor information density** - Each product takes ~150-200px height
3. **Redundant visual feedback** - Both Chip and Picker show current level with color
4. **Always-visible picker** - Not needed when just scanning the list
5. **Violates mobile-first design principle** - Screen real estate is precious on mobile

**Impact on User Experience:**
- Inventory with 20 products requires excessive scrolling
- Difficult to see "big picture" of stock levels
- Harder to identify low-stock items quickly
- Not optimized for the primary use case: quick scanning

**Root Cause:**
Story 2.1 implemented the picker as always-visible, assuming it would be the primary visual feedback. Story 2.2 added the Chip for better visual scanning but didn't optimize the layout.

---

**Proposed Solutions:**

**Option 1: Hide Picker by Default, Show Only Chip (Recommended)**
```
[Product Name]  [🟢 High ▼]  [Edit] [Delete]
```
- Show only the Chip in collapsed state
- Tap chip to open picker in Dialog/Popover
- Still maintains single-tap + single-tap interaction
- Saves ~50px per product (massive improvement!)

**Implementation:**
```tsx
// ProductCard.tsx
const [pickerOpen, setPickerOpen] = useState(false);

<Chip
  label={stockConfig.label}
  onClick={() => setPickerOpen(true)}
  sx={{ cursor: 'pointer', ...colors }}
/>

<Dialog open={pickerOpen} onClose={() => setPickerOpen(false)}>
  <StockLevelPicker {...props} />
</Dialog>
```

**Benefits:**
- Massive space savings (~60-70% less height per product)
- Better information density
- Maintains quick interaction (tap chip → tap level)
- Cleaner, more scannable list
- Mobile-first optimized

**Trade-off:**
- Adds one extra tap (tap chip to open, tap level to change)
- But improves overall UX significantly

---

**Option 2: Inline Chip Only, Picker as Popover**
```
[Product Name]  [🟢 High ▼]  [Edit] [Delete]
                   ↓ (click opens popover below)
```
- Similar to Option 1 but with Popover instead of Dialog
- Picker appears directly below chip (more contextual)
- No full-screen overlay

**Benefits:**
- More contextual feedback
- Faster interaction (no dialog animation)
- Better spatial relationship

**Trade-off:**
- Popover positioning can be tricky on small screens
- May overlap with other UI elements

---

**Option 3: Compact Icon-Based Picker (Future Enhancement)**
```
[Product Name]  [⬆️][➡️][⬇️][❌]  [Edit] [Delete]
```
- Replace text with icons/emojis
- Always visible but more compact
- Single-tap to change

**Benefits:**
- Maintains always-visible quick access
- More compact than current implementation
- Visual icons may be more intuitive

**Trade-off:**
- Icons must be clear and unambiguous
- Accessibility concerns (needs proper ARIA labels)
- Still takes more space than Option 1

---

**Option 4: Remove Chip, Keep Only Picker (Not Recommended)**
Removes Story 2.2's Chip entirely, relies only on StockLevelPicker's colored selection.

**Why Not Recommended:**
- Story 2.2's color-coded chips provide better visual scanning
- Picker is larger and harder to scan quickly
- Doesn't solve the space problem

---

**Recommended Implementation Path:**

**Phase 1: Quick Win (Option 1)**
1. Hide StockLevelPicker by default
2. Show only Chip with click/tap handler
3. Open picker in MUI Dialog on chip click
4. Close dialog after level selection
5. Estimated effort: 2-3 hours

**Phase 2: Polish (Future)**
1. Consider Popover instead of Dialog for better UX
2. Add subtle animation/transition
3. Test extensively on mobile devices
4. Estimated effort: 1-2 hours

---

**Testing Checklist:**
- [ ] Chip is tappable/clickable with clear affordance (cursor pointer, maybe down arrow icon)
- [ ] Dialog/Popover opens on chip click
- [ ] StockLevelPicker functions correctly inside Dialog
- [ ] Dialog closes after level selection
- [ ] Optimistic UI updates work correctly
- [ ] Error handling still works (rollback on failure)
- [ ] Touch targets remain 44x44px minimum (NFR8.1)
- [ ] Mobile viewport shows significant space improvement
- [ ] All existing tests still pass
- [ ] No regressions in functionality

---

**Acceptance Criteria for Fix:**

**Given** I am viewing my inventory list on mobile
**When** I scroll through my products
**Then** I can see at least 2-3x more products per screen than before
**And** Each product shows a color-coded chip indicating stock level
**And** I can tap the chip to change the stock level
**And** The picker opens in a dialog/popover
**And** I can select a new level with a single tap
**And** The dialog closes automatically after selection

---

**Estimated Effort:** 2-4 hours
- Implement chip click handler + Dialog: 1-2 hours
- Update tests: 1 hour
- Mobile testing and polish: 1 hour

**Impact:** High - Significantly improves mobile UX (primary target platform)

**Priority:** High - Should be addressed before next story to establish better pattern

---

## Summary (Updated)

| Issue | Priority | Estimated Effort | Impact | Story |
|-------|----------|------------------|--------|-------|
| #1: Loading state refactoring | Medium | 1-2 hours | Maintainability | 1.3 |
| #2: Defensive validation | Medium | 1-2 hours | User Experience | 1.3 |
| #3: Concurrent operations | Medium | 2-6 hours | Correctness | 1.3 |
| #4: ESLint comment | Low | 5 minutes | Documentation | 1.3 |
| #5: readonly modifiers | Low | 1-2 hours | Type Safety | 1.3 |
| #6: Desktop PWA verification | Medium | 1-2 hours | Quality Assurance | 1.10 |
| #7: Bundle size optimization | Medium | 4-6 hours | Performance | 1.10 |
| **#8: Stock level UI space** | **High** | **2-4 hours** | **Mobile UX** | **2.2** |

**Total Estimated Effort:** 12-25 hours depending on approach

## Prioritization Guidance (Updated)

**Address Now (Before Next Story):**
- **Issue #8 (Stock level UI space)** - Critical for mobile UX, affects primary user flow

**Address Before Production:**
- Issue #3 (Concurrent operations) - At least add tests documenting behavior
- Issue #6 (Desktop PWA verification) - Required for full AC3 compliance

**Address Before Scale:**
- Issue #7 (Bundle optimization) - Important for performance and UX
- Issue #2 (Defensive validation) - Better UX as app grows
- Issue #1 (Loading refactoring) - Easier maintenance

**Address When Convenient:**
- Issue #4 (ESLint comment) - Quick win
- Issue #5 (readonly modifiers) - Nice to have

---

*Last Updated: 2026-01-22*
*Identified During: Story 1.3 Code Review (Issues #1-5), Story 1.10 Code Review (Issues #6-7), Story 2.2 Implementation (Issue #8)*
*Referenced During: Story 1.9 Code Review (TODO comment tracking)*
