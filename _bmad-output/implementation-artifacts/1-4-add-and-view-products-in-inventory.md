# Story 1.4: Add and View Products in Inventory

**Status:** ready-for-dev
**Epic:** Epic 1 - Project Foundation & Initial Inventory Setup
**Story ID:** 1.4
**Created:** 2026-01-11
**Priority:** P0 (Critical - Foundation)

---

## User Story

**As a** user,
**I want to** add products to my inventory and see them displayed in a list,
**So that** I can start tracking what products I have at home.

---

## Acceptance Criteria

### AC1: Inventory List Screen at Route `/`
**Given** I open the application
**When** I navigate to the root route `/`
**Then** I see an inventory list screen with:
- A "Add Product" button at the top of the screen
- An empty state message "No products yet. Add your first product!" when no products exist
- A list of all my products when products exist

### AC2: Add Product Dialog
**Given** I'm on the inventory list screen
**When** I click the "Add Product" button
**Then** A MUI `Dialog` opens with:
- Form title "Add Product"
- A `TextField` for product name with label "Product Name"
- "Cancel" button to close without saving
- "Add" button to save the new product
**And** The dialog has proper focus management (TextField focused on open)

### AC3: Adding a Product
**Given** The Add Product dialog is open
**When** I enter a product name (e.g., "Milk") and click "Add"
**Then** The dialog closes
**And** The product appears immediately at the top of the list (FR1, FR40)
**And** The product shows with a default stock level of "High"
**And** A success feedback appears (Snackbar: "Product added successfully")
**And** The operation completes within 2 seconds (NFR1)

### AC4: Product Card Display
**Given** I have products in my inventory
**When** I view the inventory list
**Then** Each product is displayed as a MUI `Card` or `ListItem` with:
- Product name prominently displayed
- Current stock level indicator (MUI `Chip` showing "High" in green)
- Responsive layout (mobile and desktop)
- Clear visual separation between products

### AC5: Data Persistence
**Given** I have added products to my inventory
**When** I close and reopen the app
**Then** All products I added are still visible (FR36)
**And** No data is lost (FR39)
**And** Products are ordered newest first

---

## Technical Requirements

### Component Architecture

This story introduces the **first UI components** that consume the InventoryContext from Story 1.3.

**New Components to Create:**

1. **`InventoryList.tsx`** - Main inventory screen (route `/`)
   - Location: `src/features/inventory/components/InventoryList.tsx`
   - Consumes `useInventory()` hook
   - Displays products using ProductCard components
   - Shows empty state when no products
   - Contains "Add Product" button
   - Manages loading and error states

2. **`ProductCard.tsx`** - Individual product display
   - Location: `src/features/inventory/components/ProductCard.tsx`
   - Receives product as prop
   - Displays product name and stock level
   - Uses MUI `Card`, `CardContent`, `Typography`, `Chip`
   - Responsive design (mobile + desktop)

3. **`AddProductDialog.tsx`** - Modal for adding products
   - Location: `src/features/inventory/components/AddProductDialog.tsx`
   - Controlled by open/close state in parent
   - Uses MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
   - Contains `TextField` for product name
   - Validates input (non-empty)
   - Calls `addProduct()` from context

4. **`EmptyState.tsx`** - Empty inventory message
   - Location: `src/components/shared/EmptyState.tsx`
   - Reusable component for empty states
   - Accepts message and icon props
   - Uses MUI `Box`, `Typography`, `SvgIcon`

### Integration with App Routing

**Update `App.tsx`:**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from '@/features/inventory/context/InventoryContext';
import { InventoryList } from '@/features/inventory/components/InventoryList';
import { BottomNav } from '@/components/shared/Layout/BottomNav';

