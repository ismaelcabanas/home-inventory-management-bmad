import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ShoppingProvider } from '@/features/shopping/context/ShoppingContext';
import { InventoryProvider } from '@/features/inventory/context/InventoryContext';

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

describe('AppLayout', () => {
  const renderAppLayout = (children: React.ReactNode) => {
    return render(
      <InventoryProvider>
        <ShoppingProvider>
          <BrowserRouter>
            <AppLayout>{children}</AppLayout>
          </BrowserRouter>
        </ShoppingProvider>
      </InventoryProvider>
    );
  };

  it('should render children correctly', () => {
    renderAppLayout(<div>Test Content</div>);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render BottomNav component', () => {
    renderAppLayout(<div>Test Content</div>);

    // Check for bottom navigation items
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Scan')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = renderAppLayout(<div>Test Content</div>);

    // Check for main content wrapper
    const mainContent = container.querySelector('main');
    expect(mainContent).toBeInTheDocument();
  });
});
