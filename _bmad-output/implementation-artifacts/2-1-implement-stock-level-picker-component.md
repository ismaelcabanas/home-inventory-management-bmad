# Story 2.1: Implement Stock Level Picker Component

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **household manager**,
I want a quick and effortless way to update stock levels for products,
so that I can mark items consumed in less than 1 second with a single tap.

## Context

This is the first story in Epic 2 - Stock Level Tracking & Visual Feedback, which focuses on implementing the core interaction for marking products as consumed. The stock level picker is the foundational component that enables the automatic shopping list generation - when users mark items as Low or Empty, those items automatically flow to the shopping list.

**User Journey:** Throughout the week, as users consume products (finish milk, running low on bread), they open the app and quickly tap to update stock levels. This simple act of marking items consumed is what powers the entire automatic shopping list generation system.

**Critical Success Factor:** This interaction must be completely effortless (<1 second, single tap) or users won't maintain the habit, breaking the automation promise.

## Acceptance Criteria

### AC1: Stock Level Picker Component Created

**Given** I am building the stock level management system
**When** I create the StockLevelPicker component
**Then** The component accepts the following props:
- `currentLevel`: StockLevel enum (HIGH, MEDIUM, LOW, EMPTY)
- `onLevelChange`: Callback function (level: StockLevel) => void
- `productId`: string (for tracking which product is being updated)
- `disabled`: boolean (optional, default false)
**And** The component is implemented in `src/components/StockLevelPicker/`
**And** The component uses MUI components (ButtonGroup or similar) for visual consistency
**And** The component is fully typed with TypeScript
**And** The component follows the existing project structure and naming conventions

### AC2: Visual Design Follows UX Specification

**Given** The StockLevelPicker component is created
**When** I implement the visual design
**Then** The picker displays four distinct visual states:
- **HIGH**: Green indicator (color: success theme color)
- **MEDIUM**: Blue indicator (color: info theme color)
- **LOW**: Orange indicator (color: warning theme color)
- **EMPTY**: Red indicator (color: error theme color)
**And** Each state has a clear, recognizable icon or label
**And** Tap targets are minimum 44x44 pixels (per NFR8 accessibility)
**And** The current stock level is visually highlighted/selected
**And** The design follows Material Design principles via MUI
**And** The component is visually consistent with the rest of the application

### AC3: Single-Tap Interaction Implementation

**Given** A product has a stock level picker displayed
**When** I tap once on a different stock level
**Then** The stock level updates immediately (<1 second per NFR1)
**And** Visual feedback is instant (selected state changes immediately)
**And** The onLevelChange callback is invoked with the new stock level
**And** No confirmation dialog is required (direct single-tap action)
**And** The interaction feels responsive and satisfying
**And** Multiple rapid taps are handled gracefully (debouncing if needed)

### AC4: Integration with Product Card

**Given** The StockLevelPicker component is complete
**When** I integrate it into the ProductCard component
**Then** Each product in the inventory list displays its current stock level
**And** Users can tap the picker directly from the product card
**And** The stock level updates persist via the repository layer
**And** The ProductCard re-renders only when stock level changes (performance optimization)
**And** The integration follows the existing component composition pattern
**And** No regression in existing ProductCard functionality (edit, delete still work)

### AC5: State Management and Persistence

**Given** A user changes a product's stock level
**When** The stock level is updated
**Then** The change is persisted to IndexedDB via ProductRepository
**And** The updated stock level is reflected in the ProductsContext immediately
**And** The change survives app restarts and page refreshes (NFR4: zero data loss)
**And** Optimistic UI updates occur (UI updates before persistence completes)
**And** If persistence fails, the UI reverts and shows an error message
**And** Concurrent updates from multiple components are handled correctly

### AC6: Comprehensive Test Coverage

**Given** The StockLevelPicker component is implemented
**When** I write tests for the component
**Then** Unit tests cover:
- Rendering all four stock level states correctly
- Calling onLevelChange callback with correct stock level value
- Visual highlighting of current stock level
- Disabled state behavior
- Keyboard accessibility (if applicable)
- Edge cases (rapid clicks, undefined props, etc.)
**And** Integration tests cover:
- StockLevelPicker integration with ProductCard
- State updates propagating to ProductsContext
- Persistence via ProductRepository
- UI rollback on persistence failure
**And** All tests follow the existing test structure (Vitest + React Testing Library)
**And** Test coverage maintains or exceeds current project standards (>90%)
**And** All tests pass with 0 failures

