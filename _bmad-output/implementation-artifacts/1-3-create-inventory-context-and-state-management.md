# Story 1.3: Create Inventory Context and State Management

**Status:** review
**Epic:** Epic 1 - Project Foundation & Initial Inventory Setup
**Story ID:** 1.3
**Created:** 2026-01-08
**Priority:** P0 (Critical - Foundation)

---

## User Story

**As a** developer,
**I want to** create React Context with useReducer for inventory state management,
**So that** components can access and update inventory without prop drilling and the architecture supports future feature additions.

---

## Acceptance Criteria

### AC1: InventoryContext Created
**Given** The InventoryService exists from Story 1.2
**When** I create the context
**Then** An `InventoryContext` is created in `src/features/inventory/context/InventoryContext.tsx` with:
- Context interface includes: `products`, `loading`, `error` state
- Actions: `LOAD_PRODUCTS`, `ADD_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`, `SEARCH_PRODUCTS`, `SET_LOADING`, `SET_ERROR`
- `InventoryProvider` component wraps children
- Custom hook `useInventory()` for consuming context
**And** Context uses TypeScript for type safety

### AC2: Reducer with Immutable Updates
**Given** The InventoryContext is created
**When** I implement the reducer
**Then** A reducer function handles all inventory actions
**And** All state updates are immutable (using spread operators, no mutations)
**And** Products array is replaced, not mutated
**And** Loading and error states are managed properly

### AC3: Integration with InventoryService
**Given** The reducer and context are implemented
**When** Actions are dispatched
**Then** The context calls `inventoryService` methods from Story 1.2
**And** Service responses update context state
**And** Errors from service are caught and stored in error state
**And** Loading states are set before/after async operations

### AC4: Custom useInventory Hook
**Given** The context and provider are complete
**When** I create the custom hook
**Then** `useInventory()` hook returns context value
**And** Hook throws error if used outside InventoryProvider
**And** Hook provides type-safe access to state and dispatch

### AC5: Unit Tests for Reducer
**Given** The reducer is implemented
**When** I write tests
**Then** Unit tests exist in `src/features/inventory/context/InventoryContext.test.tsx`
**And** Tests cover all reducer actions
**And** Tests verify immutability of state updates
**And** Tests verify error handling
**And** All tests pass with `npm run test`

### AC6: Integration Tests with Service
**Given** Context and service integration is complete
**When** I write integration tests
**Then** Tests verify context calls service methods correctly
**And** Tests verify state updates after service responses
**And** Tests verify error handling when service fails
**And** All integration tests pass

---

## Technical Requirements

### InventoryContext Interface (`src/features/inventory/context/InventoryContext.tsx`)

```typescript
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { inventoryService } from '@/services/inventory';
import type { Product } from '@/types/product';

// State interface
export interface InventoryState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Action types
export type InventoryAction =
  | { type: 'LOAD_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SEARCH_PRODUCTS'; payload: Product[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Context value interface
export interface InventoryContextValue {
  state: InventoryState;
  loadProducts: () => Promise<void>;
  addProduct: (name: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
}

// Create context
const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

// Initial state
const initialState: InventoryState = {
  products: [],
  loading: false,
  error: null,
};

// Reducer function
function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'LOAD_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [action.payload, ...state.products],
        loading: false,
        error: null,
      };

    case 'UPDATE_PRODUCT': {
      const { id, updates } = action.payload;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
        loading: false,
        error: null,
      };
    }

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
        loading: false,
        error: null,
      };

    case 'SEARCH_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}

// Provider props
interface InventoryProviderProps {
  children: ReactNode;
}

// Provider component
export function InventoryProvider({ children }: InventoryProviderProps) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Load all products
  const loadProducts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const products = await inventoryService.getProducts();
      dispatch({ type: 'LOAD_PRODUCTS', payload: products });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Add new product
  const addProduct = async (name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const product = await inventoryService.addProduct(name);
      dispatch({ type: 'ADD_PRODUCT', payload: product });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error; // Re-throw to allow component-level handling
    }
  };

  // Update existing product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await inventoryService.updateProduct(id, updates);
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await inventoryService.deleteProduct(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Search products
  const searchProducts = async (query: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const products = await inventoryService.searchProducts(query);
      dispatch({ type: 'SEARCH_PRODUCTS', payload: products });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search products';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const value: InventoryContextValue = {
    state,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

// Custom hook
export function useInventory(): InventoryContextValue {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
```

