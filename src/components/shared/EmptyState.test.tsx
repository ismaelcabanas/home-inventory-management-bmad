import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('should render message', () => {
    render(<EmptyState message="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<EmptyState message="Empty" icon={<div data-testid="icon">📦</div>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(<EmptyState title="Nothing Here" message="Try adding some items" />);
    expect(screen.getByText('Nothing Here')).toBeInTheDocument();
    expect(screen.getByText('Try adding some items')).toBeInTheDocument();
  });

  it('should render without title when not provided', () => {
    render(<EmptyState message="No items found" />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render title as h6 variant', () => {
    render(<EmptyState title="Empty List" message="Add items to get started" />);
    const title = screen.getByText('Empty List');
    expect(title.tagName).toBe('H6');
  });
});
