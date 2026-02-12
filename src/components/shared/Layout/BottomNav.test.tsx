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

/**
 * Story 7.1 AC7: Simplified 2-Tab Navigation Tests
 * - Only 2 tabs: Inventory, Shopping
 * - Scan tab removed from main navigation
 */
describe('BottomNav (Story 7.1: 2-Tab Navigation)', () => {
  const renderBottomNav = () => {
    return render(
      <ShoppingProvider>
        <BrowserRouter>
          <BottomNav />
        </BrowserRouter>
      </ShoppingProvider>
    );
  };

  describe('Story 7.1 AC7: 2-Tab Navigation', () => {
    it('should render two navigation items only', () => {
      renderBottomNav();

      expect(screen.getByText('Inventory')).toBeInTheDocument();
      expect(screen.getByText('Shopping')).toBeInTheDocument();

      // Scan tab should NOT be present
      expect(screen.queryByText('Scan')).not.toBeInTheDocument();
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

      expect(window.location.pathname).toBe('/shopping');
    });

    it('should navigate to inventory when clicked', async () => {
      const user = userEvent.setup();
      // Start at shopping route
      render(
        <ShoppingProvider>
          <MemoryRouter initialEntries={['/shopping']}>
            <BottomNav />
          </MemoryRouter>
        </ShoppingProvider>
      );

      await user.click(screen.getByRole('button', { name: /inventory/i }));

      // In MemoryRouter, the pathname won't change in window.location
      // But we can verify the button selection changes
      const inventoryButton = screen.getByRole('button', { name: /inventory/i });
      expect(inventoryButton).toHaveClass('Mui-selected');
    });
  });

  describe('Default Route Handling', () => {
    it('should default to Inventory for unknown routes', () => {
      render(
        <ShoppingProvider>
          <MemoryRouter initialEntries={['/unknown-route']}>
            <BottomNav />
          </MemoryRouter>
        </ShoppingProvider>
      );

      // On unknown routes, Inventory tab should be selected (value = 0)
      const inventoryButton = screen.getByRole('button', { name: /inventory/i });
      expect(inventoryButton).toHaveClass('Mui-selected');
    });

    it('should default to Inventory for /scan route (route exists but not in nav)', () => {
      render(
        <ShoppingProvider>
          <MemoryRouter initialEntries={['/scan']}>
            <BottomNav />
          </MemoryRouter>
        </ShoppingProvider>
      );

      // Scan route still exists but shouldn't have nav highlight
      // Should default to Inventory
      const inventoryButton = screen.getByRole('button', { name: /inventory/i });
      expect(inventoryButton).toHaveClass('Mui-selected');
    });
  });

  describe('Shopping List Badge', () => {
    it('should render Shopping button', () => {
      // Default mock has count: 0
      renderBottomNav();

      const shoppingButton = screen.getByRole('button', { name: /shopping/i });
      expect(shoppingButton).toBeInTheDocument();
    });
  });
});
