/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { inventoryService } from '@/services/inventory';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
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
        error: null,
      };

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [action.payload, ...state.products],
        error: null,
      };

    case 'UPDATE_PRODUCT': {
      const { id, updates } = action.payload;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
        error: null,
      };
    }

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
        error: null,
      };

    case 'SEARCH_PRODUCTS':
      return {
        ...state,
        products: action.payload,
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
      logger.debug('Loading products from database');

      const products = await inventoryService.getProducts();
      dispatch({ type: 'LOAD_PRODUCTS', payload: products });

      logger.info('Products loaded successfully', { count: products.length });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to load products', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add new product
  const addProduct = async (name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      logger.debug('Adding new product', { name });

      const product = await inventoryService.addProduct(name);
      dispatch({ type: 'ADD_PRODUCT', payload: product });

      logger.info('Product added successfully', { id: product.id, name: product.name });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to add product', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      throw error; // Re-throw to allow component-level handling
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update existing product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      logger.debug('Updating product', { id, updates });

      await inventoryService.updateProduct(id, updates);
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } });

      logger.info('Product updated successfully', { id });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to update product', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      logger.debug('Deleting product', { id });

      await inventoryService.deleteProduct(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });

      logger.info('Product deleted successfully', { id });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to delete product', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Search products
  const searchProducts = async (query: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      logger.debug('Searching products', { query });

      const products = await inventoryService.searchProducts(query);
      dispatch({ type: 'SEARCH_PRODUCTS', payload: products });

      logger.info('Product search completed', { query, resultCount: products.length });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to search products', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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
