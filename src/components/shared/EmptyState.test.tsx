import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should render title as h5 variant', () => {
    render(<EmptyState title="Empty List" message="Add items to get started" />);
    const title = screen.getByText('Empty List');
    // Component uses variant="h5" for styling but renders as h2 HTML element
    expect(title.tagName).toBe('H2');
  });

  describe('with secondary action', () => {
    it('should render both primary and secondary action buttons', () => {
      const onPrimaryAction = vi.fn();
      const onSecondaryAction = vi.fn();
      render(
        <EmptyState
          message="No items found"
          actionLabel="Add Item"
          onAction={onPrimaryAction}
          secondaryActionLabel="Scan Receipt"
          onSecondaryAction={onSecondaryAction}
        />
      );

      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Scan Receipt/ })).toBeInTheDocument();
    });

    it('should call onAction when primary button is clicked', () => {
      const onPrimaryAction = vi.fn();
      const onSecondaryAction = vi.fn();
      render(
        <EmptyState
          message="No items found"
          actionLabel="Add Item"
          onAction={onPrimaryAction}
          secondaryActionLabel="Scan Receipt"
          onSecondaryAction={onSecondaryAction}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));
      expect(onPrimaryAction).toHaveBeenCalledTimes(1);
      expect(onSecondaryAction).not.toHaveBeenCalled();
    });

    it('should call onSecondaryAction when secondary button is clicked', () => {
      const onPrimaryAction = vi.fn();
      const onSecondaryAction = vi.fn();
      render(
        <EmptyState
          message="No items found"
          actionLabel="Add Item"
          onAction={onPrimaryAction}
          secondaryActionLabel="Scan Receipt"
          onSecondaryAction={onSecondaryAction}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Scan Receipt/ }));
      expect(onSecondaryAction).toHaveBeenCalledTimes(1);
      expect(onPrimaryAction).not.toHaveBeenCalled();
    });

    it('should render only secondary button when primary action is not provided', () => {
      const onSecondaryAction = vi.fn();
      render(
        <EmptyState
          message="No items found"
          secondaryActionLabel="Scan Receipt"
          onSecondaryAction={onSecondaryAction}
        />
      );

      expect(screen.getByRole('button', { name: /Scan Receipt/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add Item' })).not.toBeInTheDocument();
    });

    it('should render only primary button when secondary action is not provided', () => {
      const onPrimaryAction = vi.fn();
      render(
        <EmptyState
          message="No items found"
          actionLabel="Add Item"
          onAction={onPrimaryAction}
        />
      );

      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Scan Receipt/ })).not.toBeInTheDocument();
    });
  });
});
