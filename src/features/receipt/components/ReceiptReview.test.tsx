/**
 * ReceiptReview Component Tests (Story 5.3)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReceiptReview } from './ReceiptReview';
import type { RecognizedProduct } from '@/features/receipt/types/receipt.types';
import type { Product } from '@/types/product';

describe('ReceiptReview Component - Story 5.3', () => {
  const mockProducts: RecognizedProduct[] = [
    { id: '1', name: 'Milk', confidence: 0.95, isCorrect: false },
    { id: '2', name: 'Bread', confidence: 0.75, isCorrect: false },
    { id: '3', name: 'Cheese', confidence: 0.45, isCorrect: false },
  ];

  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'liters',
    minQuantity: 1,
    expiryDate: new Date('2024-12-31'),
    purchaseDate: new Date('2024-01-01'),
    location: 'Fridge',
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductsWithMatches: RecognizedProduct[] = [
    { id: '1', name: 'Milk', confidence: 0.95, isCorrect: false, matchedProduct: mockProduct },
    { id: '2', name: 'Bread', confidence: 0.75, isCorrect: false },
    { id: '3', name: 'Cheese', confidence: 0.45, isCorrect: false },
  ];

  const mockHandlers = {
    onEditProduct: vi.fn(),
    onAddProduct: vi.fn(),
    onRemoveProduct: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render summary header with correct counts', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // Check for the header with h6 role
      const header = screen.getByRole('heading', { level: 6 });
      expect(header).toHaveTextContent('1 of 3 products recognized');
    });

    it('should render empty state when no products', () => {
      render(<ReceiptReview products={[]} {...mockHandlers} />);

      expect(screen.getByText('0 of 0 products recognized')).toBeInTheDocument();
      expect(screen.getByText(/No products recognized from receipt/)).toBeInTheDocument();
    });

    it('should render all products in list', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
      expect(screen.getByText('Cheese')).toBeInTheDocument();
    });

    it('should disable confirm button when no products', () => {
      render(<ReceiptReview products={[]} {...mockHandlers} />);

      const confirmButton = screen.getByRole('button', { name: /confirm & update inventory/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when products exist', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      const confirmButton = screen.getByRole('button', { name: /confirm & update inventory/i });
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('Confidence Indicators', () => {
    it('should show checkmark icon for high confidence products', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // Milk has 0.95 confidence (high)
      const milkItem = screen.getByText('Milk').closest('.MuiListItem-root');
      expect(milkItem).toBeInTheDocument();
      expect(milkItem?.querySelector('[data-testid="CheckCircleIcon"]')).toBeInTheDocument();
    });

    it('should show warning icon for medium confidence products', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // Bread has 0.75 confidence (medium)
      const breadItem = screen.getByText('Bread').closest('.MuiListItem-root');
      expect(breadItem).toBeInTheDocument();
      expect(breadItem?.querySelector('[data-testid="WarningIcon"]')).toBeInTheDocument();
    });

    it('should show error icon for low confidence products', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // Cheese has 0.45 confidence (low)
      const cheeseItem = screen.getByText('Cheese').closest('.MuiListItem-root');
      expect(cheeseItem).toBeInTheDocument();
      expect(cheeseItem?.querySelector('[data-testid="ErrorIcon"]')).toBeInTheDocument();
    });

    it('should show confidence percentage in secondary text', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      expect(screen.getByText('Confidence: 95%')).toBeInTheDocument();
      expect(screen.getByText('Confidence: 75%')).toBeInTheDocument();
      expect(screen.getByText('Confidence: 45%')).toBeInTheDocument();
    });
  });

  describe('Edit Product', () => {
    it('should open edit dialog when product is clicked', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      const milkItem = screen.getByText('Milk');
      fireEvent.click(milkItem);

      await waitFor(() => {
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /product name/i })).toHaveValue('Milk');
      });
    });

    it('should save edited product name', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // Open edit dialog
      fireEvent.click(screen.getByText('Milk'));

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /product name/i });
        fireEvent.change(input, { target: { value: 'Organic Milk' } });
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(mockHandlers.onEditProduct).toHaveBeenCalledWith('1', 'Organic Milk');
    });

    it('should close dialog without saving on cancel', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      fireEvent.click(screen.getByText('Milk'));

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /product name/i });
        fireEvent.change(input, { target: { value: 'Changed Name' } });
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockHandlers.onEditProduct).not.toHaveBeenCalled();
    });

    it('should show validation error for empty product name', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      fireEvent.click(screen.getByText('Milk'));

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /product name/i });
        fireEvent.change(input, { target: { value: 'M' } });
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Product name must be at least 2 characters')).toBeInTheDocument();
      });

      expect(mockHandlers.onEditProduct).not.toHaveBeenCalled();
    });
  });

  describe('Add Product', () => {
    it('should open add product dialog when FAB is clicked', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      const fabButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(fabButton);

      await waitFor(() => {
        expect(screen.getByText('Add Product')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter product name/i)).toBeInTheDocument();
      });
    });

    it('should add product with valid name', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // Open add dialog
      const fabButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(fabButton);

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /product name/i });
        fireEvent.change(input, { target: { value: 'Butter' } });
      });

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);

      expect(mockHandlers.onAddProduct).toHaveBeenCalledWith('Butter');
    });

    it('should trim whitespace from product name', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      const fabButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(fabButton);

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /product name/i });
        fireEvent.change(input, { target: { value: '  Butter  ' } });
      });

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);

      expect(mockHandlers.onAddProduct).toHaveBeenCalledWith('Butter');
    });

    it('should show validation error for invalid product name', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      const fabButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(fabButton);

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /product name/i });
        fireEvent.change(input, { target: { value: 'X' } });
      });

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Product name must be at least 2 characters')).toBeInTheDocument();
      });

      expect(mockHandlers.onAddProduct).not.toHaveBeenCalled();
    });

    it('should close dialog without adding on cancel', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      const fabButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(fabButton);

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /product name/i });
        fireEvent.change(input, { target: { value: 'Butter' } });
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockHandlers.onAddProduct).not.toHaveBeenCalled();
    });
  });

  describe('Remove Product', () => {
    it('should open remove confirmation dialog when remove button is clicked', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // Find the remove button for Cheese by aria-label
      const cheeseRemoveButton = screen.getByRole('button', { name: /Remove Cheese/i });
      fireEvent.click(cheeseRemoveButton);

      await waitFor(() => {
        expect(screen.getByText('Remove Product?')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to remove/i)).toBeInTheDocument();
        expect(screen.getByText('Cheese')).toBeInTheDocument();
      });
    });

    it('should remove product when confirmed', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // Find the remove button for Cheese by aria-label
      const cheeseRemoveButton = screen.getByRole('button', { name: /Remove Cheese/i });
      fireEvent.click(cheeseRemoveButton);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /^Remove$/i, hidden: true });
        fireEvent.click(confirmButton);
      });

      expect(mockHandlers.onRemoveProduct).toHaveBeenCalledWith('3');
    });

    it('should not remove product when cancelled', async () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      const cheeseRemoveButton = screen.getByRole('button', { name: /Remove Cheese/i });
      fireEvent.click(cheeseRemoveButton);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /^Cancel$/i, hidden: true });
        fireEvent.click(cancelButton);
      });

      expect(mockHandlers.onRemoveProduct).not.toHaveBeenCalled();
    });
  });

  describe('Confirm Review', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      const confirmButton = screen.getByRole('button', { name: /confirm & update inventory/i });
      fireEvent.click(confirmButton);

      expect(mockHandlers.onConfirm).toHaveBeenCalled();
    });

    it('should not call onConfirm when no products', () => {
      render(<ReceiptReview products={[]} {...mockHandlers} />);

      const confirmButton = screen.getByRole('button', { name: /confirm & update inventory/i });
      fireEvent.click(confirmButton);

      expect(mockHandlers.onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Inventory Match Indicators', () => {
    it('should show "In inventory" chip for matched products', () => {
      render(<ReceiptReview products={mockProductsWithMatches} {...mockHandlers} />);

      expect(screen.getByText('In inventory')).toBeInTheDocument();
    });

    it('should show "New" chip for unmatched products', () => {
      render(<ReceiptReview products={mockProductsWithMatches} {...mockHandlers} />);

      // Bread and Cheese are unmatched
      const newChips = screen.getAllByText('New');
      expect(newChips.length).toBeGreaterThanOrEqual(2);
    });

    it('should show only "New" chips when no products are matched', () => {
      render(<ReceiptReview products={mockProducts} {...mockHandlers} />);

      // All products are unmatched
      const newChips = screen.getAllByText('New');
      expect(newChips.length).toBe(3);
    });

    it('should display match chips alongside confidence percentage', () => {
      render(<ReceiptReview products={mockProductsWithMatches} {...mockHandlers} />);

      // Milk has both confidence and match status
      expect(screen.getByText('Confidence: 95%')).toBeInTheDocument();
      expect(screen.getByText('In inventory')).toBeInTheDocument();
    });
  });
});
