import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  const renderBottomNav = () => {
    return render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
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
});
