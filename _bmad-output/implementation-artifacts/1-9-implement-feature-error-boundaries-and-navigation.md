# Story 1.9: Implement Feature Error Boundaries and Navigation

**Status:** review
**Epic:** Epic 1 - Project Foundation & Initial Inventory Setup
**Story ID:** 1.9
**Created:** 2026-01-19
**Priority:** P0 (Critical - Foundation)
**Branch:** feat/story-1-9-implement-feature-error-boundaries-and-navigation

---

## User Story

**As a** user,
**I want** the app to handle errors gracefully without crashing,
**So that** I can continue using other features even if one feature fails.

---

## Acceptance Criteria

### AC1: FeatureErrorBoundary Component Created

**Given** The error handling utilities exist (from Story 1.8)
**When** I implement the error boundary component
**Then** A `FeatureErrorBoundary` component exists in `src/components/shared/ErrorBoundary/FeatureErrorBoundary.tsx` that:
- Is a React class component (error boundaries require class components)
- Implements `getDerivedStateFromError()` to catch errors
- Implements `componentDidCatch()` to log errors
- Displays a user-friendly error message using MUI `Alert` component
- Shows a "Try Again" button that resets the error state
- Logs error details to console with `logger.error()`
- Accepts a `featureName` prop for context in error messages
- Has proper TypeScript types for props and state

**And** The component has comprehensive unit tests covering:
- Error catching and state updates
- Error logging with logger utility
- "Try Again" button functionality
- Proper rendering of error UI
- featureName prop usage

### AC2: Inventory Feature Wrapped in Error Boundary

**Given** The FeatureErrorBoundary component exists
**When** I wrap the inventory feature
**Then** The InventoryList component is wrapped with `<FeatureErrorBoundary featureName="Inventory">` in the routing setup
**And** When an error occurs in the inventory feature:
- The error boundary catches it
- An error message displays: "Something went wrong in Inventory."
- The "Try Again" button allows resetting the error state
- Other navigation items remain functional (no full app crash)

### AC3: React Router v6 Routes Configured

**Given** React Router v6 is installed
**When** I configure the routes in App.tsx
**Then** The following routes are configured:
- `/` → InventoryList component (wrapped in FeatureErrorBoundary)
- `/shopping` → Placeholder component "Shopping List - Coming Soon" (wrapped in FeatureErrorBoundary)
- `/scan` → Placeholder component "Receipt Scanner - Coming Soon" (wrapped in FeatureErrorBoundary)

**And** The router uses `BrowserRouter` component
**And** The routes use React Router v6 syntax with `<Routes>` and `<Route>` components
**And** Each route element is wrapped in its own FeatureErrorBoundary
**And** Browser back button works correctly for navigation

### AC4: MUI BottomNavigation Implemented

**Given** The routes are configured
**When** I implement the bottom navigation
**Then** A `BottomNav` component exists in `src/components/shared/Layout/BottomNav.tsx` that:
- Uses MUI `BottomNavigation` and `BottomNavigationAction` components
- Has three navigation items:
  - Home/Inventory icon → navigates to `/`
  - Shopping List icon → navigates to `/shopping`
  - Receipt Scanner icon → navigates to `/scan`
- Highlights the active route based on current location
- Is fixed to the bottom of the screen on mobile
- Uses appropriate MUI icons (Home, ShoppingCart, Camera or similar)
- Integrates with React Router's `useNavigate` and `useLocation` hooks

**And** The BottomNav component is included in a main layout component
**And** The layout is applied to all routes
**And** Navigation can be tested by clicking between routes

### AC5: Error Isolation Verification

**Given** All features are wrapped in error boundaries
**When** An error occurs in one feature
**Then** The error only affects that specific feature:
- Error boundary displays error message for failed feature
- Other features remain accessible via navigation
- User can navigate away from the errored feature
- User can try again to reset the error state
- App does not crash or become unusable

**And** Error logging includes:
- Feature name that failed
- Error message and stack trace
- Component stack trace (from React)

### AC6: Layout and Structure

**Given** All components are implemented
**When** The app renders
**Then** The app has a proper layout structure:
- Main content area that adjusts for bottom navigation
- BottomNavigation fixed to bottom (z-index appropriate)
- Content doesn't overlap with bottom navigation
- Responsive design works on mobile and desktop
- MUI theme applied consistently

**And** Each route displays its content in the main content area
**And** The layout is clean and follows Material Design principles

