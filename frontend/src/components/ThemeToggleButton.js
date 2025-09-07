import React from 'react';
import { IconButton, Tooltip, Box, useTheme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeMode } from '../contexts/ThemeContext';

const ThemeToggleButton = ({ position = 'bottom-right', size = 'medium' }) => {
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  
  // Position styles
  const positionStyles = {
    'bottom-right': {
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 1000
    },
    'bottom-left': {
      position: 'fixed',
      bottom: 20,
      left: 20,
      zIndex: 1000
    },
    'top-right': {
      position: 'fixed',
      top: 80, // Below navbar
      right: 20,
      zIndex: 1000
    },
    'top-left': {
      position: 'fixed',
      top: 80, // Below navbar
      left: 20,
      zIndex: 1000
    },
    'inline': {
      position: 'relative'
    }
  };
  
  return (
    <Box sx={positionStyles[position]}>
      <Tooltip title={mode === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}>
        <IconButton
          onClick={toggleTheme}
          color="primary"
          size={size}
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ThemeToggleButton;
