import React, { useEffect, useState } from 'react';
import { Card, Grid, Typography, LinearProgress, Box, Paper, useTheme, useMediaQuery, Fade, Grow } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const StockOverview = ({ inventoryData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [animate, setAnimate] = useState(false);
  
  // Calcular estatísticas
  const totalItems = inventoryData.reduce((sum, item) => sum + item.quantidade, 0);
  const availableItems = inventoryData.reduce((sum, item) => sum + item.quantidade_disponivel, 0);
  const rentedItems = totalItems - availableItems;
  const availabilityPercentage = Math.round((availableItems / totalItems) * 100) || 0;
  
  // Cores para o gráfico de barras personalizado
  const COLORS = {
    available: '#45a049',
    rented: '#ff5252',
    background: theme.palette.mode === 'dark' ? '#333333' : '#f5f5f5'
  };

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Determine color based on availability percentage
  const getAvailabilityColor = (percentage) => {
    if (percentage < 20) return '#ff5252'; // Red
    if (percentage < 50) return '#ff9800'; // Orange
    return '#45a049'; // Green
  };

  const availabilityColor = getAvailabilityColor(availabilityPercentage);

  return (
    <Card 
      sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: 3, 
        borderRadius: 2,
        boxShadow: theme => theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 8px 32px rgba(0, 0, 0, 0.08)',
        background: theme => theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
        border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: -20, 
        right: -20, 
        width: 100, 
        height: 100, 
        borderRadius: '50%', 
        background: theme => theme.palette.mode === 'dark'
          ? 'radial-gradient(circle, rgba(76,175,80,0.15) 0%, rgba(0,0,0,0) 70%)'
          : 'radial-gradient(circle, rgba(69,160,73,0.1) 0%, rgba(255,255,255,0) 70%)',
        zIndex: 0 
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 1,
            borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            mb: 2
          }}
        >
          <InventoryIcon /> Visão Geral do Estoque
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Fade in={animate} timeout={800}>
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Disponibilidade Total
                    </Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ color: availabilityColor }}
                    >
                      {availabilityPercentage}%
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative', height: 12, bgcolor: COLORS.background, borderRadius: 6, overflow: 'hidden' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={availabilityPercentage} 
                      sx={{ 
                        height: '100%', 
                        borderRadius: 6,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${availabilityColor} 0%, ${availabilityColor}99 100%)`,
                          transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: 'rgba(0, 0, 0, 0.03)', 
                      borderRadius: 2, 
                      textAlign: 'center',
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <Typography variant="body2" color="text.secondary">Total</Typography>
                      <Typography variant="h6" fontWeight="bold">{totalItems}</Typography>
                      <Typography variant="caption" color="text.secondary">unidades</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: 'rgba(69, 160, 73, 0.1)', 
                      borderRadius: 2, 
                      textAlign: 'center',
                      border: '1px solid rgba(69, 160, 73, 0.2)'
                    }}>
                      <Typography variant="body2" color="text.secondary">Disponíveis</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#45a049">{availableItems}</Typography>
                      <Typography variant="caption" color="text.secondary">unidades</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: 'rgba(255, 82, 82, 0.1)', 
                      borderRadius: 2, 
                      textAlign: 'center',
                      border: '1px solid rgba(255, 82, 82, 0.2)'
                    }}>
                      <Typography variant="body2" color="text.secondary">Alugados</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#ff5252">{rentedItems}</Typography>
                      <Typography variant="caption" color="text.secondary">unidades</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Fade in={animate} timeout={1000}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <LocalShippingIcon fontSize="small" /> Distribuição do Estoque
                </Typography>
                
                {/* Gráfico de barras personalizado */}
                <Grow in={animate} timeout={1200}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Disponível</Typography>
                      <Typography variant="body2" fontWeight="medium">{Math.round((availableItems / totalItems) * 100)}%</Typography>
                    </Box>
                    <Box sx={{ 
                      height: 24, 
                      width: '100%', 
                      bgcolor: COLORS.background,
                      borderRadius: 12,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <Box sx={{ 
                        height: '100%', 
                        width: `${(availableItems / totalItems) * 100}%`, 
                        background: `linear-gradient(90deg, ${COLORS.available} 0%, ${COLORS.available}99 100%)`,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} />
                    </Box>
                  </Box>
                </Grow>
                
                <Grow in={animate} timeout={1400}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Alugado</Typography>
                      <Typography variant="body2" fontWeight="medium">{Math.round((rentedItems / totalItems) * 100)}%</Typography>
                    </Box>
                    <Box sx={{ 
                      height: 24, 
                      width: '100%', 
                      bgcolor: COLORS.background,
                      borderRadius: 12,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <Box sx={{ 
                        height: '100%', 
                        width: `${(rentedItems / totalItems) * 100}%`, 
                        background: `linear-gradient(90deg, ${COLORS.rented} 0%, ${COLORS.rented}99 100%)`,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} />
                    </Box>
                  </Box>
                </Grow>
                
                {/* Legenda */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      bgcolor: COLORS.available, 
                      mr: 1, 
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(69,160,73,0.3)'
                    }} />
                    <Typography variant="body2">Disponível</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      bgcolor: COLORS.rented, 
                      mr: 1, 
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(255,82,82,0.3)'
                    }} />
                    <Typography variant="body2">Alugado</Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

export default StockOverview;