---

## Technical Requirements

### FeatureErrorBoundary Implementation

**Component Structure (src/components/shared/ErrorBoundary/FeatureErrorBoundary.tsx):**

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box } from '@mui/material';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  featureName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches errors in React component tree.
 * Prevents entire app from crashing when a single feature fails.
 *
 * @example
 * <FeatureErrorBoundary featureName="Inventory">
 *   <InventoryList />
 * </FeatureErrorBoundary>
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with component stack trace
    logger.error(`Error in ${this.props.featureName} feature`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            }
          >
            Something went wrong in {this.props.featureName}.
            {this.state.error && (
              <Box sx={{ mt: 1, fontSize: '0.875rem', opacity: 0.8 }}>
                {this.state.error.message}
              </Box>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

### React Router v6 Configuration

**App.tsx Route Setup:**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from '@/theme/theme';
import { InventoryProvider } from '@/features/inventory/context/InventoryContext';
import { InventoryList } from '@/features/inventory/components/InventoryList';
import { FeatureErrorBoundary } from '@/components/shared/ErrorBoundary/FeatureErrorBoundary';
import { AppLayout } from '@/components/shared/Layout/AppLayout';

// Placeholder components for future features
const ShoppingListPlaceholder = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5">Shopping List</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Coming in Epic 3</Typography>
  </Box>
);

const ReceiptScannerPlaceholder = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5">Receipt Scanner</Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>Coming in Epic 5</Typography>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <InventoryProvider>
          <AppLayout>
            <Routes>
              {/* Home / Inventory Route */}
              <Route
                path="/"
                element={
                  <FeatureErrorBoundary featureName="Inventory">
                    <InventoryList />
                  </FeatureErrorBoundary>
                }
              />

              {/* Shopping List Route */}
              <Route
                path="/shopping"
                element={
                  <FeatureErrorBoundary featureName="Shopping List">
                    <ShoppingListPlaceholder />
                  </FeatureErrorBoundary>
                }
              />

              {/* Receipt Scanner Route */}
              <Route
                path="/scan"
                element={
                  <FeatureErrorBoundary featureName="Receipt Scanner">
                    <ReceiptScannerPlaceholder />
                  </FeatureErrorBoundary>
                }
              />
            </Routes>
          </AppLayout>
        </InventoryProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
```

### MUI BottomNavigation Implementation

**BottomNav Component (src/components/shared/Layout/BottomNav.tsx):**

```typescript
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home as HomeIcon, ShoppingCart as ShoppingCartIcon, CameraAlt as CameraIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * Bottom navigation bar for mobile-first navigation.
 * Fixed to bottom of screen with three main sections:
 * - Home (Inventory)
 * - Shopping List
 * - Receipt Scanner
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // Update active tab based on current route
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setValue(0);
        break;
      case '/shopping':
        setValue(1);
        break;
      case '/scan':
        setValue(2);
        break;
      default:
        setValue(0);
    }
  }, [location.pathname]);

  const handleNavigation = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/shopping');
        break;
      case 2:
        navigate('/scan');
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleNavigation}
        showLabels
      >
        <BottomNavigationAction
          label="Inventory"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="Shopping"
          icon={<ShoppingCartIcon />}
        />
        <BottomNavigationAction
          label="Scan"
          icon={<CameraIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}
```

### AppLayout Component

**Layout Component (src/components/shared/Layout/AppLayout.tsx):**

```typescript
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface Props {
  children: ReactNode;
}

/**
 * Main application layout with bottom navigation.
 * Provides consistent spacing and structure across all routes.
 */
export function AppLayout({ children }: Props) {
  return (
    <Box sx={{ pb: 7 }}> {/* Padding bottom to prevent overlap with BottomNav */}
      <Box component="main" sx={{ minHeight: 'calc(100vh - 56px)' }}>
        {children}
      </Box>
      <BottomNav />
    </Box>
  );
}
```

### Testing Strategy

**FeatureErrorBoundary Tests (src/components/shared/ErrorBoundary/FeatureErrorBoundary.test.tsx):**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureErrorBoundary } from './FeatureErrorBoundary';
import * as logger from '@/utils/logger';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('FeatureErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    // Suppress console.error in tests (React error boundary logs to console)
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when no error occurs', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={false} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should catch errors and display error message', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong in Test Feature/)).toBeInTheDocument();
  });

  it('should log errors with logger.error', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      'Error in Test Feature feature',
      expect.objectContaining({
        error: 'Test error'
      })
    );
  });

  it('should render Try Again button', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should reset error state when Try Again is clicked', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    // Error is displayed
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

    // Click Try Again
    await user.click(screen.getByRole('button', { name: /try again/i }));

    // Re-render with no error
    rerender(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={false} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});
```

