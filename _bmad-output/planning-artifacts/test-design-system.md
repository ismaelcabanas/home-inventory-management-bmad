# Test Design: System-Level Testability Review

**Date:** 2026-01-04
**Author:** Isma
**Status:** Draft

---

## Executive Summary

**Scope:** System-level test design for home-inventory-management-bmad (Phase 3 - Solutioning)

**Risk Summary:**

- Total risks identified: 12
- High-priority risks (≥6): 5
- Critical categories: PERF (Performance), DATA (Data Integrity), TECH (OCR Accuracy)

**Coverage Summary:**

- P0 scenarios: 18 tests (36 hours)
- P1 scenarios: 24 tests (24 hours)
- P2/P3 scenarios: 32 tests (12 hours)
- **Total effort**: 72 hours (~9 days)

**Architecture Assessment:**
- ✅ **Controllability**: Excellent (service layer abstraction, local-first)
- ✅ **Observability**: Good (logger utility, error handling, React DevTools)
- ⚠️ **Reliability**: Needs validation (OCR accuracy, data loss prevention, performance)

---

## Architecturally Significant Requirements (ASRs)

### ASR-1: OCR Accuracy (NFR6)
**Requirement:** 95%+ product recognition accuracy on target supermarket receipts
**Impact:** HIGH - Core innovation depends on this
**Risk:** Project fails if accuracy insufficient
**Architecture:** Tesseract.js integration, image processing, error correction UI

### ASR-2: Zero Data Loss (NFR4)
**Requirement:** Zero data loss across normal operations over 3-month validation
**Impact:** CRITICAL - Trust-building depends on reliability
**Risk:** One data loss event destroys weeks of trust
**Architecture:** Dexie.js database, service layer transactions, error recovery

### ASR-3: OCR Processing Time (NFR2)
**Requirement:** Receipt processing completes within 5 seconds
**Impact:** HIGH - Poor performance breaks post-shopping workflow
**Risk:** User abandonment if too slow
**Architecture:** Tesseract.js config, Web Worker, image optimization

### ASR-4: Response Time (NFR1)
**Requirement:** All user actions complete within 2 seconds
**Impact:** HIGH - Slow responsiveness breaks "single tap" promise
**Risk:** Frustration in at-home context (marking consumed)
**Architecture:** State management, database queries, component rendering

### ASR-5: Offline Functionality (NFR9)
**Requirement:** All core features function without network connectivity
**Impact:** CRITICAL - In-store shopping requires 100% offline
**Risk:** App unusable in store without network
**Architecture:** PWA configuration, service worker, local-only operations

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- | -------- |
| R-001 | TECH | OCR accuracy falls below 95% on diverse receipt formats | 3 | 3 | 9 | Receipt corpus testing, error correction UI, manual scan fallback | DEV | Pre-MVP |
| R-002 | DATA | Data loss during crash or unexpected termination | 2 | 3 | 6 | Dexie.js transactions, crash recovery tests, long-term stress testing | DEV | Epic 1 |
| R-003 | PERF | OCR processing exceeds 5 second target | 3 | 2 | 6 | Performance benchmarks, Web Worker optimization, image preprocessing | DEV | Epic 5 |
| R-004 | PERF | User actions exceed 2 second response time | 2 | 3 | 6 | Performance monitoring, database query optimization, component profiling | DEV | Epic 2 |
| R-005 | TECH | Offline functionality fails in network-disabled scenarios | 2 | 3 | 6 | Network-disabled E2E tests, PWA validation, service worker testing | DEV | Epic 4 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| R-006 | DATA | Product matching failures after OCR (existing products not recognized) | 2 | 2 | 4 | Fuzzy matching algorithm, user correction tracking | DEV |
| R-007 | BUS | Users don't trust automatic shopping list generation | 2 | 2 | 4 | Manual add/remove safety nets, clear stock visibility | DEV |
| R-008 | PERF | App launch exceeds 2 second target on mid-range devices | 2 | 2 | 4 | Launch time monitoring, lazy loading, bundle optimization | DEV |
| R-009 | OPS | Browser compatibility issues (iOS Safari, Android Chrome) | 1 | 3 | 3 | Cross-browser E2E testing, feature detection | DEV |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ------ |
| R-010 | OPS | PWA installation issues on certain devices | 1 | 2 | 2 | Monitor |
| R-011 | BUS | Users forget to mark items consumed | 1 | 2 | 2 | Monitor |
| R-012 | SEC | Camera permission denied by user | 1 | 1 | 1 | Monitor |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| NFR6: OCR accuracy ≥95% | E2E | R-001 | 5 | DEV | Receipt corpus with ground truth |
| NFR4: Zero data loss | Integration | R-002 | 3 | DEV | Crash recovery, 1000-op stress test |
| NFR2: OCR processing <5s | E2E | R-003 | 3 | DEV | Timed with real receipts |
| NFR1: Response time <2s | E2E | R-004 | 4 | DEV | Stock marking, list loading, search |
| NFR9: Offline functionality | E2E | R-005 | 3 | DEV | Network-disabled complete workflow |

