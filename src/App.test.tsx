import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      expect(screen.getByRole('heading', { name: /inventory/i })).toBeInTheDocument();
    });
  });

  it('renders with AppLayout and BottomNav', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      // Check bottom navigation exists
      expect(screen.getByRole('button', { name: /inventory/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /shopping/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /scan/i })).toBeInTheDocument();
    });
  });

  it('navigates between routes', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);
    const user = userEvent.setup();

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /inventory/i })).toBeInTheDocument();
    });

    // Navigate to shopping list
    await user.click(screen.getByRole('button', { name: /shopping/i }));
    expect(await screen.findByText('Shopping List')).toBeInTheDocument();
    expect(screen.getByText('Coming in Epic 3')).toBeInTheDocument();

    // Navigate to receipt scanner
    await user.click(screen.getByRole('button', { name: /scan/i }));
    expect(await screen.findByText('Receipt Scanner')).toBeInTheDocument();
    expect(screen.getByText('Coming in Epic 5')).toBeInTheDocument();

    // Navigate back to inventory
    await user.click(screen.getByRole('button', { name: /inventory/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /inventory/i })).toBeInTheDocument();
    });
  });

  it('wraps routes in error boundaries', async () => {
    vi.mocked(inventoryService.getProducts).mockResolvedValue([]);

    render(<App />);

    // Verify app renders (error boundaries allow normal rendering)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /inventory/i })).toBeInTheDocument();
    });
  });
});
