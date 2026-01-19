import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home as HomeIcon, ShoppingCart as ShoppingCartIcon, CameraAlt as CameraIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * Bottom navigation bar for mobile-first navigation.
 * Fixed to bottom of screen with three main sections:
 * - Home (Inventory)
 * - Shopping List
 * - Receipt Scanner
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

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
        setValue(2);
        break;
      default:
        setValue(0);
    }
  }, [location.pathname]);

  const handleNavigation = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/shopping');
        break;
      case 2:
        navigate('/scan');
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
          icon={<ShoppingCartIcon />}
        />
        <BottomNavigationAction
          label="Scan"
          icon={<CameraIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}