**Key Implementation Details:**
- **TypeScript interfaces**: `InventoryState`, `InventoryAction`, `InventoryContextValue`
- **Discriminated union**: `InventoryAction` uses `type` discriminator for type safety
- **Immutable updates**: All state updates use spread operators
- **Error handling**: Try/catch wraps all service calls
- **Loading states**: Set before async operations, cleared after
- **Re-throw errors**: Allows components to handle errors if needed
- **Custom hook**: `useInventory()` enforces provider usage
- **Singleton service**: Uses `inventoryService` from Story 1.2

### Unit Tests (`src/features/inventory/context/InventoryContext.test.tsx`)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { InventoryProvider, useInventory } from './InventoryContext';
import { inventoryService } from '@/services/inventory';
import type { Product } from '@/types/product';

// Mock the inventory service
vi.mock('@/services/inventory', () => ({
  inventoryService: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    searchProducts: vi.fn(),
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

describe('InventoryContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useInventory hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useInventory());
      }).toThrow('useInventory must be used within an InventoryProvider');
    });

    it('should return context value when used inside provider', () => {
      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.state).toBeDefined();
      expect(result.current.loadProducts).toBeInstanceOf(Function);
    });
  });

  describe('loadProducts', () => {
    it('should load products successfully', async () => {
      const mockProducts = [mockProduct];
      vi.mocked(inventoryService.getProducts).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
      });

      await waitFor(() => {
        expect(result.current.state.products).toEqual(mockProducts);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should set loading state during load', async () => {
      vi.mocked(inventoryService.getProducts).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      act(() => {
        result.current.loadProducts();
      });

      expect(result.current.state.loading).toBe(true);
    });

    it('should handle load errors', async () => {
      vi.mocked(inventoryService.getProducts).mockRejectedValue(
        new Error('Load failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
      });

      await waitFor(() => {
        expect(result.current.state.error).toBe('Load failed');
        expect(result.current.state.loading).toBe(false);
      });
    });
  });

  describe('addProduct', () => {
    it('should add product successfully', async () => {
      vi.mocked(inventoryService.addProduct).mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.addProduct('Milk');
      });

      await waitFor(() => {
        expect(result.current.state.products).toContainEqual(mockProduct);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should add product to beginning of array', async () => {
      const product1 = { ...mockProduct, id: '1', name: 'Product 1' };
      const product2 = { ...mockProduct, id: '2', name: 'Product 2' };

      vi.mocked(inventoryService.getProducts).mockResolvedValue([product1]);
      vi.mocked(inventoryService.addProduct).mockResolvedValue(product2);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
        await result.current.addProduct('Product 2');
      });

      await waitFor(() => {
        expect(result.current.state.products[0]).toEqual(product2);
        expect(result.current.state.products[1]).toEqual(product1);
      });
    });

    it('should handle add errors', async () => {
      vi.mocked(inventoryService.addProduct).mockRejectedValue(
        new Error('Add failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.addProduct('Milk');
        });
      }).rejects.toThrow('Add failed');

      expect(result.current.state.error).toBe('Add failed');
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const initialProduct = { ...mockProduct, stockLevel: 'high' as const };
      vi.mocked(inventoryService.getProducts).mockResolvedValue([initialProduct]);
      vi.mocked(inventoryService.updateProduct).mockResolvedValue();

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
        await result.current.updateProduct('1', { stockLevel: 'low' });
      });

      await waitFor(() => {
        const updatedProduct = result.current.state.products.find(p => p.id === '1');
        expect(updatedProduct?.stockLevel).toBe('low');
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should maintain immutability when updating', async () => {
      const initialProduct = { ...mockProduct };
      vi.mocked(inventoryService.getProducts).mockResolvedValue([initialProduct]);
      vi.mocked(inventoryService.updateProduct).mockResolvedValue();

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
      });

      const productsBefore = result.current.state.products;

      await act(async () => {
        await result.current.updateProduct('1', { stockLevel: 'low' });
      });

      const productsAfter = result.current.state.products;

      // Arrays should be different references (immutable)
      expect(productsBefore).not.toBe(productsAfter);
    });

    it('should handle update errors', async () => {
      vi.mocked(inventoryService.updateProduct).mockRejectedValue(
        new Error('Update failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.updateProduct('1', { stockLevel: 'low' });
        });
      }).rejects.toThrow('Update failed');

      expect(result.current.state.error).toBe('Update failed');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
      vi.mocked(inventoryService.deleteProduct).mockResolvedValue();

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
        await result.current.deleteProduct('1');
      });

      await waitFor(() => {
        expect(result.current.state.products).toHaveLength(0);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should maintain immutability when deleting', async () => {
      vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
      vi.mocked(inventoryService.deleteProduct).mockResolvedValue();

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.loadProducts();
      });

      const productsBefore = result.current.state.products;

      await act(async () => {
        await result.current.deleteProduct('1');
      });

      const productsAfter = result.current.state.products;

      // Arrays should be different references (immutable)
      expect(productsBefore).not.toBe(productsAfter);
    });

    it('should handle delete errors', async () => {
      vi.mocked(inventoryService.deleteProduct).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.deleteProduct('1');
        });
      }).rejects.toThrow('Delete failed');

      expect(result.current.state.error).toBe('Delete failed');
    });
  });

  describe('searchProducts', () => {
    it('should search products successfully', async () => {
      const searchResults = [mockProduct];
      vi.mocked(inventoryService.searchProducts).mockResolvedValue(searchResults);

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await act(async () => {
        await result.current.searchProducts('milk');
      });

      await waitFor(() => {
        expect(result.current.state.products).toEqual(searchResults);
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should handle search errors', async () => {
      vi.mocked(inventoryService.searchProducts).mockRejectedValue(
        new Error('Search failed')
      );

      const { result } = renderHook(() => useInventory(), {
        wrapper: InventoryProvider,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.searchProducts('milk');
        });
      }).rejects.toThrow('Search failed');

      expect(result.current.state.error).toBe('Search failed');
    });
  });
});
```

**Test Structure:**
- Use `renderHook` from @testing-library/react for testing hooks
- Mock `inventoryService` using Vitest `vi.mock()`
- Use `act()` for state updates
- Use `waitFor()` for async state updates
- Test all CRUD operations
- Test error handling
- Test immutability of state updates
- Test loading states

---

## Architecture Requirements (From Architecture Document)

### State Management Pattern (CRITICAL)

**Context + useReducer Pattern:**

```
Component → useInventory() → Context → Reducer → Service Layer → Database
```

**Key Principles:**
1. **One Context Per Feature**: InventoryContext for inventory, ShoppingContext for shopping (Story 2.x)
2. **Immutable Updates**: Never mutate state, always create new objects/arrays
3. **Service Layer Integration**: Context calls service methods, never touches database directly
4. **Error Boundaries**: Context catches service errors, stores in state, optionally re-throws
5. **Loading States**: Boolean flags for async operations

### Naming Conventions

- **PascalCase** for Context: `InventoryContext`, `InventoryProvider`
- **camelCase** for hooks: `useInventory()`
- **SCREAMING_SNAKE_CASE** for action types: `LOAD_PRODUCTS`, `ADD_PRODUCT`
- **camelCase** for state fields: `products`, `loading`, `error`
- **Use absolute imports**: `import { inventoryService } from '@/services/inventory'`

### TypeScript Patterns

```typescript
// Discriminated union for type-safe actions
export type InventoryAction =
  | { type: 'LOAD_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  // ... more actions

// Exhaustive switch with never check (optional but recommended)
function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'LOAD_PRODUCTS':
      return { ...state, products: action.payload };
    // ... handle all cases
    default:
      return state; // Or: const _exhaustive: never = action; return state;
  }
}
```

### Immutability Patterns

**Array Updates:**
```typescript
// ✅ CORRECT - Immutable
products: [newProduct, ...state.products]  // Add to beginning
products: state.products.filter(p => p.id !== id)  // Remove
products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)  // Update

