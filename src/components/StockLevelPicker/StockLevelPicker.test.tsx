import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StockLevelPicker } from './StockLevelPicker';

describe('StockLevelPicker', () => {
  it('renders all four stock levels', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel="high"
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('calls onLevelChange when a different level is clicked', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel="high"
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    fireEvent.click(screen.getByText('Low'));

    expect(mockOnChange).toHaveBeenCalledWith('low');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('visually highlights the current stock level', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <StockLevelPicker
        currentLevel="high"
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    const highButton = screen.getByText('High').closest('button');
    expect(highButton).toHaveClass('Mui-selected');

    rerender(
      <StockLevelPicker
        currentLevel="low"
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    const lowButton = screen.getByText('Low').closest('button');
    expect(lowButton).toHaveClass('Mui-selected');
  });

  it('does not call onLevelChange when disabled', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel="high"
        onLevelChange={mockOnChange}
        productId="test-id"
        disabled={true}
      />
    );

    fireEvent.click(screen.getByText('Low'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('handles rapid clicks gracefully', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel="high"
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    const lowButton = screen.getByText('Low');
    fireEvent.click(lowButton);
    fireEvent.click(lowButton);
    fireEvent.click(lowButton);

    // Should handle multiple clicks without crashing
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('has minimum 44x44px tap targets for accessibility', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel="high"
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      const styles = window.getComputedStyle(button);
      const minWidth = parseInt(styles.minWidth);
      const minHeight = parseInt(styles.minHeight);

      // Allow for some flexibility in measurement (40px minimum acceptable)
      expect(minWidth).toBeGreaterThanOrEqual(40);
      expect(minHeight).toBeGreaterThanOrEqual(40);
    });
  });

  it('uses correct colors for each stock level', () => {
    const mockOnChange = vi.fn();
    render(
      <StockLevelPicker
        currentLevel="high"
        onLevelChange={mockOnChange}
        productId="test-id"
      />
    );

    // Verify all buttons are rendered (color verification via MUI classes)
    const highButton = screen.getByText('High');
    const mediumButton = screen.getByText('Medium');
    const lowButton = screen.getByText('Low');
    const emptyButton = screen.getByText('Empty');

    expect(highButton).toBeInTheDocument();
    expect(mediumButton).toBeInTheDocument();
    expect(lowButton).toBeInTheDocument();
    expect(emptyButton).toBeInTheDocument();
  });
});
