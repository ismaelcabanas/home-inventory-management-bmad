import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { inventoryService } from '@/services/inventory';

// Mock the inventory service
vi.mock('@/services/inventory', () => ({
  inventoryService: {
    getProducts: vi.fn(),
    addProduct: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Inventory')).toBeInTheDocument();
    });
  });
});
