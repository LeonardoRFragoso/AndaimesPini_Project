// DarkModeStyles.js
// Utility functions for consistent dark mode styling across components

/**
 * Returns appropriate card styling based on the current theme mode
 * @param {object} theme - The MUI theme object
 * @returns {object} - Style object for cards
 */
export const getCardStyle = (theme) => ({
  p: { xs: 2, md: 3 }, 
  borderRadius: 2,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.08)',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
  overflow: 'hidden',
  position: 'relative'
});

/**
 * Returns appropriate title styling based on the current theme mode
 * @param {object} theme - The MUI theme object
 * @param {string} color - Optional color override
 * @returns {object} - Style object for titles
 */
export const getTitleStyle = (theme, color) => ({
  fontWeight: 600,
  color: color || (theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d'),
  display: 'flex',
  alignItems: 'center',
  gap: 1
});

/**
 * Returns appropriate border styling based on the current theme mode
 * @param {object} theme - The MUI theme object
 * @returns {string} - Border style
 */
export const getBorderStyle = (theme) => 
  `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`;

/**
 * Returns appropriate background gradient for decorative elements
 * @param {object} theme - The MUI theme object
 * @param {string} color - Base color in rgba format
 * @returns {string} - Background gradient style
 */
export const getGradientBackground = (theme, color) => 
  theme.palette.mode === 'dark'
    ? `radial-gradient(circle, ${color.replace('0.1', '0.15')} 0%, rgba(0,0,0,0) 70%)`
    : `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`;
