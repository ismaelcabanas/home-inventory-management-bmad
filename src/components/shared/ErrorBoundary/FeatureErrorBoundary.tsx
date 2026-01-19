import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box } from '@mui/material';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  featureName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches errors in React component tree.
 * Prevents entire app from crashing when a single feature fails.
 *
 * @example
 * <FeatureErrorBoundary featureName="Inventory">
 *   <InventoryList />
 * </FeatureErrorBoundary>
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with component stack trace
    logger.error(`Error in ${this.props.featureName} feature`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            }
          >
            Something went wrong in {this.props.featureName}.
            {this.state.error && (
              <Box sx={{ mt: 1, fontSize: '0.875rem', opacity: 0.8 }}>
                {this.state.error.message}
              </Box>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
