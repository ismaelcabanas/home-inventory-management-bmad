import { BottomNavigation, BottomNavigationAction, Paper, Badge } from '@mui/material';
import { Home as HomeIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useShoppingList } from '@/features/shopping/context/ShoppingContext';

/**
 * Story 7.1: Bottom navigation bar - Simplified to 2 tabs
 *
 * Story 7.1 AC7: Simplified 2-Tab Navigation
 * - Only 2 tabs: Inventory (Home icon), Shopping (Shopping cart icon)
 * - Scan button removed from main navigation (contextual access from Shopping page)
 *
 * Fixed to bottom of screen with two main sections:
 * - Home (Inventory)
 * - Shopping List
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);
  const { state: { count }, refreshCount } = useShoppingList();

  // Update active tab based on current route
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setValue(0);
        break;
      case '/shopping':
        setValue(1);
        break;
      case '/scan':
        // Scan route still exists for existing routes, but not shown in nav
        setValue(0); // Default to inventory when on scan route
        break;
      default:
        setValue(0);
    }
  }, [location.pathname]);

  // Refresh shopping list count every 5 seconds for real-time badge updates
  // This ensures the badge updates even when user is on Inventory page
  useEffect(() => {
    // Initial load
    refreshCount();

    // Poll every 5 seconds to catch stock level changes
    const interval = setInterval(() => {
      refreshCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshCount]);

  const handleNavigation = (_event: React.SyntheticEvent, newValue: number) => {
    // Don't set value here - let useEffect handle it based on location
    // This prevents double state updates and ensures browser back button works
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/shopping');
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleNavigation}
        showLabels
      >
        <BottomNavigationAction
          label="Inventory"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="Shopping"
          icon={
            count > 0 ? (
              <Badge badgeContent={count} color="primary">
                <ShoppingCartIcon />
              </Badge>
            ) : (
              <ShoppingCartIcon />
            )
          }
        />
      </BottomNavigation>
    </Paper>
  );
}