**Total P0**: 18 tests, 36 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| FR1-5: Product management (CRUD) | E2E | - | 5 | DEV | Add, edit, delete, view, search |
| FR6-10: Stock level tracking | E2E | - | 4 | DEV | 4-state system, visual feedback |
| FR11-16: Shopping list generation | Integration | R-007 | 4 | DEV | Auto-add, auto-remove, manual override |
| FR22-26: Receipt scanning | E2E | R-006 | 4 | DEV | Camera capture, OCR, product matching |
| FR27-31: OCR error correction | E2E | - | 3 | DEV | Review, correct, add missing, confirm |
| FR32-35: Inventory updates | Integration | - | 4 | DEV | Replenish stock, add new products |

**Total P1**: 24 tests, 24 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| NFR3: App launch <2s | E2E | R-008 | 2 | DEV | Cold start, warm start |
| NFR11: Cross-browser compatibility | E2E | R-009 | 4 | DEV | Chrome, Firefox, Safari, mobile |
| FR17-21: In-store shopping | E2E | - | 4 | DEV | List access, checkbox, progress |
| FR36-39: Data persistence | Integration | - | 4 | DEV | App closure, device restart, recovery |
| FR40-43: User feedback | Component | - | 4 | DEV | Visual confirmation, errors, status |
| Service layer unit tests | Unit | - | 12 | DEV | All service methods |

**Total P2**: 30 tests, 12 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
| ----------- | ---------- | ---------- | ----- | ----- |
| NFR10: Storage efficiency | Integration | 2 | DEV | Storage footprint under 100MB |
| Error boundary isolation | Component | 3 | DEV | Feature-level error handling |
| Context + reducer patterns | Unit | 6 | DEV | All context providers |
| Utility functions | Unit | 8 | DEV | errorHandler, logger, validation |

**Total P3**: 19 tests, 5 hours

---

## Test Levels Strategy

### Level 1: Unit Tests (Vitest + React Testing Library)
**Scope**: Individual components, hooks, services, utilities
**Coverage Target**: 80%+ service layer, 70%+ components
**Focus**:
- Service methods (inventory, shopping, OCR)
- Custom hooks (useInventory, useShopping, useOCR, useCamera)
- Utility functions (errorHandler, logger, validation)
- Reducer functions (immutable state updates)

**ASR Validation**:
- NFR1: Response time benchmarks
- NFR9: Offline mocked conditions

### Level 2: Integration Tests (Vitest + Testing Library)
**Scope**: Feature workflows across components and services
**Coverage Target**: All critical user workflows
**Focus**:
- Context providers with service integration
- Component + service interactions
- Database operations (Dexie.js in-memory)
- Error handling end-to-end
- State management across tree

**ASR Validation**:
- NFR4: Data persistence
- NFR1: Multi-component timing

### Level 3: E2E Tests (Playwright)
**Scope**: Complete user journeys in real browser
**Coverage Target**: All 28 user stories
**Focus**:
- Story acceptance criteria
- Cross-browser compatibility
- PWA offline scenarios
- Receipt scanning with mock receipts
- Performance under realistic conditions

