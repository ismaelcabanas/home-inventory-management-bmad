# Testing Guidelines

## Overview

This document defines testing conventions and best practices for the home-inventory-management-bmad project.

## Test Types

### Unit Tests
- **Purpose:** Test individual functions, components, or services in isolation
- **Framework:** Vitest
- **Location:** Co-located with source files (`*.test.ts`, `*.test.tsx`)
- **Examples:**
  - `src/components/Button/Button.test.tsx`
  - `src/services/inventory.test.ts`

### Integration Tests
- **Purpose:** Test services + database layer together
- **Framework:** Vitest
- **Location:** `src/__tests__/integration/`
- **File naming:** `*.integration.test.ts`
- **Examples:**
  - `src/__tests__/integration/auto-removal.integration.test.ts`
  - `src/__tests__/integration/persistence.integration.test.ts`

### E2E Tests
- **Purpose:** Test complete user workflows in a real browser
- **Framework:** Playwright
- **Location:** `tests/e2e/`
- **File naming:** `*.spec.ts`
- **Examples:**
  - `tests/e2e/inventory.spec.ts`
  - `tests/e2e/shopping.spec.ts`

## Folder Structure

```
src/
├── __tests__/
│   └── integration/           # Integration tests (Vitest)
│       ├── auto-removal.integration.test.ts
│       └── persistence.integration.test.ts
├── components/
│   └── *.test.tsx            # Component unit tests (co-located)
├── services/
│   └── *.test.ts             # Service unit tests (co-located)
└── ...

tests/
└── e2e/                      # E2E tests (Playwright)
    ├── app.spec.ts
    └── inventory.spec.ts
```

## When to Use Each Test Type

| Use Unit Tests when... | Use Integration Tests when... | Use E2E Tests when... |
|------------------------|------------------------------|-----------------------|
| Testing a single function | Testing business logic flows | Testing critical user journeys |
| Testing component rendering | Testing service + DB interaction | Testing cross-page navigation |
| Fast feedback needed | Testing data persistence | Testing visual regression |
| Mocking dependencies | Testing state management | Testing real browser behavior |

## Conventions

### File Naming
- **Vitest tests:** `*.test.ts`, `*.test.tsx`, `*.integration.test.ts`
- **Playwright tests:** `*.spec.ts`

### Test Structure (AAA Pattern)
```typescript
// Arrange
const product = await inventoryService.addProduct('Milk');

// Act
await inventoryService.updateProduct(product.id, { stockLevel: 'low' });

// Assert
const updated = await db.products.get(product.id);
expect(updated?.isOnShoppingList).toBe(true);
```

### Coverage Targets
- **Unit tests:** Aim for 80%+ coverage per story
- **Integration tests:** At least 1 test per major user flow
- **E2E tests:** Critical user journeys only (happy path + key edge cases)

## Current Coverage

### Integration Tests (19 tests)
Located in `src/integration/` (to be moved to `src/__tests__/integration/` per Story 12.2):

| Story | Feature | Test Count | Test Files |
|-------|---------|------------|------------|
| **3.2** | Auto-removal from shopping list | 7 | `auto-removal.integration.test.ts`, `auto-removal.persistence.test.ts` |
| **4.1** | Check off items while shopping | 12 | `check-off-items.persistence.test.ts` |

**What's tested:**
- Business logic: `stockLevel` → `isOnShoppingList` relationship
- IndexedDB persistence via Dexie.js
- `isChecked` state management
- Offline functionality

**What's NOT tested:**
- UI interactions (clicking buttons, seeing updates)
- Visual feedback
- User flows

### E2E Tests (~12 tests)
Located in `tests/e2e/`:

| File | Test Count | Focus |
|------|------------|-------|
| `app.spec.ts` | 2 | Homepage loading, PWA manifest |
| `inventory.spec.ts` | 9 | Inventory management (add/edit/delete/search), navigation, persistence |
| `receipt-scanning.spec.ts` | 2 | Navigation, auto-add to shopping list |

