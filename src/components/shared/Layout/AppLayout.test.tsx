import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  const renderAppLayout = (children: React.ReactNode) => {
    return render(
      <BrowserRouter>
        <AppLayout>{children}</AppLayout>
      </BrowserRouter>
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
