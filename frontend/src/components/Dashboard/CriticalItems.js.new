import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, List, ListItem, ListItemText, Chip, Box, Grid, 
  LinearProgress, Avatar, Divider, Paper, useTheme, useMediaQuery, 
  Fade, Grow, Tooltip, IconButton
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CriticalItems = ({ inventoryData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Identificar itens com menos de 20% de disponibilidade
  const criticalItems = inventoryData
    .filter(item => item.quantidade > 0 && (item.quantidade_disponivel / item.quantidade) < 0.2)
    .sort((a, b) => (a.quantidade_disponivel / a.quantidade) - (b.quantidade_disponivel / b.quantidade));
  
  // Identificar os 5 itens mais alugados
  const mostRentedItems = [...inventoryData]
    .filter(item => item.quantidade > 0)
    .sort((a, b) => (b.quantidade - b.quantidade_disponivel) - (a.quantidade - a.quantidade_disponivel))
    .slice(0, 5);

  // Função para renderizar o item com barra de progresso
  const renderItemWithProgress = (item, isRented = false) => {
    const total = item.quantidade;
    const available = item.quantidade_disponivel;
    const rented = total - available;
    
    // Calcular porcentagens
    const availablePercentage = Math.round((available / total) * 100) || 0;
    const rentedPercentage = Math.round((rented / total) * 100) || 0;
    
    // Determinar cores baseadas na disponibilidade
    const getAvailabilityColor = (percentage) => {
      if (percentage < 20) return '#ff5252'; // Vermelho
      if (percentage < 50) return '#ff9800'; // Laranja
      return '#45a049'; // Verde
    };
    
    const availabilityColor = getAvailabilityColor(availablePercentage);
    const displayValue = isRented ? rented : available;
    const displayPercentage = isRented ? rentedPercentage : availablePercentage;
    const progressColor = isRented ? theme.palette.primary.main : availabilityColor;
    
    return (
      <Grow 
        key={`${item.id}-${isRented ? 'rented' : 'available'}`} 
        in={animate} 
        timeout={800 + (isRented ? 200 : 0)}
      >
        <Paper 
          elevation={0}
          sx={{ 
            mb: 1.5, 
            p: 1.5, 
            borderRadius: 2,
            border: `1px solid ${isRented ? 'rgba(25, 118, 210, 0.2)' : 'rgba(255, 82, 82, 0.2)'}`,
            bgcolor: isRented ? 'rgba(25, 118, 210, 0.05)' : 'rgba(255, 82, 82, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="medium">
              {item.nome_item}
            </Typography>
            <Chip 
              label={`${displayValue} unid.`} 
              color={isRented ? "primary" : "error"} 
              size="small" 
              variant="outlined"
              sx={{ height: 24, '& .MuiChip-label': { px: 1, py: 0 } }}
            />
          </Box>
          
          <Box sx={{ mb: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {isRented ? 'Alugados' : 'Disponíveis'}
              </Typography>
              <Typography variant="caption" fontWeight="bold" color={isRented ? 'primary' : availabilityColor}>
                {displayPercentage}%
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', height: 8, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${displayPercentage}%`,
                  bgcolor: progressColor,
                  borderRadius: 4,
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </Box>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {isRented 
              ? `${rented} alugados de ${total} unidades totais`
              : `${available} disponíveis de ${total} unidades totais`
            }
          </Typography>
        </Paper>
      </Grow>
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            height: '100%', 
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
            background: theme.palette.mode === 'dark' ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
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
            background: 'radial-gradient(circle, rgba(244,67,54,0.1) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0 
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              pb: 1.5,
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#2c552d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <WarningIcon color="error" /> Itens com Estoque Crítico
              </Typography>
              
              <Tooltip title={`${criticalItems.length} itens críticos`}>
                <Chip 
                  label={criticalItems.length} 
                  color={criticalItems.length > 0 ? "error" : "success"}
                  size="small"
                  icon={criticalItems.length > 0 ? <ErrorOutlineIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                  sx={{ 
                    fontWeight: 'bold',
                    '& .MuiChip-icon': { fontSize: '1rem' }
                  }}
                />
              </Tooltip>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {criticalItems.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Itens com menos de 20% do estoque disponível
                  </Typography>
                  {criticalItems.map(item => renderItemWithProgress(item))}
                </Box>
              ) : (
                <Fade in={animate} timeout={600}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      border: '1px solid rgba(76, 175, 80, 0.2)'
                    }}
                  >
                    <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                    <Typography variant="subtitle1" color="success.main" gutterBottom>
                      Sem itens críticos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Todos os itens possuem níveis adequados de estoque.
                    </Typography>
                  </Paper>
                </Fade>
              )}
            </Box>
          </Box>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            height: '100%', 
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
            background: theme.palette.mode === 'dark' ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
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
            background: 'radial-gradient(circle, rgba(25,118,210,0.1) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0 
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              pb: 1.5,
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#2c552d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <TrendingUpIcon color="primary" /> Itens Mais Alugados
              </Typography>
              
              <Tooltip title="Top 5 itens mais alugados">
                <Chip 
                  label="TOP 5" 
                  color="primary"
                  size="small"
                  icon={<LocalShippingIcon fontSize="small" />}
                  sx={{ 
                    fontWeight: 'bold',
                    '& .MuiChip-icon': { fontSize: '1rem' }
                  }}
                />
              </Tooltip>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Itens com maior percentual de locação
              </Typography>
              {mostRentedItems.map(item => renderItemWithProgress(item, true))}
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CriticalItems;
