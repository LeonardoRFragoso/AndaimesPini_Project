import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Chip, IconButton, Tooltip, 
  useTheme, useMediaQuery, Paper, Tabs, Tab
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const VisaoGeral = ({ 
  title = "Visão Geral", 
  subtitle = "Acompanhamento de estoque e locações", 
  lastUpdated = new Date(),
  onRefresh
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use localStorage to persist the active tab state
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  
  // Sync activeTab with localStorage on component mount and when activeTab changes
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && parseInt(savedTab, 10) !== activeTab) {
      setActiveTab(parseInt(savedTab, 10));
    }
  }, []);
  
  // Update localStorage when activeTab changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab.toString());
    
    // Dispatch a custom event to notify other components about the tab change
    const event = new CustomEvent('tabChange', { detail: { activeTab } });
    window.dispatchEvent(event);
  }, [activeTab]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 }, 
        borderRadius: 3, 
        background: theme => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)',
        border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        boxShadow: theme => theme.palette.mode === 'dark'
          ? '0 10px 40px -10px rgba(0,0,0,0.3)'
          : '0 10px 40px -10px rgba(0,0,0,0.05)',
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
        background: theme => theme.palette.mode === 'dark'
          ? 'radial-gradient(circle, rgba(76,175,80,0.15) 0%, rgba(0,0,0,0) 70%)'
          : 'radial-gradient(circle, rgba(69,160,73,0.1) 0%, rgba(255,255,255,0) 70%)',
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
                color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
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
            
            <Box sx={{ mt: 2, display: 'flex', width: '100%' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ 
                  visibility: 'visible',
                  display: 'flex',
                  width: '100%',
                  minHeight: 48,
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: 'linear-gradient(90deg, #2c552d 0%, #45a049 100%)',
                  },
                  '& .MuiTab-root': {
                    transition: 'all 0.3s ease',
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    textTransform: 'none',
                    minHeight: { xs: '48px', sm: '48px' },
                  },
                }}
              >
                <Tab 
                  icon={<DashboardIcon />} 
                  iconPosition={isMobile ? "top" : "start"}
                  label="Dashboard" 
                  sx={{ 
                    fontWeight: activeTab === 0 ? 'bold' : 'normal',
                    borderBottom: activeTab === 0 ? '1px solid rgba(44,85,45,0.2)' : 'none',
                    visibility: 'visible',
                    flex: 1,
                  }}
                />
                <Tab 
                  icon={<AddCircleIcon />} 
                  iconPosition={isMobile ? "top" : "start"}
                  label="Acesso Rápido" 
                  sx={{ 
                    fontWeight: activeTab === 1 ? 'bold' : 'normal',
                    borderBottom: activeTab === 1 ? '1px solid rgba(44,85,45,0.2)' : 'none',
                    visibility: 'visible',
                    flex: 1,
                  }}
                />
              </Tabs>
            </Box>
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

export default VisaoGeral;