// ❌ WRONG - Mutates state
state.products.push(newProduct)  // Mutation
state.products[0] = newProduct  // Mutation
```

**Object Updates:**
```typescript
// ✅ CORRECT - Immutable
return { ...state, loading: true }
return { ...state, products: newProducts, loading: false }

// ❌ WRONG - Mutates state
state.loading = true
state.products = newProducts
```

### Error Handling Pattern

```typescript
try {
  dispatch({ type: 'SET_LOADING', payload: true });
  const result = await service.method();
  dispatch({ type: 'SUCCESS', payload: result });
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Operation failed';
  dispatch({ type: 'SET_ERROR', payload: errorMessage });
  throw error; // Re-throw to allow component-level handling
}
```

**Why Re-throw:**
- Context stores error in state for UI display
- Component can catch and show user-specific feedback (toasts, etc.)
- Allows both global (context) and local (component) error handling

---

## File Structure

```
src/
├── features/
│   └── inventory/
│       ├── components/         # (Story 1.4 will populate)
│       ├── context/
│       │   ├── InventoryContext.tsx       # Context, Provider, Hook
│       │   └── InventoryContext.test.tsx  # Unit tests
│       ├── hooks/              # (Future stories)
│       └── types/              # (Future stories)
├── services/
│   ├── database.ts             # (Story 1.2 - exists)
│   └── inventory.ts            # (Story 1.2 - exists)
└── types/
    └── product.ts              # (Story 1.2 - exists)
