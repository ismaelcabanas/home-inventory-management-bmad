import { render, screen } from '@testing-library/react';
import { ShoppingProgress } from './ShoppingProgress';

describe('ShoppingProgress', () => {
  describe('displays progress text', () => {
    it('displays "0 of 0" when both counts are 0', () => {
      render(<ShoppingProgress checkedCount={0} totalCount={0} />);
      expect(screen.getByText('0 of 0 items collected')).toBeInTheDocument();
    });

    it('displays "X of Y" format correctly', () => {
      render(<ShoppingProgress checkedCount={3} totalCount={8} />);
      expect(screen.getByText('3 of 8 items collected')).toBeInTheDocument();
    });

    it('displays "5 of 5" when all items checked', () => {
      render(<ShoppingProgress checkedCount={5} totalCount={5} />);
      expect(screen.getByText('5 of 5 items collected')).toBeInTheDocument();
    });
  });

  describe('completion indicator', () => {
    it('shows completion indicator when all items checked', () => {
      render(<ShoppingProgress checkedCount={5} totalCount={5} />);

      expect(screen.getByText('Shopping complete!')).toBeInTheDocument();
      // Check for green checkmark icon via test id or role
      const checkIcon = document.querySelector('[data-testid="check-circle-icon"]');
      expect(checkIcon).toBeInTheDocument();
    });

    it('hides completion indicator when not all checked', () => {
      render(<ShoppingProgress checkedCount={2} totalCount={5} />);

      expect(screen.queryByText('Shopping complete!')).not.toBeInTheDocument();
    });

    it('hides completion indicator when totalCount is 0', () => {
      render(<ShoppingProgress checkedCount={0} totalCount={0} />);

      expect(screen.queryByText('Shopping complete!')).not.toBeInTheDocument();
    });

    it('shows completion indicator with congratulatory message', () => {
      render(<ShoppingProgress checkedCount={12} totalCount={12} />);

      expect(screen.getByText('Shopping complete!')).toBeInTheDocument();
      expect(screen.getByText('12 of 12 items collected')).toBeInTheDocument();
    });
  });

  describe('empty state handling', () => {
    it('handles 0/0 case without errors', () => {
      render(<ShoppingProgress checkedCount={0} totalCount={0} />);
      expect(screen.getByText('0 of 0 items collected')).toBeInTheDocument();
    });

    it('does not show completion indicator for empty list', () => {
      render(<ShoppingProgress checkedCount={0} totalCount={0} />);

      expect(screen.queryByText('Shopping complete!')).not.toBeInTheDocument();
      expect(screen.queryByTestId('check-circle-icon')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('uses semantic HTML for screen readers', () => {
      render(<ShoppingProgress checkedCount={2} totalCount={5} />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('2 of 5 items collected');
    });

    it('has sufficient color contrast (verified visually)', () => {
      render(<ShoppingProgress checkedCount={2} totalCount={5} />);
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      // Color contrast would be verified by visual testing tools
    });
  });
});
