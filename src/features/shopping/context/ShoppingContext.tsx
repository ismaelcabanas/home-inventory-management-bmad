// TODO (Tech Debt #4): Add explanation for why react-refresh/only-export-components is disabled
// See: docs/technical-debt.md - Issue #4
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { shoppingService } from '@/services/shopping';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import type { Product } from '@/types/product';

// State interface
// TODO (Tech Debt #5): Consider adding readonly modifiers for extra type safety
// See: docs/technical-debt.md - Issue #5
export interface ShoppingState {
  items: Product[];
  loading: boolean;
  error: string | null;
  count: number;
}

// Action types
export type ShoppingAction =
  | { type: 'SET_ITEMS'; payload: Product[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_COUNT'; payload: number };

// Context value interface
export interface ShoppingContextValue {
  state: ShoppingState;
  loadShoppingList: () => Promise<void>;
  refreshCount: () => Promise<void>;
  clearError: () => void;
}

// Create context
const ShoppingContext = createContext<ShoppingContextValue | undefined>(undefined);

// Initial state
const initialState: ShoppingState = {
  items: [],
  loading: false,
  error: null,
  count: 0,
};

// Reducer function
// TODO (Tech Debt #1): Cleanup - loading state fully managed by methods now, reducer patterns could be simplified
// See: docs/technical-debt.md - Issue #1
function shoppingReducer(state: ShoppingState, action: ShoppingAction): ShoppingState {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        count: action.payload.length,
        error: null,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'UPDATE_COUNT':
      return { ...state, count: action.payload };

    default:
      return state;
  }
}

// Provider props
interface ShoppingProviderProps {
  children: ReactNode;
}

// Provider component
export function ShoppingProvider({ children }: ShoppingProviderProps) {
  const [state, dispatch] = useReducer(shoppingReducer, initialState);

  // Load shopping list items
  // TODO (Tech Debt #3): Add concurrency handling (request deduplication or cancellation)
  // Current behavior: "last call wins" - concurrent calls may show stale data
  // See: docs/technical-debt.md - Issue #3 for solutions (AbortController, deduplication, React Query)
  const loadShoppingList = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      logger.debug('Loading shopping list');

      const items = await shoppingService.getShoppingListItems();
      dispatch({ type: 'SET_ITEMS', payload: items });

      logger.info('Shopping list loaded successfully', { count: items.length });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to load shopping list', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      throw error; // Re-throw to allow component-level handling
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh shopping list count
  const refreshCount = async () => {
    try {
      const count = await shoppingService.getShoppingListCount();
      dispatch({ type: 'UPDATE_COUNT', payload: count });
    } catch (error) {
      logger.error('Failed to refresh count', handleError(error).details);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: ShoppingContextValue = {
    state,
    loadShoppingList,
    refreshCount,
    clearError,
  };

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
}

// Custom hook
export function useShoppingList(): ShoppingContextValue {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error('useShoppingList must be used within a ShoppingProvider');
  }
  return context;
}