**ASR Validation**:
- NFR2: OCR processing time
- NFR6: OCR accuracy
- NFR3: App launch time
- NFR9: Complete offline workflow

---

## NFR Testing Approach

### NFR1: Response Time (<2 seconds)

**Test Method**: Automated performance benchmarks

```typescript
// Unit test with performance measurement
test('updateStockLevel completes within 2 seconds', async () => {
  const start = performance.now();
  await inventoryService.updateStockLevel(id, 'low');
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(2000);
});

// E2E test with user interaction timing
test('marking item consumed responds within 2 seconds', async ({ page }) => {
  await page.goto('/');
  const start = Date.now();
  await page.click('[data-testid="product-milk-stock-picker"]');
  await page.click('[data-testid="stock-level-low"]');
  await expect(page.locator('[data-testid="product-milk-chip"]')).toContainText('Low');
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(2000);
});
```

### NFR2: OCR Processing Time (<5 seconds)

**Test Method**: Benchmark with standardized receipt corpus

```typescript
// Receipt test fixtures
tests/fixtures/mock-receipts/
  ├── tesco-standard.jpg
  ├── sainsburys-long.jpg
  ├── aldi-short.jpg
  └── receipt-corpus.json  // Expected results

// E2E OCR performance test
test('receipt processing completes within 5 seconds', async ({ page }) => {
  await page.goto('/scan');
  const receiptPath = './tests/fixtures/mock-receipts/tesco-standard.jpg';

  const start = Date.now();
  await uploadReceipt(page, receiptPath);
  await page.waitForSelector('[data-testid="review-products"]');
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(5000);
});
```

### NFR4: Zero Data Loss

**Test Method**: Long-running stress test + crash recovery

```typescript
// Integration test: Data persistence across operations
test('inventory survives 1000 operations without data loss', async () => {
  const initialProducts = await inventoryService.getProducts();

  // Perform 1000 random operations
  for (let i = 0; i < 1000; i++) {
    await randomOperation(); // add, update, delete
  }

  const finalProducts = await inventoryService.getProducts();
  expect(finalProducts.length).toBeGreaterThan(0);

  // Verify data integrity
  finalProducts.forEach(product => {
    expect(product.id).toBeDefined();
    expect(product.name).toBeTruthy();
    expect(['high', 'medium', 'low', 'empty']).toContain(product.stockLevel);
  });
});

// E2E test: App crash recovery
test('recovers gracefully after unexpected termination', async ({ page, context }) => {
  // Add products
  await addProduct(page, 'Milk');
  await addProduct(page, 'Bread');

  // Simulate crash by closing and reopening
  await context.close();
  const newContext = await browser.newContext();
  const newPage = await newContext.newPage();
  await newPage.goto('/');

  // Verify data persists
  await expect(newPage.locator('[data-testid="product-milk"]')).toBeVisible();
  await expect(newPage.locator('[data-testid="product-bread"]')).toBeVisible();
});
```

### NFR6: OCR Accuracy (95%+)

**Test Method**: Receipt corpus with ground truth

```typescript
// Receipt corpus format
interface ReceiptTestCase {
  imagePath: string;
  expectedProducts: string[];
  store: string;
}

const receiptCorpus: ReceiptTestCase[] = [
  {
    imagePath: './fixtures/mock-receipts/tesco-2024-01-15.jpg',
    expectedProducts: ['Milk', 'Bread', 'Eggs', 'Chicken', 'Pasta'],
    store: 'Tesco'
  },
  // ... 20+ test receipts
];

// OCR accuracy measurement
test('OCR achieves 95%+ accuracy across receipt corpus', async () => {
  let totalProducts = 0;
  let correctRecognitions = 0;

  for (const testCase of receiptCorpus) {
    const result = await ocrService.processReceipt(testCase.imagePath);
    totalProducts += testCase.expectedProducts.length;

    // Count correct recognitions (fuzzy match)
    testCase.expectedProducts.forEach(expected => {
      const found = result.products.some(p =>
        levenshteinDistance(p.name, expected) <= 2
      );
      if (found) correctRecognitions++;
    });
  }

  const accuracy = correctRecognitions / totalProducts;
  expect(accuracy).toBeGreaterThanOrEqual(0.95);

  console.log(`OCR Accuracy: ${(accuracy * 100).toFixed(2)}%`);
});
```

