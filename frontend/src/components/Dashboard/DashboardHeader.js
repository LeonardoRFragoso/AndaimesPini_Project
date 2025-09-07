import React from 'react';
import { 
  Box, Typography, Chip, IconButton, Tooltip, 
  useTheme, useMediaQuery, Paper
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Badge from '@mui/material/Badge';

const DashboardHeader = ({ 
  title = "Visão Geral", 
  subtitle = "Dashboard principal do sistema", 
  notificationCount = 0,
  lastUpdated = new Date(),
  onRefresh,
  darkMode = false,
  onToggleTheme
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 }, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        mb: 4
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        width: { xs: '100px', sm: '150px' }, 
        height: { xs: '100px', sm: '150px' }, 
        background: 'radial-gradient(circle, rgba(69,160,73,0.1) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '0 0 0 100%',
        zIndex: 0,
      }}/>
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center'
        }}>
          <Box sx={{ mb: isMobile ? 2 : 0 }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              fontWeight="bold" 
              sx={{ 
                color: '#2c552d',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5
              }}
            >
              <DashboardIcon /> {title}
            </Typography>
            
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignSelf: isMobile ? 'flex-end' : 'center' }}>
            <Tooltip title="Atualizar dados">
              <IconButton 
                onClick={onRefresh} 
                color="primary" 
                size={isMobile ? "small" : "medium"}
                sx={{
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(180deg)'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Chip 
              label={`Atualizado: ${lastUpdated.toLocaleTimeString()}`} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{
                ml: 1,
                display: { xs: 'none', sm: 'flex' }
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default DashboardHeader;