function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <Routes>
          <Route path="/" element={<InventoryList />} />
          {/* Placeholder routes from Story 1.9 */}
          <Route path="/shopping" element={<div>Shopping List (Coming Soon)</div>} />
          <Route path="/scan" element={<div>Receipt Scanner (Coming Soon)</div>} />
        </Routes>
        <BottomNav />
      </InventoryProvider>
    </BrowserRouter>
  );
}
```

### TypeScript Interfaces

**Component Props:**
```typescript
// ProductCard.tsx
export interface ProductCardProps {
  product: Product;
}

// AddProductDialog.tsx
export interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
}

// EmptyState.tsx
export interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}
```

### MUI Component Usage

**Theme & Styling:**
- Use default MUI theme for MVP (Phase 2 will add custom styling)
- Stock level colors:
  - High: Green (#4caf50)
  - Medium: Yellow/Orange (#ff9800)
  - Low: Orange/Red (#ff5722)
  - Empty: Red (#f44336)

**Key MUI Components:**
- `Card`, `CardContent` - Product cards
- `Chip` - Stock level indicators
- `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` - Add product modal
- `TextField` - Product name input
- `Button` - Actions (Add, Cancel)
- `Typography` - Text elements
- `Box` - Layout containers
- `Snackbar`, `Alert` - Success/error feedback

### Error Handling

**Context-Level Errors:**
- InventoryContext stores errors in `state.error`
- Display errors using MUI `Alert` at top of InventoryList
- Use `handleError()` utility (Story 1.8)

**Component-Level Feedback:**
- Success: Show `Snackbar` with "Product added successfully"
- Error: Show `Snackbar` with error message from context
- Loading: Disable buttons and show `CircularProgress`

### State Management

**Local Component State:**
```typescript
// InventoryList.tsx
const [dialogOpen, setDialogOpen] = useState(false);
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

// AddProductDialog.tsx
const [productName, setProductName] = useState('');
const [submitting, setSubmitting] = useState(false);
```

**Context State (from Story 1.3):**
```typescript
const { state, loadProducts, addProduct } = useInventory();
// state.products - array of products
// state.loading - loading indicator
// state.error - error message
```

---

## Architecture Requirements (From Architecture Document)

### Feature-Based Folder Structure (CRITICAL)

```
src/
├── features/
│   └── inventory/
│       ├── components/
│       │   ├── InventoryList.tsx          # NEW - Main screen
│       │   ├── ProductCard.tsx            # NEW - Product display
│       │   └── AddProductDialog.tsx       # NEW - Add product modal
│       ├── context/
│       │   ├── InventoryContext.tsx       # EXISTS (Story 1.3)
│       │   └── InventoryContext.test.tsx  # EXISTS (Story 1.3)
│       └── hooks/                         # Future stories
├── components/
│   └── shared/
│       ├── EmptyState.tsx                 # NEW - Reusable empty state
│       └── Layout/
│           └── BottomNav.tsx              # EXISTS (Story 1.9)
├── services/
│   ├── database.ts                        # EXISTS (Story 1.2)
│   └── inventory.ts                       # EXISTS (Story 1.2)
└── types/
    └── product.ts                         # EXISTS (Story 1.2)
```

**Key Principles:**
1. **Feature-Based Organization**: All inventory components in `features/inventory/components/`
2. **Shared Components**: Reusable components (EmptyState) in `components/shared/`
3. **Co-Located Tests**: Test files next to source files (e.g., `InventoryList.test.tsx`)
4. **Absolute Imports**: Use `@/` alias for all imports

### Component Design Patterns

**Container-Presenter Pattern:**
- `InventoryList` - Container (uses context, manages state)
- `ProductCard` - Presenter (receives props, displays data)
- `AddProductDialog` - Controlled component (parent manages open state)

**Error Boundaries:**
- Wrap InventoryList in `FeatureErrorBoundary` from Story 1.9
- Errors don't crash entire app, only affect inventory feature

**Loading States:**
- Show `CircularProgress` while loading products
- Disable buttons during async operations
- Clear loading state in finally blocks

### Naming Conventions

**Components:**
- PascalCase: `InventoryList`, `ProductCard`, `AddProductDialog`
- File naming: `ComponentName.tsx`, `ComponentName.test.tsx`

**Props Interfaces:**
- PascalCase with `Props` suffix: `ProductCardProps`, `AddProductDialogProps`

**State Variables:**
- camelCase: `dialogOpen`, `productName`, `submitting`

**Context Hooks:**
- camelCase with `use` prefix: `useInventory()`

### Immutability & React Patterns

**State Updates (Local):**
```typescript
// ✅ CORRECT
setDialogOpen(true)
setProductName(e.target.value)