### NFR9: Offline Functionality

**Test Method**: Network-disabled E2E tests

```typescript
// E2E test with offline simulation
test('complete shopping cycle works offline', async ({ page, context }) => {
  await page.goto('/');

  // Go offline
  await context.setOffline(true);

  // Mark item consumed
  await page.click('[data-testid="product-milk"]');
  await page.click('[data-testid="stock-level-low"]');

  // Navigate to shopping list
  await page.click('[data-testid="nav-shopping"]');
  await expect(page.locator('[data-testid="shopping-item-milk"]')).toBeVisible();

  // Mark item collected
  await page.check('[data-testid="shopping-item-milk-checkbox"]');
  await expect(page.locator('[data-testid="progress"]')).toContainText('1 of 1');

  // Verify offline badge/indicator
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
});
```

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] App launches without errors (30s)
- [ ] Main routes render (/, /shopping, /scan) (45s)
- [ ] Database initializes successfully (30s)
- [ ] Service layer instantiates (15s)

**Total**: 4 scenarios

### P0 Tests (<15 min)

**Purpose**: Critical path validation

- [ ] OCR accuracy ≥95% on receipt corpus (E2E - 3min)
- [ ] Zero data loss stress test (Integration - 2min)
- [ ] OCR processing <5s (E2E - 2min)
- [ ] Stock marking <2s response (E2E - 1min)
- [ ] Shopping list load <2s (E2E - 1min)
- [ ] Search filter <500ms (E2E - 1min)
- [ ] Complete workflow offline (E2E - 3min)

**Total**: 18 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] Product CRUD operations (E2E - 5min)
- [ ] Stock level tracking (E2E - 4min)
- [ ] Shopping list generation (Integration - 4min)
- [ ] Receipt scanning workflow (E2E - 6min)
- [ ] OCR error correction (E2E - 4min)
- [ ] Inventory updates from receipt (Integration - 4min)

**Total**: 24 scenarios

### P2/P3 Tests (<45 min)

**Purpose**: Full regression coverage

- [ ] Cross-browser compatibility (E2E - 8min)
- [ ] Data persistence across restarts (Integration - 4min)
- [ ] User feedback mechanisms (Component - 4min)
- [ ] Service layer unit tests (Unit - 12min)
- [ ] Utility function tests (Unit - 8min)
- [ ] Context provider tests (Unit - 6min)

**Total**: 49 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | 18 | 2.0 | 36 | Complex OCR testing, performance benchmarks |
| P1 | 24 | 1.0 | 24 | Standard E2E and integration coverage |
| P2 | 30 | 0.5 | 15 | Cross-browser, persistence, components |
| P3 | 19 | 0.25 | 5 | Unit tests, exploratory |
| **Total** | **91** | **-** | **80** | **~10 days** |

### Prerequisites

**Test Data:**
- `ProductFactory` (faker-based, auto-cleanup)
- `ReceiptCorpusFixture` (20+ receipts with ground truth)
- Mock Dexie.js database (in-memory for integration tests)

**Tooling:**
- Vitest for unit/integration tests
- Playwright for E2E tests
- React Testing Library for component tests
- Performance.now() API for timing measurements
- Levenshtein distance for OCR fuzzy matching

**Environment:**
- Node.js 20+ for Vitest and Playwright
- Multiple browsers installed (Chrome, Firefox, Safari)
- Receipt corpus stored in `tests/fixtures/mock-receipts/`
- Test database isolated from production data

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥95% (waivers required for failures)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical ASRs**: 100% (all 5 ASRs must be validated)
- **NFRs**: 100% (all 14 NFRs must have test coverage)
- **FRs**: ≥90% (40/43 FRs covered through stories)
- **Service layer**: ≥80% code coverage
- **Components**: ≥70% code coverage

### Non-Negotiable Requirements

