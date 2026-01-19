// frontend/src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  Snackbar,
  Slide,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Inventory2 as InventoryIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowIcon,
  Construction as ConstructionIcon,
  LocalShipping as ShippingIcon,
  EventNote as EventIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeMode } from '../../contexts/ThemeContext';
import { listarItens } from '../../api/inventario';
import { listarLocacoes } from '../../api/locacoes';
import AlertsPanel from '../Dashboard/AlertsPanel';
import StockOverview from '../Dashboard/StockOverview';
import CriticalItems from '../Dashboard/CriticalItems';

const HomePage = () => {
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Buscar dados do inventário
      const inventoryData = await listarItens();
      setInventory(inventoryData || []);
      
      // Buscar dados de locações
      const rentalsData = await listarLocacoes();
      setRentals(rentalsData || []);
      
      setLastUpdated(new Date());
      setRefreshing(false);
      setSnackbarMessage('Dados atualizados com sucesso!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
      setRefreshing(false);
      setSnackbarMessage('Erro ao atualizar dados. Tente novamente.');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await fetchData();
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // State to track active tab
  const [currentTab, setCurrentTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  
  // Listen for tab change events
  useEffect(() => {
    const handleTabChange = (event) => {
      setCurrentTab(event.detail.activeTab);
    };
    
    window.addEventListener('tabChange', handleTabChange);
    
    return () => {
      window.removeEventListener('tabChange', handleTabChange);
    };
  }, []);
  
  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTab = localStorage.getItem('activeTab');
      if (savedTab && parseInt(savedTab, 10) !== currentTab) {
        setCurrentTab(parseInt(savedTab, 10));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentTab]);
  
  const handleRefresh = () => {
    fetchData();
  };
  
  const handleToggleTheme = () => {
    setDarkMode(prev => !prev);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Cores do tema
  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
    accent: '#4CAF50',
  };

  // Calcular estatísticas
  const totalItems = inventory.reduce((acc, item) => acc + (item.quantidade_total || 0), 0);
  const availableItems = inventory.reduce((acc, item) => acc + (item.quantidade_disponivel || 0), 0);
  const rentedItems = totalItems - availableItems;
  const activeRentals = rentals.filter(r => r.status === 'ativa' || r.status === 'em_andamento').length;
  const overdueRentals = rentals.filter(r => r.status === 'atrasada').length;

  // Cards de estatísticas
  const statsCards = [
    {
      title: 'Total em Estoque',
      value: totalItems.toLocaleString(),
      subtitle: 'unidades cadastradas',
      icon: <InventoryIcon />,
      color: colors.primary,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    },
    {
      title: 'Disponíveis',
      value: availableItems.toLocaleString(),
      subtitle: `${totalItems > 0 ? Math.round((availableItems / totalItems) * 100) : 0}% do estoque`,
      icon: <CheckCircle />,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      trend: 'up',
    },
    {
      title: 'Em Locação',
      value: rentedItems.toLocaleString(),
      subtitle: `${activeRentals} contratos ativos`,
      icon: <ShippingIcon />,
      color: '#2196F3',
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
    },
    {
      title: 'Atenção',
      value: overdueRentals,
      subtitle: 'devoluções pendentes',
      icon: <Warning />,
      color: overdueRentals > 0 ? '#FF5722' : '#4CAF50',
      gradient: overdueRentals > 0 
        ? 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)'
        : 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      alert: overdueRentals > 0,
    },
  ];

  // Ações rápidas
  const quickActions = [
    { title: 'Nova Locação', icon: <AssignmentIcon />, link: '/register', color: colors.primary },
    { title: 'Ver Pedidos', icon: <EventIcon />, link: '/orders', color: '#2196F3' },
    { title: 'Estoque', icon: <InventoryIcon />, link: '/inventory', color: '#FF9800' },
    { title: 'Clientes', icon: <PeopleIcon />, link: '/clients', color: '#9C27B0' },
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: mode === 'light' ? '#f5f7fa' : '#0a0a0a',
        pb: 4,
      }}
    >
      {/* Header Compacto e Moderno */}
      <Box
        sx={{
          background: mode === 'light'
            ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
            : 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
          pt: { xs: 3, md: 4 },
          pb: { xs: 12, md: 14 },
          px: { xs: 2, md: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Pattern overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <ConstructionIcon sx={{ fontSize: 32, color: '#fff' }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                    }}
                  >
                    Dashboard
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Andaimes Pini • Sistema de Gestão
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={`Atualizado: ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Cards de Estatísticas */}
      <Container maxWidth="xl" sx={{ mt: { xs: -8, md: -10 }, px: { xs: 2, md: 3 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: colors.primary }} />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography color="error" gutterBottom>{error}</Typography>
            <Button onClick={handleRefresh} startIcon={<RefreshIcon />}>Tentar novamente</Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {statsCards.map((stat, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Fade in timeout={400 + index * 100}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        background: mode === 'light' ? '#fff' : '#1a1a2e',
                        border: mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: mode === 'light' 
                          ? '0 4px 20px rgba(0,0,0,0.08)' 
                          : '0 4px 20px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: mode === 'light'
                            ? `0 12px 40px ${stat.color}20`
                            : `0 12px 40px ${stat.color}30`,
                        },
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Gradient bar */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: stat.gradient,
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: mode === 'light' ? '#666' : 'rgba(255,255,255,0.6)',
                              fontWeight: 500,
                              mb: 1,
                              textTransform: 'uppercase',
                              fontSize: '0.75rem',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {stat.title}
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 800,
                              color: mode === 'light' ? '#1a1a2e' : '#fff',
                              fontSize: { xs: '2rem', md: '2.5rem' },
                              lineHeight: 1,
                              mb: 0.5,
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: mode === 'light' ? '#888' : 'rgba(255,255,255,0.5)',
                              fontSize: '0.8rem',
                            }}
                          >
                            {stat.subtitle}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            background: stat.gradient,
                            boxShadow: `0 8px 20px ${stat.color}30`,
                          }}
                        >
                          {React.cloneElement(stat.icon, { sx: { fontSize: 28, color: '#fff' } })}
                        </Avatar>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {/* Ações Rápidas */}
            <Paper
              elevation={0}
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 4,
                background: mode === 'light' ? '#fff' : '#1a1a2e',
                border: mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: mode === 'light' ? '0 4px 20px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: mode === 'light' ? '#1a1a2e' : '#fff' }}>
                  Ações Rápidas
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Button
                      component={Link}
                      to={action.link}
                      fullWidth
                      sx={{
                        py: 2.5,
                        px: 2,
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        textTransform: 'none',
                        bgcolor: mode === 'light' ? `${action.color}08` : `${action.color}15`,
                        border: `1px solid ${mode === 'light' ? `${action.color}20` : `${action.color}30`}`,
                        color: mode === 'light' ? action.color : '#fff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: action.color,
                          color: '#fff',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 20px ${action.color}40`,
                        },
                      }}
                    >
                      {React.cloneElement(action.icon, { sx: { fontSize: 28 } })}
                      <Typography variant="body2" fontWeight={600}>
                        {action.title}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Grid Principal */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Alertas */}
              <Grid item xs={12} lg={8}>
                <Fade in timeout={600}>
                  <Box>
                    <AlertsPanel />
                  </Box>
                </Fade>
                <Fade in timeout={800}>
                  <Box sx={{ mt: 3 }}>
                    <StockOverview inventoryData={inventory} />
                  </Box>
                </Fade>
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} lg={4}>
                <Fade in timeout={700}>
                  <Box>
                    <CriticalItems inventoryData={inventory} />
                  </Box>
                </Fade>
              </Grid>
            </Grid>
          </>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes('sucesso') ? 'success' : 'error'}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage;
