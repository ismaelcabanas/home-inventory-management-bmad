import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { ShoppingProvider } from '@/features/shopping/context/ShoppingContext';

// Mock useShoppingList hook
vi.mock('@/features/shopping/context/ShoppingContext', () => ({
  useShoppingList: () => ({
    state: { items: [], loading: false, error: null, count: 0 },
    loadShoppingList: vi.fn(),
    refreshCount: vi.fn(),
    clearError: vi.fn(),
  }),
  ShoppingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('BottomNav', () => {
  const renderBottomNav = () => {
    return render(
      <ShoppingProvider>
        <BrowserRouter>
          <BottomNav />
        </BrowserRouter>
      </ShoppingProvider>
    );
  };

  it('should render three navigation items', () => {
    renderBottomNav();

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Scan')).toBeInTheDocument();
  });

  it('should highlight Inventory by default', () => {
    renderBottomNav();

    const inventoryButton = screen.getByRole('button', { name: /inventory/i });
    expect(inventoryButton).toHaveClass('Mui-selected');
  });

  it('should navigate to shopping when clicked', async () => {
    const user = userEvent.setup();
    renderBottomNav();

    await user.click(screen.getByRole('button', { name: /shopping/i }));

    // Check URL changed (in real router)
    expect(window.location.pathname).toBe('/shopping');
  });

  it('should navigate to scan when clicked', async () => {
    const user = userEvent.setup();
    renderBottomNav();

    await user.click(screen.getByRole('button', { name: /scan/i }));

    expect(window.location.pathname).toBe('/scan');
  });

  it('should default to Inventory for unknown routes', () => {
    // Use MemoryRouter to start at an unknown route
    render(
      <ShoppingProvider>
        <MemoryRouter initialEntries={['/unknown-route']}>
          <BottomNav />
        </MemoryRouter>
      </ShoppingProvider>
    );

    // On unknown routes, the default case should activate
    // and Inventory tab should be selected (value = 0)
    const inventoryButton = screen.getByRole('button', { name: /inventory/i });
    expect(inventoryButton).toHaveClass('Mui-selected');
  });
});