```

**New Files:**
- `src/features/inventory/context/InventoryContext.tsx` - Context, Provider, Hook
- `src/features/inventory/context/InventoryContext.test.tsx` - Unit tests

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

**Test Coverage:**
- ✅ Hook throws error outside provider
- ✅ Hook returns context value inside provider
- ✅ All CRUD operations (load, add, update, delete, search)
- ✅ Loading states during async operations
- ✅ Error handling for failed service calls
- ✅ Immutability of state updates
- ✅ Correct array ordering (add to beginning)

**Running Tests:**
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Target: ≥90% coverage for context
```

### Integration with Service Layer

**Key Integration Points:**
1. Context calls `inventoryService.getProducts()`
2. Context calls `inventoryService.addProduct(name)`
3. Context calls `inventoryService.updateProduct(id, updates)`
4. Context calls `inventoryService.deleteProduct(id)`
5. Context calls `inventoryService.searchProducts(query)`

**Mocking in Tests:**
- Mock `inventoryService` using `vi.mock()`
- Verify service methods are called with correct arguments
- Verify state updates after service responses
- Verify error handling when service throws

---

## Previous Story Intelligence

### Learnings from Story 1.2

**Recent Git Commits:**
1. `52ebba1` - Story 1.2: Database Schema and Service Layer (#1)
2. `48b9c55` - Add test coverage
3. `ec5089a` - Fixing unit and e2e tests
4. `e27e75e` - Fix ESLint problems
5. `ba72c06` - Fix npm run dev command

**Key Patterns from Story 1.2:**
1. **Service Layer Pattern Established** - InventoryService abstracts Dexie.js
2. **TypeScript Interfaces** - Product, StockLevel types in `@/types/product`
3. **Singleton Pattern** - `inventoryService` singleton exported
4. **Error Handling** - Try/catch with console.error prefix
5. **UUID Generation** - Using `crypto.randomUUID()`
6. **Test Structure** - Vitest with describe/it blocks, beforeEach cleanup
7. **Immutable Operations** - Service returns new objects, never mutates

**Tools & Configuration:**
- **fake-indexeddb** installed for testing IndexedDB
- **Absolute imports** working with @/ alias
- **TypeScript strict mode** enabled
- **ESLint** configured to exclude coverage/

**Apply These Patterns:**
- Follow same test file naming: `InventoryContext.test.tsx`
- Use same import style: `@/services/inventory`
- Use same error handling: try/catch with re-throw
- Follow same immutability patterns
- Use same TypeScript patterns: interfaces, types

**Build On Story 1.2:**
- Context will consume `inventoryService` singleton
- Context will use `Product` and `StockLevel` types
- Context will follow same error handling patterns
- Tests will mock `inventoryService` methods

---

## Implementation Steps

### Step 1: Create Context Directory

```bash
mkdir -p src/features/inventory/context
```

### Step 2: Create InventoryContext.tsx

Create `src/features/inventory/context/InventoryContext.tsx` with complete implementation (see Technical Requirements section above).

**Implementation Checklist:**
- [ ] Import React hooks: `createContext`, `useContext`, `useReducer`
- [ ] Import `inventoryService` from `@/services/inventory`
- [ ] Import `Product` type from `@/types/product`
- [ ] Define `InventoryState` interface
- [ ] Define `InventoryAction` discriminated union
- [ ] Define `InventoryContextValue` interface
- [ ] Create `InventoryContext` with `createContext`
- [ ] Define `initialState`
- [ ] Implement `inventoryReducer` with all action cases
- [ ] Implement `InventoryProvider` component
- [ ] Implement 5 async methods (loadProducts, addProduct, updateProduct, deleteProduct, searchProducts)
- [ ] Implement `useInventory` custom hook with error check
- [ ] Export Provider and hook

**Verification:**
- File compiles without TypeScript errors
- All imports resolve correctly
- All action types handled in reducer

### Step 3: Create Unit Tests

Create `src/features/inventory/context/InventoryContext.test.tsx` with comprehensive test suite (see Technical Requirements section above).

**Test Implementation Checklist:**
- [ ] Import testing utilities: `renderHook`, `act`, `waitFor`
- [ ] Mock `inventoryService` using `vi.mock()`
- [ ] Create mock Product data
- [ ] Test hook throws error outside provider
- [ ] Test hook returns context inside provider
- [ ] Test `loadProducts` success and error cases
- [ ] Test `addProduct` success, ordering, and error cases
- [ ] Test `updateProduct` success, immutability, and error cases
- [ ] Test `deleteProduct` success, immutability, and error cases
- [ ] Test `searchProducts` success and error cases
- [ ] Test loading states
- [ ] Verify immutability of state updates

### Step 4: Run Tests and Verify

```bash
# Run tests
npm run test

# Expected: All tests passing (14+ new tests + existing tests)

# Check coverage
npm run test:coverage

# Expected: ≥90% coverage for InventoryContext
```

### Step 5: Verify TypeScript Compilation

```bash
# Check TypeScript compilation
npm run build

# Should build successfully with no errors
```

### Step 6: Run Linter

```bash
# Run ESLint
npm run lint

# Should pass with 0 errors
```

### Step 7: Manual Verification (Optional)

You can test the context in a simple component:

```typescript
// Create test component: src/test-components/InventoryTest.tsx
import { useInventory, InventoryProvider } from '@/features/inventory/context/InventoryContext';

function InventoryTestInner() {
  const { state, loadProducts, addProduct } = useInventory();

  return (
    <div>
      <h2>Inventory Test</h2>
      <button onClick={loadProducts}>Load Products</button>
      <button onClick={() => addProduct('Test Product')}>Add Product</button>
      <p>Products: {state.products.length}</p>
      <p>Loading: {state.loading ? 'Yes' : 'No'}</p>
      <p>Error: {state.error || 'None'}</p>
    </div>
  );
}

export function InventoryTest() {
  return (
    <InventoryProvider>
      <InventoryTestInner />
    </InventoryProvider>
  );
}
```

Then use in App.tsx temporarily to test manually.

---

## Non-Functional Requirements

### Performance (NFR1)
- State updates must feel instant (<100ms for local operations)
- Context re-renders optimized (only affected components)
- Service calls complete within 2 seconds

### Maintainability (NFR6)
- Clear separation: Context → Service → Database
- TypeScript provides type safety
- Well-documented code with clear purpose

### Scalability (NFR7)
- Context pattern scales to multiple features
- Easy to add new actions/state fields
- Service layer allows future REST API migration

---

## Definition of Done

This story is considered complete when:

- [x] **Code Complete:**
  - [x] `src/features/inventory/context/InventoryContext.tsx` created with Context, Provider, Hook
  - [x] `src/features/inventory/context/InventoryContext.test.tsx` created with comprehensive tests
  - [x] All TypeScript interfaces defined
  - [x] All 5 async methods implemented (load, add, update, delete, search)
  - [x] Reducer handles all action types immutably

- [x] **Testing Complete:**
  - [x] All unit tests pass (`npm run test`)
  - [x] Test coverage ≥90% for context
  - [x] All CRUD operations tested
  - [x] Error handling tested
  - [x] Immutability verified in tests
  - [x] Loading states tested

- [x] **Quality Checks:**
  - [x] TypeScript compilation succeeds (`npm run build`)
  - [x] ESLint passes with 0 errors (`npm run lint`)
  - [x] All code follows naming conventions
  - [x] Absolute imports used (@/ alias)
  - [x] Immutable state updates verified

- [x] **Documentation:**
  - [x] Context purpose clear
  - [x] All actions documented
  - [x] Usage pattern clear for future stories

- [x] **Acceptance Criteria Met:**
  - [x] AC1: InventoryContext created
  - [x] AC2: Reducer with immutable updates
  - [x] AC3: Integration with InventoryService
  - [x] AC4: Custom useInventory hook
  - [x] AC5: Unit tests for reducer
  - [x] AC6: Integration tests with service

---

## Next Steps (After This Story)

Once Story 1.3 is complete, the next story will be:

**Story 1.4: Add and View Products in Inventory**
- First user-facing feature
- Build ProductCard, ProductForm components
- Use `useInventory()` hook from this story
- Display products in UI

The context created in this story will be consumed by components in Story 1.4 and all future inventory features.

---

## Related Documents

- **Epic:** `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.3, lines 496-530)
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md` (Context Pattern, lines 523-688)
- **PRD:** `_bmad-output/planning-artifacts/prd.md`
- **Sprint Status:** `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **Previous Stories:**
  - `_bmad-output/implementation-artifacts/1-1-initialize-project-with-technical-stack.md`
  - `_bmad-output/implementation-artifacts/1-2-set-up-database-schema-and-service-layer.md`

---

## Story Metadata

- **Created By:** bmm:create-story workflow
- **Date:** 2026-01-08
- **Workflow Version:** 4-implementation/create-story
- **Agent:** Claude Code (Sonnet 3.7)
- **Context Engine:** Ultimate BMad Method story creation with comprehensive analysis

---

## Dev Agent Record

### Implementation Plan
- Created inventory context directory structure
- Implemented InventoryContext with useReducer pattern
- Developed comprehensive reducer with 7 action types
- Integrated all 5 CRUD operations with inventoryService
- Created complete unit test suite with 16 tests
- Fixed ESLint warning for context file exports

### Completion Notes
✅ **Story 1.3 Successfully Implemented (2026-01-08)**

**Implemented Components:**
- `src/features/inventory/context/InventoryContext.tsx` - Complete context with Provider and useInventory hook
- `src/features/inventory/context/InventoryContext.test.tsx` - 16 comprehensive unit tests

**Key Features:**
- Immutable state management using useReducer
- TypeScript discriminated union for type-safe actions
- Error handling with context storage + re-throw pattern
- Loading states for all async operations
- Integration with inventoryService from Story 1.2

**Test Coverage:**
- All 16 tests passing (100% of new tests)
- All CRUD operations tested: load, add, update, delete, search
- Error handling for all operations verified
- Immutability verified through dedicated tests
- Custom hook provider requirement tested

**Quality Checks:**
- ✅ TypeScript compilation successful
- ✅ ESLint passed with 0 errors
- ✅ All tests passing (50 total: 34 from previous stories + 16 new)
- ✅ Build successful

**Technical Decisions:**
- Used discriminated union pattern for action types
- Implemented re-throw pattern for dual error handling (context + component level)
- Added ESLint disable comment for react-refresh rule (common pattern for context files)
- Followed immutability patterns strictly using spread operators

---

## File List

### New Files Created:
- `src/features/inventory/context/InventoryContext.tsx` - Context, Provider, reducer, and useInventory hook
- `src/features/inventory/context/InventoryContext.test.tsx` - Comprehensive unit tests (16 tests)

### Directories Created:
- `src/features/inventory/context/` - Context module directory

---

## Change Log

**2026-01-08:** Story 1.3 implementation completed
- Created complete React Context implementation with useReducer
- All acceptance criteria satisfied
- 16 unit tests passing with complete coverage of CRUD operations
- TypeScript strict mode compliance achieved
- ESLint configuration adjusted for context file pattern
- Immutable state management verified through tests
- Integration with inventoryService from Story 1.2 confirmed
- Ready for code review

---

**Implementation Complete - Ready for Review** ✅

This story has been fully implemented with all acceptance criteria satisfied. The InventoryContext provides complete state management for inventory operations, following React best practices and the architecture patterns defined in the story requirements.