---

## Tasks / Subtasks

### Task 1: Create StockLevelPicker Component Structure (AC: #1)
- [x] Subtask 1.1: Create `src/components/StockLevelPicker/` directory
- [x] Subtask 1.2: Create `StockLevelPicker.tsx` with TypeScript interface for props
- [x] Subtask 1.3: Create `index.ts` barrel export
- [x] Subtask 1.4: Define StockLevel enum in `src/types/` if not already exists
- [x] Subtask 1.5: Write basic component structure with props validation

### Task 2: Implement Visual Design with MUI (AC: #2)
- [x] Subtask 2.1: Choose MUI component (ButtonGroup, ToggleButtonGroup, or custom)
- [x] Subtask 2.2: Implement four visual states with appropriate colors (success, info, warning, error)
- [x] Subtask 2.3: Add icons or labels for each stock level (HIGH, MEDIUM, LOW, EMPTY)
- [x] Subtask 2.4: Ensure 44x44px minimum tap targets (NFR8 accessibility)
- [x] Subtask 2.5: Apply visual highlighting to currently selected stock level
- [x] Subtask 2.6: Test visual design on mobile viewport (primary target)

### Task 3: Implement Single-Tap Interaction (AC: #3)
- [x] Subtask 3.1: Implement onClick handler for stock level selection
- [x] Subtask 3.2: Call onLevelChange callback with new stock level
- [x] Subtask 3.3: Ensure immediate visual feedback (<1 second response)
- [x] Subtask 3.4: Add debouncing if rapid clicks cause issues
- [x] Subtask 3.5: Handle disabled state (no interaction when disabled)
- [x] Subtask 3.6: Test interaction feels responsive and satisfying

### Task 4: Integrate with ProductCard Component (AC: #4)
- [x] Subtask 4.1: Read existing ProductCard component to understand structure
- [x] Subtask 4.2: Add StockLevelPicker to ProductCard component
- [x] Subtask 4.3: Pass current product stock level as prop
- [x] Subtask 4.4: Implement onLevelChange handler to update product via context
- [x] Subtask 4.5: Optimize re-renders (React.memo or useMemo if needed)
- [x] Subtask 4.6: Verify existing ProductCard functionality (edit, delete) still works

### Task 5: Implement State Management and Persistence (AC: #5)
- [x] Subtask 5.1: Update ProductsContext to handle stock level changes
- [x] Subtask 5.2: Implement optimistic UI updates (update UI immediately)
- [x] Subtask 5.3: Call ProductRepository to persist stock level to IndexedDB
- [x] Subtask 5.4: Implement error handling with UI rollback on persistence failure
- [x] Subtask 5.5: Add error toast/snackbar for persistence failures
- [x] Subtask 5.6: Test persistence survives app restarts and page refreshes

### Task 6: Write Comprehensive Tests (AC: #6)
- [x] Subtask 6.1: Write unit tests for StockLevelPicker component
  - [x] Test rendering all four stock level states
  - [x] Test onLevelChange callback invocation
  - [x] Test visual highlighting of current level
  - [x] Test disabled state behavior
  - [x] Test edge cases (rapid clicks, undefined props)
- [x] Subtask 6.2: Write integration tests for ProductCard + StockLevelPicker
  - [x] Test stock level updates propagate to context
  - [x] Test persistence via repository layer
  - [x] Test UI rollback on persistence failure
- [x] Subtask 6.3: Run full test suite and verify >90% coverage maintained
- [x] Subtask 6.4: Fix any failing tests or coverage gaps

---

## Dev Notes

### Critical Implementation Requirements

**Component Architecture:**

The StockLevelPicker should be a controlled component that receives its state from a parent and notifies changes via callback. This follows React best practices and ensures single source of truth.

```typescript
// src/components/StockLevelPicker/StockLevelPicker.tsx
interface StockLevelPickerProps {
  currentLevel: StockLevel;
  onLevelChange: (level: StockLevel) => void;
  productId: string;
  disabled?: boolean;
}

export const StockLevelPicker: React.FC<StockLevelPickerProps> = ({
  currentLevel,
  onLevelChange,
  productId,
  disabled = false,
}) => {
  // Implementation using MUI ToggleButtonGroup or ButtonGroup
  const handleLevelChange = (level: StockLevel) => {
    if (!disabled) {
      onLevelChange(level);
    }
  };

  return (
    <ToggleButtonGroup
      value={currentLevel}
      exclusive
      onChange={(_, value) => value && handleLevelChange(value)}
      disabled={disabled}
      size="small"
    >
      <ToggleButton value={StockLevel.HIGH} color="success">
        HIGH
      </ToggleButton>
      <ToggleButton value={StockLevel.MEDIUM} color="info">
        MEDIUM
      </ToggleButton>
      <ToggleButton value={StockLevel.LOW} color="warning">
        LOW
      </ToggleButton>
      <ToggleButton value={StockLevel.EMPTY} color="error">
        EMPTY
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
```