// ❌ WRONG - Don't mutate state
dialogOpen = true
```

**Props Are Read-Only:**
```typescript
// ✅ CORRECT - Display prop
<Typography>{product.name}</Typography>

// ❌ WRONG - Don't mutate props
product.name = "New Name"
```

**Context Updates:**
```typescript
// ✅ CORRECT - Call context methods
await addProduct(productName)

// ❌ WRONG - Don't dispatch directly (context encapsulates it)
dispatch({ type: 'ADD_PRODUCT', payload: product })
```

---

## Previous Story Intelligence

### Learnings from Story 1.3 (Inventory Context)

**Recent Git Commits:**
1. `1b4f121` - Story 1.3: Create Inventory Context and State Management (#2)
2. `52ebba1` - Story 1.2: Database Schema and Service Layer (#1)

**Key Patterns from Story 1.3:**

1. **Context Integration Pattern Established:**
   - `useInventory()` hook provides: `state`, `loadProducts`, `addProduct`, etc.
   - Context handles all service layer calls
   - Error handling: try/catch with re-throw pattern
   - Loading states managed by context

2. **State Shape:**
   ```typescript
   state: {
     products: Product[],
     loading: boolean,
     error: string | null
   }
   ```

3. **Adding Products:**
   ```typescript
   await addProduct(name: string)
   // Returns: void
   // Throws: Error if fails (can catch in component)
   // Updates: state.products with new product at beginning of array
   ```

4. **Product Structure (from Story 1.2):**
   ```typescript
   interface Product {
     id: string;              // UUID
     name: string;
     stockLevel: StockLevel;  // 'high' | 'medium' | 'low' | 'empty'
     createdAt: Date;
     updatedAt: Date;
     isOnShoppingList: boolean;
   }
   ```

5. **Test Structure:**
   - Vitest + React Testing Library
   - `render()` for components, `renderHook()` for hooks
   - `screen.getByRole()`, `screen.getByText()` queries
   - `fireEvent` or `userEvent` for interactions
   - `waitFor()` for async state updates

6. **ESLint Configuration:**
   - No `react-refresh/only-export-components` rule violations
   - Export components as named exports

**Apply These Patterns:**
- Use `useInventory()` hook to access context
- Handle `state.loading` to show loading indicators
- Handle `state.error` to display error messages
- Call `loadProducts()` on component mount (useEffect)
- Call `addProduct(name)` when form submitted
- Catch errors from context methods for user feedback

**Build On Story 1.3:**
- InventoryList will be first consumer of useInventory()
- Context provides all state management
- Components focus on UI/UX only
- No direct service or database calls from components

### Technical Stack (from Story 1.1)

**Installed Dependencies:**
- React 19.x
- TypeScript 5.x
- MUI v7 (@mui/material, @emotion/react, @emotion/styled, @mui/icons-material)
- React Router v6
- Vitest (unit tests)
- Playwright (E2E tests)

**Configuration:**
- Absolute imports with `@/` alias
- ESLint + Prettier configured
- TypeScript strict mode enabled
- Vite for build tooling

---

## Implementation Steps

### Step 1: Create EmptyState Component (Shared)

**Create:** `src/components/shared/EmptyState.tsx`

```typescript
import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      {icon && (
        <Box sx={{ mb: 2, opacity: 0.5 }}>
          {icon}
        </Box>
      )}
      <Typography variant="body1" color="text.secondary" align="center">
        {message}
      </Typography>
    </Box>
  );
}
```

**Test:** `src/components/shared/EmptyState.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('should render message', () => {
    render(<EmptyState message="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<EmptyState message="Empty" icon={<div data-testid="icon">📦</div>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
```

### Step 2: Create ProductCard Component

**Create:** `src/features/inventory/components/ProductCard.tsx`

```typescript
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import type { Product } from '@/types/product';

export interface ProductCardProps {
  product: Product;
}

const stockLevelConfig = {
  high: { label: 'High', color: '#4caf50' as const },
  medium: { label: 'Medium', color: '#ff9800' as const },
  low: { label: 'Low', color: '#ff5722' as const },
  empty: { label: 'Empty', color: '#f44336' as const },
};

export function ProductCard({ product }: ProductCardProps) {
  const stockConfig = stockLevelConfig[product.stockLevel];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            {product.name}
          </Typography>
          <Chip
            label={stockConfig.label}
            sx={{
              backgroundColor: stockConfig.color,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
```

**Test:** `src/features/inventory/components/ProductCard.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types/product';

const mockProduct: Product = {
  id: '1',
  name: 'Milk',
  stockLevel: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOnShoppingList: false,
};

describe('ProductCard', () => {
  it('should render product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('should render stock level chip', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should show correct color for high stock', () => {
    render(<ProductCard product={mockProduct} />);
    const chip = screen.getByText('High');
    expect(chip).toHaveStyle({ backgroundColor: '#4caf50' });
  });
});
```

### Step 3: Create AddProductDialog Component

**Create:** `src/features/inventory/components/AddProductDialog.tsx`

```typescript
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

export interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
}

export function AddProductDialog({ open, onClose, onAdd }: AddProductDialogProps) {
  const [productName, setProductName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setSubmitting(true);
    try {
      await onAdd(productName.trim());
      setProductName('');
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setProductName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={submitting}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !productName.trim()}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

**Test:** `src/features/inventory/components/AddProductDialog.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddProductDialog } from './AddProductDialog';

describe('AddProductDialog', () => {
  it('should render when open', () => {
    render(<AddProductDialog open={true} onClose={vi.fn()} onAdd={vi.fn()} />);
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<AddProductDialog open={false} onClose={vi.fn()} onAdd={vi.fn()} />);
    expect(screen.queryByText('Add Product')).not.toBeInTheDocument();
  });

  it('should call onAdd when form submitted', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<AddProductDialog open={true} onClose={onClose} onAdd={onAdd} />);

    const input = screen.getByLabelText('Product Name');
    fireEvent.change(input, { target: { value: 'Milk' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith('Milk');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should not submit empty product name', () => {
    const onAdd = vi.fn();
    render(<AddProductDialog open={true} onClose={vi.fn()} onAdd={onAdd} />);

    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
```

### Step 4: Create InventoryList Component

**Create:** `src/features/inventory/components/InventoryList.tsx`

```typescript
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useInventory } from '@/features/inventory/context/InventoryContext';
import { ProductCard } from './ProductCard';
import { AddProductDialog } from './AddProductDialog';
import { EmptyState } from '@/components/shared/EmptyState';

export function InventoryList() {
  const { state, loadProducts, addProduct } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (name: string) => {
    try {
      await addProduct(name);
      setSnackbar({
        open: true,
        message: 'Product added successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to add product',
        severity: 'error',
      });
      throw error; // Re-throw to prevent dialog close
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Inventory
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Product
        </Button>
      </Box>

      {/* Error Alert */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {/* Loading State */}
      {state.loading && state.products.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!state.loading && state.products.length === 0 && (
        <EmptyState message="No products yet. Add your first product!" />
      )}

      {/* Product List */}
      {state.products.length > 0 && (
        <Box>
          {state.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Box>
      )}

      {/* Add Product Dialog */}
      <AddProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddProduct}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
```

**Test:** `src/features/inventory/components/InventoryList.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventoryProvider } from '@/features/inventory/context/InventoryContext';
import { inventoryService } from '@/services/inventory';
import { InventoryList } from './InventoryList';
import type { Product } from '@/types/product';

// Mock the inventory service
vi.mock('@/services/inventory', () => ({
  inventoryService: {
    getProducts: vi.fn(),
    addProduct: vi.fn(),
  },
}));

const mockProduct: Product = {
  id: '1',
  name: 'Milk',
  stockLevel: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOnShoppingList: false,
};

describe('InventoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no products', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No products yet. Add your first product!')).toBeInTheDocument();
    });
  });

  it('should render products when available', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  it('should open add product dialog when button clicked', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Product'));

    expect(screen.getByText('Product Name')).toBeInTheDocument();
  });

  it('should add product successfully', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);
    vi.mocked(inventoryService.addProduct).mockResolvedValue(mockProduct);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Product'));
    });

    const input = screen.getByLabelText('Product Name');
    fireEvent.change(input, { target: { value: 'Milk' } });
    fireEvent.click(screen.getAllByText('Add')[1]); // Second "Add" is in dialog

    await waitFor(() => {
      expect(screen.getByText('Product added successfully')).toBeInTheDocument();
    });
  });
});
```

### Step 5: Update App.tsx Routing

**Update:** `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from '@/features/inventory/context/InventoryContext';
import { InventoryList } from '@/features/inventory/components/InventoryList';
import { BottomNav } from '@/components/shared/Layout/BottomNav';

function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <Routes>
          <Route path="/" element={<InventoryList />} />
          <Route path="/shopping" element={<div>Shopping List (Coming Soon)</div>} />
          <Route path="/scan" element={<div>Receipt Scanner (Coming Soon)</div>} />
        </Routes>
        <BottomNav />
      </InventoryProvider>
    </BrowserRouter>
  );
}

export default App;
```

### Step 6: Run Tests

```bash
# Run all tests
npm run test

# Expected: All new tests passing + existing tests
# New tests: ~15 tests (EmptyState: 2, ProductCard: 3, AddProductDialog: 4, InventoryList: 6)

# Check coverage
npm run test:coverage

# Expected: ≥85% coverage for new components
```

### Step 7: Manual Testing

```bash
# Start dev server
npm run dev

# Open http://localhost:5173

# Test workflow:
1. See empty state message
2. Click "Add Product" button
3. Enter "Milk" in dialog
4. Click "Add" button
5. See "Milk" appear in list with "High" stock
6. See success snackbar
7. Close and reopen browser
8. Verify "Milk" still in list (persistence)
```

### Step 8: Build and Lint

```bash
# Check TypeScript compilation
npm run build
# Should build successfully

# Run linter
npm run lint
# Should pass with 0 errors
```

---

## Non-Functional Requirements

### Performance (NFR1)
- Product list renders within <100ms for 50 products
- Add product completes within 2 seconds
- Smooth animations (fade-in for new products)
- No unnecessary re-renders (React.memo if needed in future)

### Usability (NFR7, NFR7.1)
- Single-tap "Add Product" button (prominent placement)
- Clear visual feedback (Snackbar for success/error)
- Intuitive empty state guides user action
- Dialog auto-focuses product name field

### Accessibility (NFR8, NFR8.1, NFR8.2)
- Sufficient color contrast for stock level chips
- Button touch targets ≥44x44px on mobile
- Keyboard navigation works (Tab, Enter, Esc)
- Screen reader friendly (proper ARIA labels)

### Local-First (NFR9)
- All features work offline
- Data persists via IndexedDB (from Story 1.2)
- No network required for add/view operations

---

## Definition of Done

This story is considered complete when:

- [x] **Code Complete:**
  - [ ] `EmptyState.tsx` created and tested
  - [ ] `ProductCard.tsx` created and tested
  - [ ] `AddProductDialog.tsx` created and tested
  - [ ] `InventoryList.tsx` created and tested
  - [ ] `App.tsx` updated with routing
  - [ ] All TypeScript interfaces defined

- [ ] **Testing Complete:**
  - [ ] All unit tests pass (~15 new tests)
  - [ ] Test coverage ≥85% for new components
  - [ ] Integration test with InventoryContext passes
  - [ ] Manual testing workflow verified

- [ ] **Quality Checks:**
  - [ ] TypeScript compilation succeeds
  - [ ] ESLint passes with 0 errors
  - [ ] No console errors or warnings
  - [ ] Responsive design works (mobile + desktop)

- [ ] **User Experience:**
  - [ ] Empty state displays correctly
  - [ ] Add product workflow feels smooth
  - [ ] Success feedback appears on add
  - [ ] Products persist across browser restarts
  - [ ] Loading states handled gracefully

- [ ] **Acceptance Criteria Met:**
  - [ ] AC1: Inventory List Screen at Route `/`
  - [ ] AC2: Add Product Dialog
  - [ ] AC3: Adding a Product
  - [ ] AC4: Product Card Display
  - [ ] AC5: Data Persistence

---

## Next Steps (After This Story)

Once Story 1.4 is complete, the next story will be:

**Story 1.5: Edit Product Names**
- Add edit functionality to ProductCard
- Reuse AddProductDialog pattern for editing
- Update context with edit capability

---

## Related Documents

- **Epic:** `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.4, lines 528-559)
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md`
- **PRD:** `_bmad-output/planning-artifacts/prd.md`
- **UX Design:** `_bmad-output/planning-artifacts/ux-design-specification.md`
- **Previous Stories:**
  - `_bmad-output/implementation-artifacts/1-1-initialize-project-with-technical-stack.md`
  - `_bmad-output/implementation-artifacts/1-2-set-up-database-schema-and-service-layer.md`
  - `_bmad-output/implementation-artifacts/1-3-create-inventory-context-and-state-management.md`

---

## Story Metadata

- **Created By:** bmm:create-story workflow (improved with branch creation)
- **Date:** 2026-01-11
- **Workflow Version:** 4-implementation/create-story (v2 with branch automation)
- **Agent:** Claude Code (Sonnet 3.7)
- **Branch:** feat/story-1-4-add-and-view-products-in-inventory
- **Context Engine:** Ultimate BMad Method story creation with comprehensive analysis

---

## Dev Agent Record

### Agent Model Used

Claude Code (Sonnet 3.7) - Anthropic API

### Implementation Notes

This is the **first user-facing feature** that brings together:
- Database layer (Story 1.2)
- State management (Story 1.3)
- UI components (This story)

**Critical Success Factors:**
- Follow MUI component patterns consistently
- Maintain immutability in all state updates
- Handle loading/error states gracefully
- Ensure data persistence works correctly
- Test the complete user workflow end-to-end

**Testing Priority:**
- Integration between InventoryList and InventoryContext
- Add product workflow (dialog → context → database → UI update)
- Data persistence across browser restarts

### Completion Notes

_To be filled by dev agent during implementation_

### File List

**New Files:**
- `src/components/shared/EmptyState.tsx`
- `src/components/shared/EmptyState.test.tsx`
- `src/features/inventory/components/ProductCard.tsx`
- `src/features/inventory/components/ProductCard.test.tsx`
- `src/features/inventory/components/AddProductDialog.tsx`
- `src/features/inventory/components/AddProductDialog.test.tsx`
- `src/features/inventory/components/InventoryList.tsx`
- `src/features/inventory/components/InventoryList.test.tsx`

**Modified Files:**
- `src/App.tsx` (routing integration)

---

**Implementation Ready - Status: ready-for-dev** ✅

This story provides complete guidance for implementing the first user-facing inventory feature. All patterns are established from previous stories (1.2, 1.3), and comprehensive implementation steps ensure flawless execution.
