import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureErrorBoundary } from './FeatureErrorBoundary';
import { logger } from '@/utils/logger';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('FeatureErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    // Suppress console.error in tests (React error boundary logs to console)
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when no error occurs', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={false} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should catch errors and display error message', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong in Test Feature/)).toBeInTheDocument();
  });

  it('should log errors with logger.error', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      'Error in Test Feature feature',
      expect.objectContaining({
        error: 'Test error'
      })
    );
  });

  it('should render Try Again button', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ThrowError shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should reset error state when Try Again is clicked', async () => {
    const user = userEvent.setup();

    // Render with component that can toggle between throwing and not throwing
    let shouldThrow = true;
    const ToggleError = () => <ThrowError shouldThrow={shouldThrow} />;

    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ToggleError />
      </FeatureErrorBoundary>
    );

    // Error is displayed
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

    // Reset error flag before clicking Try Again
    shouldThrow = false;

    // Click Try Again - this resets the error boundary state
    await user.click(screen.getByRole('button', { name: /try again/i }));

    // After reset, children render normally
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should display error message details when error has message', () => {
    const ComponentWithDetailedError = () => {
      throw new Error('Detailed error message');
    };

    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ComponentWithDetailedError />
      </FeatureErrorBoundary>
    );

    // Should display both the generic message and specific error details
    expect(screen.getByText(/Something went wrong in Test Feature/)).toBeInTheDocument();
    expect(screen.getByText('Detailed error message')).toBeInTheDocument();
  });

  it('should include featureName in error log', () => {
    render(
      <FeatureErrorBoundary featureName="Critical Feature">
        <ThrowError shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    // Verify logger was called with feature name in message
    expect(logger.error).toHaveBeenCalledWith(
      'Error in Critical Feature feature',
      expect.objectContaining({
        error: 'Test error',
        stack: expect.any(String),
        componentStack: expect.any(String)
      })
    );
  });
});
