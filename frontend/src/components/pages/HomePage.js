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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  CardActions,
  Snackbar,
  Slide,
  Zoom
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp,
  Warning,
  CheckCircle,
  AddCircle,
  Visibility,
  Inventory,
  Assessment,
  PersonAdd,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeMode } from '../../contexts/ThemeContext';
import { listarItens } from '../../api/inventario';
import { listarLocacoes } from '../../api/locacoes';
import VisaoGeral from '../Dashboard/VisaoGeral';
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Modern Gradient Header */}
      <Box
        sx={{
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)'
            : 'linear-gradient(135deg, #1a1a1a 0%, #2c552d 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.08"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '40%',
            height: '200%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)',
            transform: 'rotate(-15deg)',
            animation: 'float 6s ease-in-out infinite',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'rotate(-15deg) translateY(0px)' },
            '50%': { transform: 'rotate(-15deg) translateY(-20px)' },
          }
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HomeIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography
                variant={isMobile ? "h4" : "h3"}
                component="h1"
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(45deg, #ffffff 30%, #e8f5e8 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Dashboard Principal
              </Typography>
            </Box>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                opacity: 0.9,
                maxWidth: 600,
                lineHeight: 1.6,
                fontWeight: 300
              }}
            >
              Bem-vindo ao sistema de gestão Andaimes Pini. Acesse rapidamente as principais funcionalidades e monitore o status do seu negócio.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Tabs are now in the VisaoGeral component */}

      {currentTab === 0 ? (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#45a049' }} />
            <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
              Carregando dados...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                borderRadius: 2, 
                bgcolor: 'rgba(244, 67, 54, 0.05)',
                border: '1px solid rgba(244, 67, 54, 0.2)'
              }}
            >
              <Typography color="error" variant="h6" gutterBottom>
                Erro ao carregar dados
              </Typography>
              <Typography color="text.secondary">{error}</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Tentar novamente
              </Button>
            </Paper>
          </Box>
        ) : (
          <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            {/* Visão Geral Header */}
            <VisaoGeral 
              title="Visão Geral"
              subtitle="Acompanhamento de estoque e locações"
              lastUpdated={lastUpdated}
              onRefresh={handleRefresh}
            />
            
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} lg={8} order={{ xs: 2, md: 1 }}>
                  <Fade in={true} timeout={800}>
                    <Box>
                      <AlertsPanel />
                    </Box>
                  </Fade>
                  <Fade in={true} timeout={1000}>
                    <Box>
                      <StockOverview inventoryData={inventory} />
                    </Box>
                  </Fade>
                </Grid>
                
                <Grid item xs={12} lg={4} order={{ xs: 1, md: 2 }}>
                  <Fade in={true} timeout={1200}>
                    <Box>
                      <CriticalItems inventoryData={inventory} />
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
            </Zoom>
          </Container>
        )
      ) : (
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <VisaoGeral 
            title="Acesso Rápido"
            subtitle="Acesse as principais funcionalidades do sistema"
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
          />
          
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} justifyContent="center" sx={{ mt: 2 }}>
              {/* Card Template */}
              {[
                {
                  title: "Registrar Locação",
                  description:
                    "Registre uma nova locação de materiais para clientes.",
                  icon: <AddCircle sx={{ fontSize: 50 }} />,
                  link: "/register",
                  buttonText: "Registrar",
                  color: "#45a049"
                },
                {
                  title: "Visualizar Pedidos",
                  description:
                    "Visualize e gerencie todos os pedidos realizados.",
                  icon: <Visibility sx={{ fontSize: 50 }} />,
                  link: "/orders",
                  buttonText: "Visualizar",
                  color: "#2196f3"
                },
                {
                  title: "Controle de Estoque",
                  description: "Gerencie os itens disponíveis para locação.",
                  icon: <Inventory sx={{ fontSize: 50 }} />,
                  link: "/inventory",
                  buttonText: "Acessar",
                  color: "#ff9800"
                },
                {
                  title: "Relatórios",
                  description: "Visualize relatórios detalhados sobre locações.",
                  icon: <Assessment sx={{ fontSize: 50 }} />,
                  link: "/reports",
                  buttonText: "Visualizar",
                  color: "#9c27b0"
                },
                {
                  title: "Gerenciar Clientes",
                  description: "Adicione, edite ou visualize os clientes.",
                  icon: <PersonAdd sx={{ fontSize: 50 }} />,
                  link: "/clients",
                  buttonText: "Acessar",
                  color: "#e91e63"
                },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <Fade in={true} timeout={600 + (index * 150)}>
                    <Card
                      sx={{
                        textAlign: "center",
                        transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        "&:hover": {
                          transform: "translateY(-20px) scale(1.02)",
                          boxShadow: theme => theme.palette.mode === 'dark'
                            ? `0px 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px ${item.color}40`
                            : `0px 25px 50px rgba(0, 0, 0, 0.2), 0 0 20px ${item.color}30`,
                        },
                        borderRadius: 6,
                        p: 4,
                        mx: "auto",
                        maxWidth: 340,
                        minHeight: 280,
                        background: theme => theme.palette.mode === 'dark' 
                          ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: theme => theme.palette.mode === 'dark'
                          ? '1px solid rgba(255,255,255,0.08)'
                          : '1px solid rgba(0,0,0,0.08)',
                        boxShadow: theme => theme.palette.mode === 'dark'
                          ? '0 8px 32px rgba(0,0,0,0.4)'
                          : '0 8px 32px rgba(0,0,0,0.08)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '6px',
                          background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}99 100%)`,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '-50%',
                          right: '-50%',
                          width: '100%',
                          height: '100%',
                          background: `radial-gradient(circle, ${item.color}10 0%, transparent 70%)`,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover::after': {
                          opacity: 1,
                        }
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: 90,
                            height: 90,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${item.color} 30%, ${item.color}99 90%)`,
                            color: "#fff",
                            mx: "auto",
                            mb: 3,
                            boxShadow: `0 12px 30px ${item.color}40`,
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '-5px',
                              left: '-5px',
                              right: '-5px',
                              bottom: '-5px',
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)`,
                              opacity: 0,
                              transition: 'opacity 0.3s ease',
                            },
                            '&:hover': {
                              transform: 'scale(1.15) rotate(5deg)',
                              boxShadow: `0 20px 40px ${item.color}60`,
                            },
                            '&:hover::before': {
                              opacity: 1,
                            }
                          }}
                        >
                          {React.cloneElement(item.icon, { sx: { fontSize: 55 } })}
                        </Box>
                        <Typography
                          variant="h5"
                          component="h3"
                          fontWeight="700"
                          gutterBottom
                          sx={{
                            color: theme => theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
                            mb: 2,
                            fontSize: { xs: '1.3rem', sm: '1.5rem' },
                            letterSpacing: '-0.02em'
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.7,
                            mb: 3,
                            fontSize: '0.95rem',
                            color: theme => theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.8)'
                              : 'rgba(0, 0, 0, 0.7)',
                            fontWeight: 400
                          }}
                        >
                          {item.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: "center" }}>
                        <Button
                          variant="contained"
                          component={Link}
                          to={item.link}
                          sx={{
                            background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                            color: "#fff",
                            fontWeight: "600",
                            borderRadius: "16px",
                            px: 5,
                            py: 1.8,
                            fontSize: "1rem",
                            textTransform: "none",
                            letterSpacing: "0.3px",
                            boxShadow: `0 8px 25px ${item.color}40`,
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                              transition: 'left 0.6s ease',
                            },
                            "&:hover": {
                              background: `linear-gradient(135deg, ${item.color}ee 0%, ${item.color} 100%)`,
                              transform: "translateY(-3px) scale(1.05)",
                              boxShadow: `0 15px 35px ${item.color}50`,
                            },
                            "&:hover::before": {
                              left: '100%',
                            },
                            "&:active": {
                              transform: "translateY(-1px) scale(1.02)",
                              boxShadow: `0 8px 20px ${item.color}40`,
                            },
                          }}
                        >
                          {item.buttonText}
                        </Button>
                      </CardActions>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Zoom>
        </Container>
      )}
      
      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarMessage.includes('sucesso') ? "success" : "error"} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default HomePage;
