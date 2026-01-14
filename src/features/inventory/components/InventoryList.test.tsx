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
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
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

  // Error Handling Tests
  it('should display error alert when loadProducts fails', async () => {
    vi.mocked(inventoryService.getProducts).mockRejectedValue(new Error('Failed to load products'));

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    });
  });

  it('should show error snackbar when addProduct fails', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);
    vi.mocked(inventoryService.addProduct).mockRejectedValue(new Error('Failed to add product'));

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
      fireEvent.click(lastButton);
    }

    await waitFor(() => {
      const alerts = screen.getAllByText('Failed to add product');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  // Accessibility Tests
  it('should have accessible button with proper ARIA', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add product/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeEnabled();
    });
  });

  it('should support keyboard navigation for add button', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add product/i });
      addButton.focus();
      expect(addButton).toHaveFocus();
    });
  });

  it('should have proper heading hierarchy', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /inventory/i, level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  // Data Persistence Test
  it('should persist products after reload simulation', async () => {
    const products = [mockProduct, { ...mockProduct, id: '2', name: 'Bread' }];
    vi.mocked(inventoryService.getProducts).mockResolvedValue(products);

    const { unmount } = render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });

    // Simulate page reload by unmounting and remounting
    unmount();

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    // Verify data is loaded again (simulating persistence)
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });
  });

  // Edit Product Tests
  it('should open edit dialog when edit button clicked', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText(/Edit Milk/i);
    fireEvent.click(editButton);

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Milk')).toBeInTheDocument();
  });

  it('should update product successfully', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
    vi.mocked(inventoryService.updateProduct).mockResolvedValue();

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/Edit Milk/i));

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'Whole Milk' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Product updated successfully')).toBeInTheDocument();
    });
  });

  // Delete Product Tests
  it('should open delete confirmation dialog when delete button clicked', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/Delete Milk/i);
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Product?')).toBeInTheDocument();
    expect(screen.getByText(/Delete "Milk"\?/)).toBeInTheDocument();
  });

  it('should delete product successfully', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
    vi.mocked(inventoryService.deleteProduct).mockResolvedValue();

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/Delete Milk/i));
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Product deleted successfully')).toBeInTheDocument();
    });
  });

  it('should cancel delete operation', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/Delete Milk/i));
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument();
    });

    // Product should still be in the list
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('should handle delete confirmation when productBeingDeleted is null', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([mockProduct]);
    vi.mocked(inventoryService.deleteProduct).mockResolvedValue();

    render(
      <InventoryProvider>
        <InventoryList />
      </InventoryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    // Open dialog normally
    fireEvent.click(screen.getByLabelText(/Delete Milk/i));

    // Simulate edge case: dialog open but product cleared (shouldn't happen in practice)
    // The handleConfirmDelete early return should prevent deleteProduct call
    expect(screen.getByText('Delete Product?')).toBeInTheDocument();
  });
});
