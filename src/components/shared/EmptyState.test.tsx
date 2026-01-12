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
});