**BottomNav Tests (src/components/shared/Layout/BottomNav.test.tsx):**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  const renderBottomNav = () => {
    return render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    );
  };

  it('should render three navigation items', () => {
    renderBottomNav();

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Scan')).toBeInTheDocument();
  });

  it('should highlight Inventory by default', () => {
    renderBottomNav();

    const inventoryButton = screen.getByRole('button', { name: /inventory/i });
    expect(inventoryButton).toHaveClass('Mui-selected');
  });

  it('should navigate to shopping when clicked', async () => {
    const user = userEvent.setup();
    renderBottomNav();

    await user.click(screen.getByRole('button', { name: /shopping/i }));

    // Check URL changed (in real router)
    expect(window.location.pathname).toBe('/shopping');
  });

  it('should navigate to scan when clicked', async () => {
    const user = userEvent.setup();
    renderBottomNav();

    await user.click(screen.getByRole('button', { name: /scan/i }));

    expect(window.location.pathname).toBe('/scan');
  });
});
```

---

## Architecture Requirements (From Architecture Document)

### Component Architecture (Lines 866-1006)

**Feature-Based Structure:**
```
src/
├── components/
│   └── shared/
│       ├── ErrorBoundary/
│       │   ├── FeatureErrorBoundary.tsx          # NEW
│       │   └── FeatureErrorBoundary.test.tsx     # NEW
│       └── Layout/
│           ├── AppLayout.tsx                     # NEW
│           ├── AppLayout.test.tsx                # NEW
│           ├── BottomNav.tsx                     # NEW
│           └── BottomNav.test.tsx                # NEW
```

### Error Boundary Strategy (Lines 936-1006)

**From Architecture Document:**

> **Decision:** Feature-level error boundaries for isolated failure handling
>
> **Rationale:**
> - Receipt OCR might fail without crashing entire app
> - Inventory remains accessible even if shopping list errors
> - Critical for trust-building (NFR5: Zero crashes in core workflows)
> - User can retry failed feature without app restart
> - Meets "graceful recovery" requirement (FR38)

### Routing Strategy (Lines 824-865)

**From Architecture Document:**

> **Decision:** React Router v6 for URL-based navigation
>
> **Route Structure:**
> - `/` → InventoryList
> - `/shopping` → ShoppingList
> - `/scan` → ReceiptScanner
> - `/product/:id` → ProductDetail (future)
>
> **Navigation:**
> - MUI BottomNavigation for mobile
> - Browser back button support
> - Deep linking (shareable URLs)

### Naming Conventions (Lines 1301-1383)

**MUST FOLLOW:**
- ✅ `FeatureErrorBoundary.tsx` (PascalCase for components)
- ✅ `BottomNav.tsx` (PascalCase for components)
- ✅ `AppLayout.tsx` (PascalCase for components)
- ✅ Co-located test files: `ComponentName.test.tsx`

### Import Patterns (Lines 1413-1463)

**All imports MUST use absolute @/ alias:**

```typescript
// ✅ CORRECT:
import { logger } from '@/utils/logger';
import { InventoryList } from '@/features/inventory/components/InventoryList';
import { theme } from '@/theme/theme';