**What's tested:**
- Full user workflows from start to finish
- UI interactions: clicks, form filling, navigation
- Visual elements: buttons, dialogs, headings
- Cross-page flows: inventory → shopping → back
- Browser behavior: page reload, URL changes

**What's NOT tested:**
- Direct service logic (only tested indirectly through UI)
- Database state assertions (only verified via UI)
- Edge cases in business logic
- Offline functionality

## Coverage Gaps

**IMPORTANT NOTE:** Adding new integration/E2E test coverage for Stories 5-11 is **DEFERRED** pending careful review of current testing strategy. The current state should be analyzed to determine the most valuable test coverage before adding new tests.

The following stories have potential integration/E2E test coverage gaps:

| Story | Feature | Integration Tests | E2E Tests | Unit Tests |
|-------|---------|-------------------|-----------|------------|
| **3.2** | Auto-removal from shopping list | ✅ Complete (7) | Partial | ✅ |
| **4.1** | Check off items while shopping | ✅ Complete (12) | ❌ | ✅ |
| **5.x** | Receipt scanning | ❌ | Partial (2) | ✅ |
| **6.x** | Stock level management | ❌ | ❌ | ✅ |
| **7.x** | Shopping list management | ❌ | Partial (basic) | ✅ |
| **8.x** | History tracking | ❌ | ❌ | ✅ |
| **9.x** | Analytics | ❌ | ❌ | ✅ |
| **10.x** | Settings | ❌ | ❌ | ✅ |
| **11.x** | Shopping list improvements | ❌ | ❌ | ✅ |

### Overap (Both Test Types Cover)
- Stock level → shopping list relationship (Story 3.2)
- Data persistence across page reloads

### Missing from Both
- Stories 5.x, 6.x, 8.x, 9.x, 10.x, 11.x have NO integration or E2E tests

## Testing Pyramid Reality

```
           /\
          /  \  ← E2E: 12 tests (basic user flows)
         /----\
        /      \ ← Integration: 19 tests (Stories 3.2, 4.1 only)
       /--------\
      /          \ ← Unit: 650+ tests (all stories)
     /____________\
```

**Issue:** Most stories rely ONLY on unit tests. No integration/E2E coverage for critical user flows in stories 5-11.

## Action Item: Review Testing Strategy

Before adding new integration/E2E tests for Stories 5-11, the project should:

1. **Review current testing strategy** to determine:
   - Which stories most need integration/E2E coverage
   - What test coverage would provide the most value
   - Whether existing E2E tests adequately cover user workflows

2. **Consider trade-offs:**
   - Integration tests are fast but brittle (API changes break them)
   - E2E tests are comprehensive but slow and brittle (UI changes break them)
   - Unit tests are fast and stable but don't catch integration issues

3. **Establish coverage priorities:**
   - Focus on high-value user workflows first
   - Add regression tests for production bugs
   - Cover critical paths (receipt scanning, stock updates)

## Key Differences: Integration vs E2E Tests

| Aspect | Integration Tests | E2E Tests |
|--------|------------------|-----------|
| **Framework** | Vitest | Playwright |
| **Scope** | Services + Database | Full UI + User Interactions |
| **Speed** | Fast | Slower |
| **Brittleness** | Low (API stable) | High (UI changes break tests) |
| **What They Test** | Business logic correctness | User experience flows |
| **Assertions** | Database state, return values | Visible elements, URLs, user actions |
| **Location** | `src/__tests__/integration/` | `tests/e2e/` |

## Running Tests

```bash
# Unit + Integration tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Best Practices

1. **Write tests before fixing bugs** (regression tests)
2. **Test user behavior, not implementation details**
3. **Keep tests fast** - use mocks for external dependencies
4. **Make tests readable** - use descriptive test names
5. **One assertion per test** when possible
6. **Use test helpers** to reduce duplication
7. **Run tests locally** before pushing (CI will catch issues you missed)