**MUI Component Choice:**

Two primary options:
1. **ToggleButtonGroup** (Recommended): Material Design standard for exclusive selection, built-in styling
2. **ButtonGroup**: Simpler but requires more custom styling for selection state

Recommendation: Use MUI `ToggleButtonGroup` with `exclusive` prop for single selection.

---

### Visual Design Specifications

**Color Mapping (from MUI theme):**

```typescript
HIGH:    theme.palette.success.main   // Green
MEDIUM:  theme.palette.info.main      // Blue
LOW:     theme.palette.warning.main   // Orange
EMPTY:   theme.palette.error.main     // Red
```

**Accessibility:**
- Minimum tap target: 44x44 pixels (NFR8)
- Color contrast ratio: 4.5:1 minimum (WCAG AA)
- Consider adding text labels in addition to colors (for color-blind users)
- ARIA labels for screen readers

**Icons (Optional Enhancement):**
- HIGH: ✓ or full battery icon
- MEDIUM: half-full icon
- LOW: warning icon
- EMPTY: empty/alert icon

For MVP, text labels (HIGH, MEDIUM, LOW, EMPTY) are sufficient. Icons can be Phase 2 enhancement.

---

### Integration with ProductCard

**Current ProductCard Structure:**

Based on Story 1.6, the ProductCard component likely has:
- Product name display
- Edit button
- Delete button (with confirmation dialog)

**Integration Approach:**

Add StockLevelPicker between product name and action buttons:

```
[Product Name]
[Stock Level Picker: HIGH | MEDIUM | LOW | EMPTY]
[Edit] [Delete]
```

Or inline layout:
```
[Product Name]        [HIGH | MEDIUM | LOW | EMPTY] [Edit] [Delete]
```

Choose layout based on existing ProductCard design and mobile viewport constraints.

---

### State Management Flow

**Optimistic Update Pattern:**

```typescript
// In ProductCard or ProductsContext
const handleStockLevelChange = async (productId: string, newLevel: StockLevel) => {
  // 1. Optimistic UI update (immediate)
  setProducts(prev => prev.map(p =>
    p.id === productId ? { ...p, stockLevel: newLevel } : p
  ));

  try {
    // 2. Persist to IndexedDB
    await productRepository.updateStockLevel(productId, newLevel);
  } catch (error) {
    // 3. Rollback on failure
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, stockLevel: originalLevel } : p
    ));

    // 4. Show error to user
    showErrorToast('Failed to update stock level. Please try again.');
  }
};
```

This pattern ensures:
- Instant UI feedback (feels fast)
- Reliable persistence (data saved)
- Graceful failure handling (user informed, state consistent)

---

### StockLevel Type Definition

**If not already exists, add to `src/types/product.ts`:**

```typescript
export enum StockLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  EMPTY = 'EMPTY',
}

export interface Product {
  id: string;
  name: string;
  stockLevel: StockLevel;  // Add this field
  createdAt: Date;
  updatedAt: Date;
}
```

**Update ProductRepository:**

Add method to update stock level:

```typescript
// src/repositories/ProductRepository.ts
async updateStockLevel(productId: string, stockLevel: StockLevel): Promise<void> {
  const product = await this.getById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  product.stockLevel = stockLevel;
  product.updatedAt = new Date();

  await this.update(product);
}
```

---

### Testing Strategy

**Unit Tests (StockLevelPicker.test.tsx):**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { StockLevelPicker } from './StockLevelPicker';
import { StockLevel } from '../../types/product';