- [ ] All P0 tests pass (18/18)
- [ ] No high-risk (≥6) items unmitigated (5 risks addressed)
- [ ] OCR accuracy ≥95% validated (R-001)
- [ ] Zero data loss confirmed (R-002)
- [ ] Performance targets met: <2s actions, <5s OCR (R-003, R-004)
- [ ] Offline functionality validated (R-005)

---

## Mitigation Plans

### R-001: OCR Accuracy Falls Below 95% (Score: 9)

**Mitigation Strategy:**
1. Build receipt corpus with ground truth (20+ receipts from target stores)
2. Implement fuzzy matching algorithm (Levenshtein distance ≤2)
3. Add image preprocessing (contrast enhancement, perspective correction)
4. Design intuitive error correction UI for manual fixes
5. Provide manual scan fallback for failed recognitions
6. Track OCR confidence scores and flag low-confidence items

**Owner:** DEV
**Timeline:** Epic 5 completion
**Status:** Planned
**Verification:** Automated test suite measures accuracy across corpus

### R-002: Data Loss During Crash (Score: 6)

**Mitigation Strategy:**
1. Implement Dexie.js transactions for all multi-step operations
2. Add crash recovery tests (simulate unexpected termination)
3. Run 1000-operation stress test to validate data integrity
4. Use try/catch/finally patterns in all service methods
5. Add data validation checks on app startup
6. Log data operations for debugging

**Owner:** DEV
**Timeline:** Epic 1 completion
**Status:** Planned
**Verification:** Stress tests pass, crash recovery tests pass

### R-003: OCR Processing Exceeds 5 Seconds (Score: 6)

**Mitigation Strategy:**
1. Use Tesseract.js Web Worker for non-blocking processing
2. Implement image size optimization before OCR
3. Add progress indicators during processing
4. Benchmark OCR performance across device types
5. Consider preprocessing optimizations (grayscale, contrast)
6. Profile and optimize bottlenecks

**Owner:** DEV
**Timeline:** Epic 5 completion
**Status:** Planned
**Verification:** Performance tests measure <5s consistently

### R-004: User Actions Exceed 2 Seconds (Score: 6)

**Mitigation Strategy:**
1. Add performance.now() measurements in critical paths
2. Optimize database queries (indexed fields in Dexie.js)
3. Use React.memo selectively for expensive components
4. Profile component rendering with React DevTools
5. Implement optimistic UI updates (show change immediately)
6. Monitor bundle size and lazy load when necessary

**Owner:** DEV
**Timeline:** Epic 2 completion
**Status:** Planned
**Verification:** Automated timing tests for all user actions

### R-005: Offline Functionality Fails (Score: 6)

**Mitigation Strategy:**
1. Configure PWA with vite-plugin-pwa properly
2. Implement network-disabled E2E tests
3. Test service worker caching strategies
4. Validate IndexedDB persistence works offline
5. Add offline indicator in UI
6. Test receipt scanning with cached OCR models

**Owner:** DEV
**Timeline:** Epic 4 completion
**Status:** Planned
**Verification:** Complete shopping cycle works with network disabled

---

## Assumptions and Dependencies

### Assumptions

1. Modern smartphone OCR accuracy is sufficient (95%+) for grocery receipts
2. Tesseract.js can achieve <5s processing time on mid-range devices
3. IndexedDB provides sufficient storage for hundreds of products
4. Users will focus on 1-2 regular supermarkets during MVP validation
5. Receipt formats from target stores remain relatively consistent
6. Dexie.js transactions provide adequate data integrity guarantees
7. PWA service workers enable reliable offline functionality

### Dependencies

1. **Receipt Corpus Collection** - Required by Epic 5 start
   - Need 20+ receipts from target supermarkets
   - Must include ground truth product lists
   - Should cover diverse conditions (lighting, paper quality)

2. **Tesseract.js Performance Validation** - Required by Epic 5 start
   - Prototype OCR integration
   - Measure processing time on target devices
   - Validate 95% accuracy is achievable

3. **Test Infrastructure Setup** - Required by Epic 1 completion
   - Vitest configured for unit/integration tests
   - Playwright configured for E2E tests
   - GitHub Actions CI/CD pipeline
   - Mock receipt fixtures prepared

### Risks to Plan

