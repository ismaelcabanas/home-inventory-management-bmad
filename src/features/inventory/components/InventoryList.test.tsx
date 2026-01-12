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

    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
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
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Product'));

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'Milk' } });

    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    const lastButton = addButtons[addButtons.length - 1];
    if (lastButton) {
      fireEvent.click(lastButton); // Last "Add" button is in dialog
    }

    await waitFor(() => {
      expect(screen.getByText('Product added successfully')).toBeInTheDocument();
    });
  });
});