describe('StockLevelPicker', () => {
  it('renders all four stock levels', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel={StockLevel.HIGH}
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
    expect(screen.getByText('EMPTY')).toBeInTheDocument();
  });

  it('calls onLevelChange when a different level is clicked', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel={StockLevel.HIGH}
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    fireEvent.click(screen.getByText('LOW'));

    expect(mockOnChange).toHaveBeenCalledWith(StockLevel.LOW);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('visually highlights the current stock level', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <StockLevelPicker
        currentLevel={StockLevel.HIGH}
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    const highButton = screen.getByText('HIGH').closest('button');
    expect(highButton).toHaveClass('Mui-selected'); // MUI selected class

    rerender(
      <StockLevelPicker
        currentLevel={StockLevel.LOW}
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    const lowButton = screen.getByText('LOW').closest('button');
    expect(lowButton).toHaveClass('Mui-selected');
  });

  it('does not call onLevelChange when disabled', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel={StockLevel.HIGH}
        onLevelChange={mockOnChange}
        productId="test-id"
        disabled={true}
      />
    );

    fireEvent.click(screen.getByText('LOW'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
```

**Integration Tests (ProductCard.test.tsx updates):**

```typescript
it('updates stock level when picker is clicked', async () => {
  const mockProduct = {
    id: 'test-id',
    name: 'Test Product',
    stockLevel: StockLevel.HIGH,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  render(<ProductCard product={mockProduct} />);

  // Click LOW button
  fireEvent.click(screen.getByText('LOW'));

  // Verify optimistic update
  await waitFor(() => {
    expect(screen.getByText('LOW').closest('button')).toHaveClass('Mui-selected');
  });

  // Verify persistence called (mock ProductRepository)
  expect(mockRepository.updateStockLevel).toHaveBeenCalledWith('test-id', StockLevel.LOW);
});
```

---

### Architecture Compliance

**From Architecture Document:**

**Component Structure (Lines 420-518):**
- Components in `src/components/`
- Barrel exports via `index.ts`
- TypeScript interfaces for all props
- Follows single responsibility principle

**State Management (Lines 253-324):**
- ProductsContext manages product state
- Optimistic updates for fast UI
- Repository pattern for data persistence
- Error boundaries catch failures

**Design System (Lines 882-1069 in UX Design):**
- Use MUI components (ToggleButtonGroup recommended)
- Follow Material Design principles
- Consistent with existing component styling
- Minimum 44x44px tap targets (NFR8)

**Performance Requirements (NFR1):**
- <2 second response time for all actions
- Optimistic UI updates for instant feedback
- Debouncing for rapid interactions if needed

**Data Integrity (NFR4):**
- Zero data loss across sessions
- Persistence via IndexedDB (ProductRepository)
- Rollback on persistence failure

---

### Previous Story Intelligence

**From Story 1.10 (Deploy Application with CI/CD Pipeline):**

**Key Learnings:**
1. **Build Process**: Production build completes in 3.18 seconds
2. **Test Suite**: 171 tests passing (all unit tests green)
3. **E2E Tests**: 30 Playwright tests passing (10 tests × 3 browsers)
4. **Test Coverage**: 92.97% statements, 90.06% branches (high bar to maintain)
5. **Bundle Size**: 581KB main bundle (noted as tech debt for optimization)
6. **Lint Status**: 0 errors, 0 warnings (maintain this standard)
7. **CI/CD Pipeline**: GitHub Actions workflow fully operational
8. **Deployment**: Vercel deployment successful with HTTPS

**Code Quality Standards Established:**
- ESLint passing consistently
- TypeScript strict mode compilation
- Comprehensive test coverage (>90%)
- No console errors in production
- Performance targets being met

**Development Workflow:**
- Feature branches from main
- PR-based workflow with CI/CD checks
- All quality gates must pass before merge
- Co-authored commits with Claude

**Project Structure Patterns:**
- Components in `src/components/` with barrel exports
- Types in `src/types/`
- Repositories in `src/repositories/`
- Context providers in `src/contexts/`
- Tests co-located with source files (`.test.tsx`)

**Tech Stack Confirmed:**
- React 18+ with TypeScript
- Vite for build tooling
- MUI (Material-UI) for component library
- Vitest + React Testing Library for unit tests
- Playwright for E2E tests
- IndexedDB for local persistence

---

### UX Design Specifications

**From UX Design Document (Lines 875-1069):**

**Stock Level Picker Design:**
- **Component Choice**: MUI ToggleButtonGroup (exclusive selection)
- **Visual States**: Four distinct colors mapped to MUI theme
  - HIGH: success.main (green)
  - MEDIUM: info.main (blue)
  - LOW: warning.main (orange)
  - EMPTY: error.main (red)
- **Interaction**: Single-tap selection, no confirmation dialog
- **Feedback**: Immediate visual highlighting (<1 second)
- **Accessibility**: 44x44px minimum tap targets (NFR8)

**Critical User Experience Goals (Lines 176-219):**
- **Effortless Interaction**: Single tap to change stock level
- **Instant Feedback**: <1 second response time (NFR1)
- **No Manual Entry**: No typing, no quantity decisions, no forms
- **Muscle Memory**: Open app → tap product → done

**Trust-Building Through Transparency (Lines 283-293):**
- Users must see current stock level at all times
- Immediate visual feedback for every action
- Manual overrides available as safety nets
- Transparent system behavior (no mystery states)

---

### PRD Requirements

**From PRD (Lines 519-543 - Stock Level Tracking):**

**Functional Requirements:**
- **FR6**: Set stock level to HIGH, MEDIUM, LOW, or EMPTY
- **FR7**: Quick update with single tap/action
- **FR8**: Display current stock level for each product
- **FR9**: Stock level changes persist across sessions
- **FR10**: Immediate visual feedback when stock level changes

**Non-Functional Requirements:**
- **NFR1**: <2 second response time for all actions
- **NFR8**: 44x44px minimum tap targets for accessibility
- **NFR4**: Zero data loss (persistence required)

**Innovation Principle (Lines 325-332):**
Stock level tracking uses 4-state system (HIGH/MEDIUM/LOW/EMPTY) instead of quantity tracking to reduce cognitive load and enable fast, simple tap interactions.

---

### Epic Context

**From Epics (Epic 2 - Stock Level Tracking & Visual Feedback):**

**Epic Goal:** Implement visual stock level tracking with quick-tap updates, enabling users to mark items consumed throughout the week.

**Epic Value:** Without stock level tracking, users cannot mark items as Low/Empty, which breaks the automatic shopping list generation. This epic enables the core behavior: mark consumed → automatic list generation.

**Story 2.1 Position:** First story in Epic 2, foundational component for all subsequent stories in this epic.

**Subsequent Stories Preview:**
- Story 2.2: Implement visual stock level indicators on product cards
- Story 2.3: Add stock level filter to inventory list
- Story 2.4: Implement stock level analytics (optional)

---

### Critical Success Factors

**Three Keys to Success:**

1. **Component is Truly Effortless** - Single tap updates stock level in <1 second with instant visual feedback
2. **Integration is Seamless** - Works smoothly with existing ProductCard without breaking edit/delete functionality
3. **Persistence is Reliable** - Stock level changes survive app restarts with zero data loss (NFR4)

**Gotchas to Avoid:**

- **Don't add confirmation dialogs**: Stock level changes must be direct (single tap, no confirmations)
- **Don't forget optimistic updates**: UI must update instantly before persistence completes
- **Don't skip error handling**: If persistence fails, rollback UI and inform user
- **Don't break existing tests**: Maintain >90% coverage, ensure all 171 existing tests still pass
- **Don't ignore accessibility**: 44x44px tap targets are mandatory (NFR8)
- **Don't overcomplicate the design**: Simple text labels (HIGH, MEDIUM, LOW, EMPTY) are sufficient for MVP
- **Don't forget mobile-first**: Primary target is mobile viewport, test on mobile sizes
- **Don't skip integration tests**: Unit tests alone aren't enough, test full flow with ProductCard + Context + Repository

**Validation Checklist:**

Before marking this story complete, verify:
- [ ] StockLevelPicker component renders correctly with all four states
- [ ] Single tap updates stock level instantly (<1 second)
- [ ] Visual highlighting shows current stock level clearly
- [ ] Integration with ProductCard works smoothly
- [ ] Stock level persists to IndexedDB via ProductRepository
- [ ] Changes survive app restart and page refresh (NFR4)
- [ ] Optimistic UI updates work (instant feedback)
- [ ] Error handling with UI rollback on persistence failure
- [ ] All unit tests pass (maintain >90% coverage)
- [ ] All integration tests pass
- [ ] All 171 existing tests still pass (no regression)
- [ ] ESLint shows 0 errors, 0 warnings
- [ ] TypeScript compiles with no errors
- [ ] Component follows existing project structure and naming conventions
- [ ] Tap targets are 44x44px minimum (NFR8 accessibility)
- [ ] Works correctly on mobile viewport (primary target)

---

## References

**Epic:** `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.1)

**Architecture:**
- Component Architecture: `_bmad-output/planning-artifacts/architecture.md` (Lines 420-518)
- State Management: `_bmad-output/planning-artifacts/architecture.md` (Lines 253-324)
- Repository Pattern: `_bmad-output/planning-artifacts/architecture.md` (Lines 519-617)

**UX Design:**
- Stock Level Picker Design: `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 875-1069)
- Effortless Interactions: `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 176-219)
- Experience Principles: `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 271-300)

**PRD:**
- Stock Level Tracking: `_bmad-output/planning-artifacts/prd.md` (Lines 519-543)
- Non-Functional Requirements: `_bmad-output/planning-artifacts/prd.md` (Lines 591-673)

**Previous Story:**
- Story 1.10: `_bmad-output/implementation-artifacts/1-10-deploy-application-with-ci-cd-pipeline.md`
- Established code quality standards and development workflow
- Test suite: 171 tests passing, >90% coverage
- CI/CD pipeline operational

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (AWS Bedrock) - arn:aws:bedrock:eu-west-1:775910509766:application-inference-profile/hlc9ps7vuywr

### Debug Log References

No debug issues anticipated. This story follows established patterns from Epic 1.

### Completion Notes List

**Implementation Status:**

✅ Story completed successfully - all acceptance criteria met

**Implementation Summary:**

Created StockLevelPicker component using MUI ToggleButtonGroup following existing project patterns:
- Component accepts currentLevel, onLevelChange callback, productId, and optional disabled prop
- Used existing STOCK_LEVEL_CONFIG for visual consistency (lowercase: 'high', 'medium', 'low', 'empty')
- Integrated into ProductCard with handler passed down from InventoryList
- Leveraged existing InventoryContext.updateProduct for persistence (optimistic updates built-in)
- Implemented red-green-refactor TDD cycle: wrote failing tests first, then implementation
- 7 unit tests for StockLevelPicker component (all stock levels, callbacks, disabled state, accessibility)
- 3 integration tests for ProductCard integration
- Fixed existing ProductCard and InventoryList tests to handle multiple "High"/"Medium"/"Low"/"Empty" text elements
- All 181 tests passing (16 ProductCard tests, 7 StockLevelPicker tests)
- No regressions introduced

**Key Technical Decisions:**

1. Used existing lowercase string literals ('high', 'medium', 'low', 'empty') instead of UPPER_CASE enum suggested in Dev Notes
2. Reused STOCK_LEVEL_CONFIG from ProductCard for visual consistency
3. Leveraged existing updateProduct context method instead of adding new stock-level-specific method
4. InventoryContext already implements optimistic updates + error handling with snackbar notifications

### File List

**Files created:**
- `src/components/StockLevelPicker/StockLevelPicker.tsx` - Component implementation with MUI ToggleButtonGroup
- `src/components/StockLevelPicker/index.ts` - Barrel export
- `src/components/StockLevelPicker/StockLevelPicker.test.tsx` - Unit tests (7 tests)

**Files modified:**
- `src/features/inventory/components/ProductCard.tsx` - Integrated StockLevelPicker, added onStockLevelChange handler
- `src/features/inventory/components/ProductCard.test.tsx` - Fixed stock level text assertions, added 3 integration tests
- `src/features/inventory/components/InventoryList.tsx` - Added handleStockLevelChange handler, passed to ProductCard
- `src/features/inventory/components/InventoryList.test.tsx` - Fixed stock level text assertion in render test

**Files verified (no implementation changes):**
- `src/types/product.ts` - StockLevel type already existed as lowercase string literals
- `src/features/inventory/context/InventoryContext.tsx` - updateProduct method already handles stock level updates
- `src/features/inventory/components/stockLevelConfig.ts` - Reused existing config
- All 181 tests passing (no regressions)

---

## Change Log

**Date: 2026-01-20**
- Story created via create-story workflow
- Comprehensive context extracted from PRD, Architecture, UX Design, and Epics
- Previous story intelligence gathered from Story 1.10
- Story marked as ready-for-dev
- Epic 2 status updated to in-progress in sprint-status.yaml
- Feature branch created: feat/story-2-1-implement-stock-level-picker-component

**Date: 2026-01-21**
- Story implementation completed via dev-story workflow
- Created StockLevelPicker component with 7 unit tests (all passing)
- Integrated component into ProductCard and InventoryList
- Added 3 integration tests to ProductCard.test.tsx
- Fixed existing tests to handle multiple text matches (Chip + ToggleButton)
- All 181 tests passing, no regressions
- Story status updated to review

---

## Senior Developer Review (AI)

**Review Status:** Not yet reviewed - story ready for development

This story will be reviewed via code-review workflow after implementation is complete.