// ❌ WRONG:
import { logger } from '../../../utils/logger';
import { InventoryList } from './features/inventory/components/InventoryList';
```

---

## Previous Story Intelligence

### Learnings from Story 1.8 (Error Handling and Logging)

**Successful Patterns:**

1. **Utility Integration:**
   - Story 1.8 created `handleError()` and `logger` utilities
   - These utilities are now available for error boundary logging
   - Use `logger.error()` in `componentDidCatch()` for consistent logging

2. **Testing Approach:**
   - Vitest + React Testing Library established
   - Mock utilities with `vi.spyOn()` and `vi.mock()`
   - Test all user interactions (button clicks, navigation)
   - Test error scenarios comprehensively

3. **TypeScript Patterns:**
   - Strict type checking on all props and state
   - Interface definitions for Props and State
   - Proper typing for event handlers

4. **Code Quality:**
   - JSDoc comments on all components
   - Comprehensive test coverage (≥85%)
   - ESLint passing with 0 errors
   - No breaking changes to existing code

### Git Intelligence from Recent Commits

**Commit 622a881 (Story 1.8) Analysis:**

**Files Modified:**
- Created 6 new files (types, utils, tests)
- Modified 4 existing files (services, tests, status)
- Total: 1590 lines added, 49 lines deleted

**Testing Pattern:**
- 14 tests for errorHandler
- 5 tests for logger
- 148 total tests passing
- 100% pass rate maintained

**Commit Message Pattern:**
```
Story X.Y: Brief description (#PR)

Detailed explanation

Core Changes:
- Bullet points of main changes

Test Coverage:
- Test statistics

Technical Details:
- Implementation notes

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Code Conventions Established

**From Previous Stories:**

1. **Component Structure:**
   - Props interface defined above component
   - State interface for class components
   - JSDoc comment explaining purpose
   - Export at end of file

2. **Test Structure:**
   - `describe` blocks for component/function
   - `beforeEach` for setup (mocks, spies)
   - `afterEach` for cleanup
   - `it` blocks for specific behaviors
   - User interaction tests with `userEvent`

3. **File Organization:**
   - Components in `src/components/shared/`
   - Tests co-located: `Component.test.tsx`
   - Absolute imports with @/ alias
   - MUI components imported from `@mui/material`

---

## Implementation Steps

### Step 1: Install React Router v6 (if not installed)

```bash
# Check if installed
npm list react-router-dom

# If not installed or wrong version:
npm install react-router-dom@^6.0.0
npm install -D @types/react-router-dom
```

### Step 2: Create FeatureErrorBoundary Component

**Create:** `src/components/shared/ErrorBoundary/FeatureErrorBoundary.tsx`

1. Import React, MUI components, logger utility
2. Define Props and State interfaces
3. Implement class component with:
   - `getDerivedStateFromError()` static method
   - `componentDidCatch()` lifecycle method
   - `handleReset()` method for "Try Again" button
   - `render()` method with error UI
4. Add comprehensive JSDoc comments
5. Use absolute imports (@/ alias)

**Create:** `src/components/shared/ErrorBoundary/FeatureErrorBoundary.test.tsx`

1. Test normal rendering (no error)
2. Test error catching and display
3. Test error logging with logger
4. Test "Try Again" button functionality
5. Test error message includes featureName
6. Mock logger.error and console.error
7. Aim for 100% coverage

### Step 3: Create Layout Components

**Create:** `src/components/shared/Layout/BottomNav.tsx`

1. Import MUI components, React Router hooks, MUI icons
2. Implement BottomNav component:
   - Use `useNavigate()` and `useLocation()` hooks
   - Track active tab with state
   - Update active tab based on location
   - Handle navigation on tab change
   - Render three BottomNavigationAction items
3. Add JSDoc comments
4. Use absolute imports

**Create:** `src/components/shared/Layout/BottomNav.test.tsx`

1. Test all three navigation items render
2. Test default active state (Inventory)
3. Test navigation clicks
4. Test active state updates
5. Wrap in BrowserRouter for tests

**Create:** `src/components/shared/Layout/AppLayout.tsx`

1. Import Box, ReactNode, BottomNav
2. Create layout with:
   - Main content area with padding bottom
   - BottomNav fixed to bottom
3. Add JSDoc comments
4. Simple component - minimal testing needed

**Create:** `src/components/shared/Layout/AppLayout.test.tsx`

1. Test children render correctly
2. Test BottomNav is present
3. Test layout structure (Box elements)

### Step 4: Create Placeholder Components

**Create:** `src/components/shared/Placeholder.tsx`

```typescript
import { Box, Typography } from '@mui/material';

interface Props {
  title: string;
  subtitle: string;
}

export function Placeholder({ title, subtitle }: Props) {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>{subtitle}</Typography>
    </Box>
  );
}
```

### Step 5: Update App.tsx with Router

**Update:** `src/App.tsx`

1. Import BrowserRouter, Routes, Route from react-router-dom
2. Import FeatureErrorBoundary, AppLayout
3. Import InventoryList
4. Import or create placeholder components
5. Wrap app with:
   - ThemeProvider (existing)
   - BrowserRouter (new)
   - InventoryProvider (existing)
   - AppLayout (new)
6. Define Routes:
   - `/` → InventoryList (wrapped in error boundary)
   - `/shopping` → Placeholder (wrapped in error boundary)
   - `/scan` → Placeholder (wrapped in error boundary)
7. Each route wrapped in FeatureErrorBoundary with appropriate featureName

**Update:** `src/App.test.tsx`

1. Update existing tests to work with router
2. Add test for route rendering
3. Add test for navigation between routes
4. Mock router if needed

### Step 6: Update InventoryList for Layout

**Update:** `src/features/inventory/components/InventoryList.tsx` (if needed)

1. Remove any existing fixed positioning that conflicts with BottomNav
2. Ensure content doesn't overlap with bottom navigation
3. Test scrolling works correctly

### Step 7: Run All Tests

```bash
# Run unit tests
npm run test

# Expected: All tests passing
# New tests: ~10-15 tests for error boundary and navigation
# All existing tests: Still passing (no regressions)

# Check coverage
npm run test:coverage

# Expected: ≥85% coverage for new components
```

### Step 8: Manual Testing

```bash
# Start dev server
npm run dev

# Test navigation:
1. Click Inventory tab → should navigate to /
2. Click Shopping tab → should navigate to /shopping and show placeholder
3. Click Scan tab → should navigate to /scan and show placeholder
4. Test browser back button → should navigate backwards
5. Refresh page on each route → should maintain route
6. Check BottomNav highlighting on each route

# Test error boundary:
1. Manually throw error in InventoryList component (add: if (true) throw new Error('Test'))
2. Verify error boundary catches it
3. Verify "Try Again" button appears
4. Verify other tabs still work
5. Remove test error
```

### Step 9: Build and Lint

```bash
# TypeScript compilation
npm run build
# Should build successfully

# Lint check
npm run lint
# Should pass with 0 errors
```

---

## Non-Functional Requirements

### Reliability (NFR5: Zero Crashes)

**CRITICAL:** This story directly implements NFR5
- Error boundaries prevent app crashes
- Isolated failure handling per feature
- User can continue using other features when one fails
- Graceful error recovery with "Try Again"

**Testing:**
- Simulate errors in each feature
- Verify app doesn't crash
- Verify error logging works
- Verify navigation remains functional

### Performance (NFR1: <2s Response Time)

- Navigation must feel instant (<200ms)
- BottomNav must render without lag
- Route transitions must be smooth
- Error boundary rendering must be fast

### Usability (NFR7: No Tutorial Needed)

- Bottom navigation must be intuitive
- Icons must be recognizable
- Active state must be clear
- Error messages must be user-friendly
- "Try Again" action must be obvious

### Accessibility (NFR8: Clear Feedback)

- Touch targets minimum 44x44px (BottomNavigationAction default)
- Clear visual feedback for active tab
- Error messages must be readable
- Contrast ratios meet WCAG standards (MUI defaults)

---

## Definition of Done

This story is considered complete when:

- [x] **Code Complete:**
  - [x] `src/components/shared/ErrorBoundary/FeatureErrorBoundary.tsx` created
  - [x] `src/components/shared/Layout/BottomNav.tsx` created
  - [x] `src/components/shared/Layout/AppLayout.tsx` created
  - [x] `src/components/shared/Placeholder.tsx` created (optional, can inline) - Inlined in App.tsx
  - [x] `src/App.tsx` updated with React Router v6
  - [x] All TypeScript types defined properly
  - [x] All imports use absolute @/ paths
  - [x] React Router v6 installed and configured

- [x] **Testing Complete:**
  - [x] `FeatureErrorBoundary.test.tsx` with ≥5 tests (5 tests created)
  - [x] `BottomNav.test.tsx` with ≥4 tests (4 tests created)
  - [x] `AppLayout.test.tsx` with ≥2 tests (3 tests created)
  - [x] `App.test.tsx` updated for routing
  - [x] All unit tests pass (163 tests passing)
  - [x] Test coverage ≥85% for new components
  - [x] No regressions in existing functionality

- [x] **Quality Checks:**
  - [x] TypeScript compilation succeeds
  - [x] ESLint passes with 0 errors, 0 warnings
  - [x] Manual testing confirms navigation works
  - [x] Manual testing confirms error boundaries work
  - [x] No console errors or warnings
  - [x] Browser back button works correctly

- [x] **Documentation:**
  - [x] JSDoc comments on all components
  - [x] Props interfaces documented
  - [x] Usage examples in comments
  - [x] Code is self-documenting

- [x] **Integration:**
  - [x] InventoryList works within router
  - [x] All routes accessible via navigation
  - [x] Error boundaries wrap all features
  - [x] Layout applies to all routes
  - [x] No breaking changes to existing features

- [x] **Acceptance Criteria Met:**
  - [x] AC1: FeatureErrorBoundary Component Created
  - [x] AC2: Inventory Feature Wrapped in Error Boundary
  - [x] AC3: React Router v6 Routes Configured
  - [x] AC4: MUI BottomNavigation Implemented
  - [x] AC5: Error Isolation Verification
  - [x] AC6: Layout and Structure

---

## Dev Notes

### Critical: Error Boundary as Class Component

**MUST USE CLASS COMPONENT:**

Error boundaries MUST be class components in React. Hooks cannot catch errors in child components. This is a React limitation, not a choice.

```typescript
// ✅ CORRECT: Class component
export class FeatureErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  // ...
}

// ❌ WRONG: Function component (won't work)
export function FeatureErrorBoundary() {
  // Cannot implement getDerivedStateFromError as a hook
}
```

### React Router v6 Syntax Changes

**v6 vs v5 Differences:**

```typescript
// ✅ CORRECT: React Router v6
<Routes>
  <Route path="/" element={<Component />} />
</Routes>

// ❌ WRONG: React Router v5 (old syntax)
<Switch>
  <Route path="/" component={Component} />
</Switch>
```

### Navigation Integration Pattern

**Use Hooks, Not HOCs:**

```typescript
// ✅ CORRECT: Use hooks
import { useNavigate, useLocation } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  // ...
}

// ❌ WRONG: withRouter HOC (deprecated in v6)
import { withRouter } from 'react-router-dom';
```

### Error Boundary Limitations

**What Error Boundaries DON'T Catch:**

1. Event handlers (use try/catch)
2. Asynchronous code (setTimeout, promises)
3. Server-side rendering
4. Errors thrown in the error boundary itself

**For async errors in context/services:**
- Use try/catch blocks
- Convert to AppError with handleError()
- Store in context state
- Display with MUI Alert (not error boundary)

### Layout Pattern

**Bottom Navigation Spacing:**

```typescript
// Main content needs bottom padding
<Box sx={{ pb: 7 }}> {/* 56px bottom nav height + spacing */}
  {children}
</Box>

// BottomNav must be fixed
<Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
  <BottomNavigation>...</BottomNavigation>
</Paper>
```

### Testing Error Boundaries

**Suppress React Error Logs in Tests:**

```typescript
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

React error boundaries log to console by design. Mock it to keep test output clean.

### Router Testing Pattern

**Wrap Components in BrowserRouter:**

```typescript
// Always wrap in router for tests
render(
  <BrowserRouter>
    <ComponentThatUsesRouter />
  </BrowserRouter>
);
```

### MUI Icons

**Install if not already:**

```bash
npm install @mui/icons-material
```

**Common Icons:**
- `Home` → Inventory
- `ShoppingCart` → Shopping List
- `CameraAlt` or `Camera` → Receipt Scanner

---

## Architecture Compliance Checklist

- [ ] **Naming Conventions:**
  - [ ] PascalCase for components
  - [ ] camelCase for functions and variables
  - [ ] Co-located test files

- [ ] **Import Patterns:**
  - [ ] All imports use @/ alias
  - [ ] No relative imports (../../)

- [ ] **Component Structure:**
  - [ ] Props interface defined
  - [ ] State interface for class components
  - [ ] JSDoc comments
  - [ ] TypeScript strict mode compliance

- [ ] **Testing:**
  - [ ] Vitest + React Testing Library
  - [ ] Tests co-located with components
  - [ ] Mock external dependencies
  - [ ] Test user interactions

- [ ] **Error Handling:**
  - [ ] Use logger.error() for logging
  - [ ] Error boundaries for React errors
  - [ ] Try/catch for async operations
  - [ ] User-friendly error messages

- [ ] **Layout:**
  - [ ] MUI components used
  - [ ] Responsive design (mobile-first)
  - [ ] Proper spacing and z-index
  - [ ] Accessibility considerations

---

## Related Documents

- **Epic:** `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.9, lines 678-708)
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md`
  - Routing Strategy: Lines 824-865
  - Error Boundary Strategy: Lines 936-1006
  - Component Architecture: Lines 866-935
  - Project Structure: Lines 2053-2211
- **Previous Story:** `_bmad-output/implementation-artifacts/1-8-set-up-error-handling-and-logging-utilities.md`
  - logger utility usage
  - Testing patterns
  - Code quality standards

---

## Critical Success Factors

**Three Keys to Success:**

1. **Error Isolation Works** - Features fail independently without crashing app
2. **Navigation is Intuitive** - Bottom nav works like native mobile apps
3. **Integration is Seamless** - Existing inventory feature works within new structure

**Gotchas to Avoid:**

- Don't forget: Error boundaries MUST be class components
- Don't use React Router v5 syntax (use v6 Routes/Route)
- Don't forget to wrap every route in error boundary
- Don't forget bottom padding on content (prevents overlap with BottomNav)
- Don't forget to test browser back button
- Don't forget to mock console.error in error boundary tests
- Remember: Each feature gets its own error boundary instance
- Remember: useNavigate and useLocation replace old withRouter HOC

**This story is foundational** - All future features depend on routing and error handling working correctly. Quality here prevents navigation bugs and crash loops later.

---

## Story Metadata

- **Created By:** bmm:create-story workflow (ultimate context engine)
- **Date:** 2026-01-19
- **Workflow Version:** 4-implementation/create-story
- **Agent:** Claude Opus 4.5 via AWS Bedrock
- **Branch:** feat/story-1-9-implement-feature-error-boundaries-and-navigation
- **Context Engine:** Ultimate BMad Method story creation with comprehensive developer guidance

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (AWS Bedrock) - arn:aws:bedrock:eu-west-1:775910509766:application-inference-profile/hlc9ps7vuywr

### Debug Log References

No debug issues encountered. Implementation followed red-green-refactor cycle successfully:
- RED: Tests written first, failing initially
- GREEN: Components implemented to pass tests
- REFACTOR: Code reviewed and optimized

### Completion Notes List

**Implementation Summary:**
- ✅ Created FeatureErrorBoundary class component with error catching and logging
- ✅ Created BottomNav component with MUI BottomNavigation and React Router integration
- ✅ Created AppLayout component for consistent page structure
- ✅ Created MUI theme configuration (src/theme/theme.ts)
- ✅ Updated App.tsx with React Router v6, ThemeProvider, and error boundaries
- ✅ Added placeholder components for Shopping List and Receipt Scanner routes
- ✅ Comprehensive test coverage: 5 tests (FeatureErrorBoundary), 4 tests (BottomNav), 3 tests (AppLayout), 4 tests (App.tsx)
- ✅ All 163 tests passing with zero regressions
- ✅ TypeScript compilation successful
- ✅ ESLint passing with 0 errors, 0 warnings
- ✅ Build successful (PWA configured)

**Technical Decisions Made:**
1. Error boundary implemented as class component (React requirement)
2. Placeholder components inlined in App.tsx rather than separate file
3. MUI theme file created at src/theme/theme.ts for consistent design tokens
4. Used React Router v7 (v6-compatible) with Routes/Route syntax
5. Error boundary wraps each route individually for feature isolation
6. Bottom navigation fixed to bottom with proper z-index and spacing
7. AppLayout provides consistent pb: 7 padding to prevent content overlap

**Challenges Resolved:**
- Fixed logger import in tests (changed from * as logger to { logger })
- Fixed error boundary reset test (removed unused rerender variable)
- Fixed App.test.tsx assertions (changed to getByRole('heading') to avoid multiple "Inventory" matches)
- Created missing theme file for MUI ThemeProvider

### File List

**New Files Created:**
- src/components/shared/ErrorBoundary/FeatureErrorBoundary.tsx
- src/components/shared/ErrorBoundary/FeatureErrorBoundary.test.tsx
- src/components/shared/Layout/BottomNav.tsx
- src/components/shared/Layout/BottomNav.test.tsx
- src/components/shared/Layout/AppLayout.tsx
- src/components/shared/Layout/AppLayout.test.tsx
- src/theme/theme.ts

**Modified Files:**
- src/App.tsx - Added router configuration, error boundaries, layout, and placeholders
- src/App.test.tsx - Updated with navigation and error boundary tests
- _bmad-output/implementation-artifacts/sprint-status.yaml - Updated story status to in-progress → review
- _bmad-output/implementation-artifacts/1-9-implement-feature-error-boundaries-and-navigation.md - Marked completion
