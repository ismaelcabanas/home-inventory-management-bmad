// TODO (Tech Debt #4): Add explanation for why react-refresh/only-export-components is disabled
// See: docs/technical-debt.md - Issue #4
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';
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
  | { type: 'UPDATE_COUNT'; payload: number }
  | { type: 'ADD_TO_LIST'; payload: string }
  | { type: 'REMOVE_FROM_LIST'; payload: string };

// Context value interface
export interface ShoppingContextValue {
  state: ShoppingState;
  loadShoppingList: () => Promise<void>;
  refreshCount: () => Promise<void>;
  clearError: () => void;
  addToList: (productId: string) => Promise<void>;
  removeFromList: (productId: string) => Promise<void>;
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

    case 'ADD_TO_LIST':
      return {
        ...state,
        count: state.count + 1,
      };

    case 'REMOVE_FROM_LIST':
      return {
        ...state,
        count: Math.max(0, state.count - 1),
      };

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
  const loadShoppingList = useCallback(async () => {
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
  }, []);

  // Refresh shopping list count
  const refreshCount = useCallback(async () => {
    try {
      const count = await shoppingService.getShoppingListCount();
      dispatch({ type: 'UPDATE_COUNT', payload: count });
    } catch (error) {
      logger.error('Failed to refresh count', handleError(error).details);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Add product to shopping list (manual override)
  const addToList = useCallback(
    async (productId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        logger.debug('Adding product to shopping list', { productId });

        await shoppingService.addToList(productId);

        // Update count to reflect the addition
        const newCount = await shoppingService.getShoppingListCount();
        dispatch({ type: 'UPDATE_COUNT', payload: newCount });

        logger.info('Product added to shopping list', { productId });
      } catch (error) {
        const appError = handleError(error);
        logger.error('Failed to add product to shopping list', appError.details);
        dispatch({ type: 'SET_ERROR', payload: appError.message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  // Remove product from shopping list (manual override)
  const removeFromList = useCallback(
    async (productId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        logger.debug('Removing product from shopping list', { productId });

        await shoppingService.removeFromList(productId);

        // Update count to reflect the removal
        const newCount = await shoppingService.getShoppingListCount();
        dispatch({ type: 'UPDATE_COUNT', payload: newCount });

        logger.info('Product removed from shopping list', { productId });
      } catch (error) {
        const appError = handleError(error);
        logger.error('Failed to remove product from shopping list', appError.details);
        dispatch({ type: 'SET_ERROR', payload: appError.message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  const value: ShoppingContextValue = useMemo(
    () => ({
      state,
      loadShoppingList,
      refreshCount,
      clearError,
      addToList,
      removeFromList,
    }),
    [state, loadShoppingList, refreshCount, clearError, addToList, removeFromList]
  );

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
