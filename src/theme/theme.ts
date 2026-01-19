import { createTheme } from '@mui/material/styles';

/**
 * Material-UI theme configuration for the application.
 * Provides consistent design tokens across all components.
 *
 * ## Design Tokens
 *
 * **Colors:**
 * - Primary (#1976d2): Blue - Used for primary actions, navigation highlights
 * - Secondary (#dc004e): Red/Pink - Used for delete/error actions, warnings
 *
 * **Typography:**
 * - System font stack for optimal rendering across platforms
 * - Uses native fonts for better performance and familiarity
 *
 * ## Usage
 *
 * ```tsx
 * import { ThemeProvider } from '@mui/material/styles';
 * import { theme } from '@/theme/theme';
 *
 * <ThemeProvider theme={theme}>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * ## Customization
 *
 * To extend this theme:
 * - Use theme.palette.primary.main for primary brand color
 * - Use theme.palette.secondary.main for accent/error color
 * - Typography follows Material Design guidelines
 *
 * @see https://mui.com/material-ui/customization/theming/
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Blue - primary actions, navigation
    },
    secondary: {
      main: '#dc004e', // Red/Pink - delete actions, errors
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});