- **Risk**: OCR accuracy validation requires physical receipt collection
  - **Impact**: Delays test development until receipts available
  - **Contingency**: Use synthesized receipts for initial testing, validate with real receipts later

- **Risk**: Tesseract.js performance varies significantly across devices
  - **Impact**: May not achieve <5s target on all devices
  - **Contingency**: Narrow device support range, optimize for common devices first

- **Risk**: Long-term data loss testing requires extended validation period
  - **Impact**: Can't fully validate NFR4 until 3-month period complete
  - **Contingency**: Run shorter stress tests (1000 ops) as proxy metric

---

## Test Framework Architecture

### Test Directory Structure

```
tests/
├── unit/                      # Vitest unit tests (co-located with source)
│   ├── services/
│   │   ├── inventory.test.ts
│   │   ├── shopping.test.ts
│   │   └── ocr.test.ts
│   ├── utils/
│   │   ├── errorHandler.test.ts
│   │   └── logger.test.ts
│   └── context/
│       ├── InventoryContext.test.tsx
│       └── ShoppingContext.test.tsx
│
├── integration/               # Vitest integration tests
│   ├── inventory-workflow.test.ts
│   ├── shopping-list-generation.test.ts
│   └── receipt-processing.test.ts
│
├── e2e/                       # Playwright E2E tests
│   ├── inventory.spec.ts
│   ├── shopping.spec.ts
│   ├── receipt-scanning.spec.ts
│   └── offline.spec.ts
│
├── fixtures/                  # Test data
│   ├── mock-products.ts
│   ├── mock-receipts/
│   │   ├── tesco-standard.jpg
│   │   ├── sainsburys-long.jpg
│   │   └── receipt-corpus.json
│   └── test-data-factory.ts
│
└── helpers/                   # Test utilities
    ├── database-setup.ts
    ├── receipt-upload.ts
    └── performance-utils.ts
```

### Configuration Files

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**playwright.config.ts:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

---

## Follow-on Workflows

After system-level test design is approved:

1. **testarch-atdd** (Acceptance Test-Driven Development)
   - Generate failing P0 tests from acceptance criteria
   - Red-green-refactor cycle
   - Run before implementation starts

2. **testarch-framework** (Test Framework Setup)
   - Initialize Vitest and Playwright configurations
   - Set up test fixtures and helpers
   - Configure CI/CD test execution

3. **testarch-automate** (Automated Test Expansion)
   - Expand test coverage after implementation
   - Add regression tests
   - Performance benchmarking suite

4. **testarch-ci** (CI/CD Pipeline Integration)
   - Configure GitHub Actions
   - Add quality gates
   - Automated test execution on PR

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: Isma Date: ___________
- [ ] Tech Lead: Isma Date: ___________
- [ ] QA Lead: Isma Date: ___________

**Comments:**

---

## Appendix

### Related Documents

- PRD: `_bmad-output/planning-artifacts/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Epics & Stories: `_bmad-output/planning-artifacts/epics.md`

### Key Requirements Summary

**43 Functional Requirements (FR1-FR43):**
- Product Inventory Management: FR1-FR5
- Stock Level Tracking: FR6-FR10
- Automatic Shopping List: FR11-FR16
- In-Store Shopping: FR17-FR21
- Receipt Scanning & OCR: FR22-FR26
- OCR Error Correction: FR27-FR31
- Inventory Updates: FR32-FR35
- Data Persistence: FR36-FR39
- User Feedback: FR40-FR43

**14 Non-Functional Requirements (NFR1-NFR14):**
- Performance: NFR1-NFR3 (<2s actions, <5s OCR, <2s launch)
- Reliability: NFR4-NFR6 (zero loss, zero crashes, 95% OCR)
- Usability: NFR7-NFR8 (no tutorial needed, accessibility)
- Local-First: NFR9-NFR10 (offline, <100MB storage)
- Compatibility: NFR11-NFR12 (90% browsers, mid-range devices)
- Security: NFR13-NFR14 (local data, camera permissions)

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `_bmad/bmm/workflows/testarch/test-design`
**Version**: System-Level (Phase 3 - Solutioning)
**Date**: 2026-01-04
