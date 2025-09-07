// frontend/src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Badge,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Slide,
  Snackbar,
} from "@mui/material";
import {
  AddCircle,
  Visibility,
  Inventory,
  Assessment,
  PersonAdd,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  NightsStay as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  TrendingUp,
  BarChart,
  Home as HomeIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

// Componentes do Dashboard
import StockOverview from "../Dashboard/StockOverview";
import CriticalItems from "../Dashboard/CriticalItems";
import AlertsPanel from "../Dashboard/AlertsPanel";
import VisaoGeral from "../Dashboard/VisaoGeral";

// APIs
import { listarItens } from "../../api/inventario";
import { listarLocacoes } from "../../api/locacoes";

const HomePage = () => {
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

  // Get the active tab from localStorage
  const getActiveTab = () => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab ? parseInt(savedTab, 10) : 0;
  };
  
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
    <PageLayout>

      {/* Tabs are now in the VisaoGeral component */}

      {getActiveTab() === 0 ? (
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
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
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
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Fade in={true} timeout={600 + (index * 150)}>
                    <Card
                      sx={{
                        textAlign: "center",
                        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        "&:hover": {
                          transform: "translateY(-15px)",
                          boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.15)",
                        },
                        borderRadius: 4,
                        padding: 3,
                        mx: "auto",
                        maxWidth: 320,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '5px',
                          background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}99 100%)`,
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            color: "#ffffff",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: 80,
                            height: 80,
                            borderRadius: "24px",
                            background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}99 100%)`,
                            boxShadow: `0 10px 20px ${item.color}33`,
                            mb: 3,
                            mx: 'auto',
                            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            "&:hover": {
                              transform: "scale(1.1) rotate(5deg)",
                              boxShadow: `0 15px 30px ${item.color}40`,
                            },
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          component="div"
                          gutterBottom
                          sx={{ fontWeight: "600", color: item.color }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.9rem", minHeight: '48px' }}
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
                            background: `linear-gradient(135deg, ${item.color} 30%, ${item.color}99 90%)`,
                            color: "#fff",
                            fontWeight: "bold",
                            borderRadius: "12px",
                            px: 4,
                            py: 1.2,
                            fontSize: "0.95rem",
                            textTransform: "none",
                            letterSpacing: "0.5px",
                            boxShadow: `0 10px 20px ${item.color}33`,
                            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            "&:hover": {
                              background: `linear-gradient(135deg, ${item.color}99 30%, ${item.color} 90%)`,
                              transform: "translateY(-5px)",
                              boxShadow: `0 15px 30px ${item.color}40`,
                            },
                            "&:active": {
                              transform: "translateY(2px)",
                              boxShadow: `0 5px 10px ${item.color}33`,
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
    </PageLayout>
  );
};

export default HomePage;
