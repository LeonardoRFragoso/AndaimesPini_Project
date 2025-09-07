// Navbar.js
import React, { useState, useEffect } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton,
  Divider,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  alpha
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
  Menu as MenuIcon
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import { logout } from "../../api/auth";
import { NotificacoesService } from "../../api/notificacoes";
import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";
import WarehouseIcon from "@mui/icons-material/Warehouse"; // Ícone para o estoque
import PeopleIcon from "@mui/icons-material/People"; // Ícone para clientes
import LoginIcon from "@mui/icons-material/Login"; // Ícone para login
import LogoutIcon from "@mui/icons-material/Logout"; // Ícone para logout
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Ícone para usuário

const Navbar = () => {
  const { currentUser, logout: authLogout, isAuthenticated } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Efeito para carregar notificações reais do backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await NotificacoesService.obterNaoLidas();
        if (response.status === 'success') {
          setNotifications(response.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        setNotifications([]);
      }
    };
    
    fetchNotifications();
    
    // Atualizar notificações a cada 60 segundos
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      await logout(); // Chamada à API para fazer logout no backend
      authLogout(); // Limpar dados de autenticação no frontend
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    handleClose();
    handleMobileMenuClose();
  };
  
  // Verificar se a rota atual está ativa
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: mode === 'light' ? '#2c552d' : '#1e1e1e',
        boxShadow: mode === 'light' 
          ? '0 4px 20px rgba(0,0,0,0.1)' 
          : '0 4px 20px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: mode === 'light' 
          ? '1px solid rgba(0,0,0,0.05)' 
          : '1px solid rgba(255,255,255,0.05)',
      }}
      elevation={0}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo e título */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
              fontWeight: "bold", 
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <DashboardIcon />
            {!isMobile && "Andaimes Pini"}
          </Typography>
        </Box>

        {/* Navegação para desktop */}
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{ 
                textTransform: "none",
                fontWeight: isActive('/') ? 'bold' : 'normal',
                borderBottom: isActive('/') ? '2px solid white' : 'none',
                borderRadius: 0,
                px: 2
              }}
            >
              Início
            </Button>
            
            {isAuthenticated && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                  sx={{ 
                    textTransform: "none",
                    fontWeight: isActive('/register') ? 'bold' : 'normal',
                    borderBottom: isActive('/register') ? '2px solid white' : 'none',
                    borderRadius: 0,
                    px: 2
                  }}
                >
                  Registrar
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/orders"
                  sx={{ 
                    textTransform: "none",
                    fontWeight: isActive('/orders') ? 'bold' : 'normal',
                    borderBottom: isActive('/orders') ? '2px solid white' : 'none',
                    borderRadius: 0,
                    px: 2
                  }}
                >
                  Pedidos
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/inventory"
                  sx={{ 
                    textTransform: "none",
                    fontWeight: isActive('/inventory') ? 'bold' : 'normal',
                    borderBottom: isActive('/inventory') ? '2px solid white' : 'none',
                    borderRadius: 0,
                    px: 2
                  }}
                >
                  Estoque
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/clients"
                  sx={{ 
                    textTransform: "none",
                    fontWeight: isActive('/clients') ? 'bold' : 'normal',
                    borderBottom: isActive('/clients') ? '2px solid white' : 'none',
                    borderRadius: 0,
                    px: 2
                  }}
                >
                  Clientes
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/reports"
                  sx={{ 
                    textTransform: "none",
                    fontWeight: isActive('/reports') ? 'bold' : 'normal',
                    borderBottom: isActive('/reports') ? '2px solid white' : 'none',
                    borderRadius: 0,
                    px: 2
                  }}
                >
                  Relatórios
                </Button>
              </>
            )}
          </Box>
        )}
          
          {/* Ações e perfil */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Botões de ação */}
            {!isMobile && (
              <>
                <Tooltip title="Alternar tema">
                  <IconButton onClick={toggleTheme} color="inherit" size="small">
                    {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Notificações">
                  <IconButton 
                    color="inherit" 
                    size="small"
                    component={Link}
                    to="/"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <Badge badgeContent={notifications.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            {/* Botão de Login/Logout */}
            {isAuthenticated ? (
              <>
                <Tooltip title="Conta de usuário">
                  <IconButton onClick={handleMenu} sx={{ color: "white" }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            backgroundColor: mode === 'light' ? '#45a049' : '#4caf50', 
                            color: 'white',
                            borderRadius: '4px',
                            px: 0.5,
                            fontSize: '0.6rem'
                          }}
                        >
                          {currentUser?.cargo || 'usuário'}
                        </Typography>
                      }
                    >
                      <Avatar sx={{ 
                        bgcolor: mode === 'light' ? '#45a049' : '#4caf50',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                      }}>
                        {currentUser?.nome?.charAt(0) || 'U'}
                      </Avatar>
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      borderRadius: 2,
                      minWidth: 180,
                      boxShadow: mode === 'light' 
                        ? '0 8px 16px rgba(0,0,0,0.1)' 
                        : '0 8px 16px rgba(0,0,0,0.4)',
                    }
                  }}
                >
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        mx: 'auto', 
                        mb: 1,
                        bgcolor: mode === 'light' ? '#45a049' : '#4caf50',
                      }}
                    >
                      {currentUser?.nome?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {currentUser?.nome || 'Usuário'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentUser?.cargo || 'Usuário'}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={toggleTheme}>
                    {mode === 'light' ? <DarkModeIcon fontSize="small" sx={{ mr: 1 }} /> : <LightModeIcon fontSize="small" sx={{ mr: 1 }} />}
                    {mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Sair
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/login"
                sx={{ 
                  textTransform: "none",
                  fontWeight: 'medium',
                  borderRadius: 8,
                  px: 2,
                  py: 0.5,
                  boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                Login
              </Button>
            )}
            
            {/* Menu para dispositivos móveis */}
            {isMobile && (
              <>
                <IconButton 
                  edge="end" 
                  color="inherit" 
                  onClick={handleMobileMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <MenuIcon />
                </IconButton>
                
                <Menu
                  anchorEl={mobileMenuAnchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(mobileMenuAnchorEl)}
                  onClose={handleMobileMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      width: 200,
                      borderRadius: 2,
                    }
                  }}
                >
                  <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
                    Início
                  </MenuItem>
                  
                  {isAuthenticated && (
                    <>
                      <MenuItem component={Link} to="/register" onClick={handleMobileMenuClose}>
                        Registrar Locação
                      </MenuItem>
                      <MenuItem component={Link} to="/orders" onClick={handleMobileMenuClose}>
                        Visualizar Pedidos
                      </MenuItem>
                      <MenuItem component={Link} to="/inventory" onClick={handleMobileMenuClose}>
                        Estoque
                      </MenuItem>
                      <MenuItem component={Link} to="/reports" onClick={handleMobileMenuClose}>
                        Relatórios
                      </MenuItem>
                      <MenuItem component={Link} to="/clients" onClick={handleMobileMenuClose}>
                        Clientes
                      </MenuItem>
                    </>
                  )}
                  
                  <Divider />
                  
                  <MenuItem onClick={toggleTheme}>
                    {mode === 'light' ? <DarkModeIcon fontSize="small" sx={{ mr: 1 }} /> : <LightModeIcon fontSize="small" sx={{ mr: 1 }} />}
                    {mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                  </MenuItem>
                  
                  {isAuthenticated && (
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                      Sair
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
