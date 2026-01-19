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

*Last Updated: 2026-01-19*
*Identified During: Story 1.3 Code Review (Issues #1-5)*
*Referenced During: Story 1.9 Code Review (TODO comment tracking)*
