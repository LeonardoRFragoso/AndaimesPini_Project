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
  Chip
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  NightsStay as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Construction as ConstructionIcon,
  Home as HomeIcon,
  AddBox as AddBoxIcon,
  ListAlt as ListAltIcon,
  Inventory2 as InventoryIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import { logout } from "../../api/auth";
import { NotificacoesService } from "../../api/notificacoes";

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
    if (path === '/dashboard' && location.pathname === '/') return false;
    if (path === '/' && location.pathname === '/dashboard') return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Cores do tema profissional
  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
    accent: '#4CAF50',
  };

  // Itens de navegação - Dashboard para autenticados, Landing para visitantes
  const navItems = isAuthenticated ? [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon fontSize="small" /> },
    { path: '/register', label: 'Nova Locação', icon: <AddBoxIcon fontSize="small" /> },
    { path: '/orders', label: 'Pedidos', icon: <ListAltIcon fontSize="small" /> },
    { path: '/inventory', label: 'Estoque', icon: <InventoryIcon fontSize="small" /> },
    { path: '/clients', label: 'Clientes', icon: <PeopleIcon fontSize="small" /> },
    { path: '/reports', label: 'Relatórios', icon: <AssessmentIcon fontSize="small" /> },
  ] : [
    { path: '/', label: 'Início', icon: <HomeIcon fontSize="small" /> },
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: mode === 'light' 
          ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        boxShadow: mode === 'light' 
          ? '0 4px 20px rgba(27, 94, 32, 0.3)' 
          : '0 4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
      }}
      elevation={0}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
        {/* Logo e título */}
        <Box 
          component={Link}
          to={isAuthenticated ? "/dashboard" : "/"}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <ConstructionIcon sx={{ fontSize: 24, color: '#fff' }} />
          </Box>
          {!isMobile && (
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 700, 
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              Andaimes Pini
            </Typography>
          )}
        </Box>

        {/* Navegação para desktop */}
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {navItems.map((item) => {
              if (item.auth && !isAuthenticated) return null;
              const active = isActive(item.path);
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{ 
                    textTransform: "none",
                    color: '#fff',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.875rem',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: 'relative',
                    backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}
          
        {/* Ações e perfil */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Botões de ação */}
          {!isMobile && (
            <>
              <Tooltip title={mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}>
                <IconButton 
                  onClick={toggleTheme} 
                  sx={{ 
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                    width: 40,
                    height: 40,
                  }}
                >
                  {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Notificações">
                <IconButton 
                  component={Link}
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  sx={{ 
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                    width: 40,
                    height: 40,
                  }}
                >
                  <Badge 
                    badgeContent={notifications.length} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#f44336',
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
                      }
                    }}
                  >
                    <NotificationsIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
            </>
          )}
          
          {/* Botão de Login/Logout */}
          {isAuthenticated ? (
            <>
              <Tooltip title="Minha conta">
                <Button
                  onClick={handleMenu}
                  sx={{ 
                    color: '#fff',
                    textTransform: 'none',
                    borderRadius: 3,
                    px: 1.5,
                    py: 0.75,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                    gap: 1,
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: colors.accent,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {currentUser?.nome?.charAt(0) || 'U'}
                  </Avatar>
                  {!isMobile && (
                    <>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {currentUser?.nome?.split(' ')[0] || 'Usuário'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1 }}>
                          {currentUser?.cargo || 'Admin'}
                        </Typography>
                      </Box>
                      <ArrowDownIcon fontSize="small" sx={{ opacity: 0.7 }} />
                    </>
                  )}
                </Button>
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
                  elevation: 0,
                  sx: {
                    mt: 1.5,
                    borderRadius: 3,
                    minWidth: 220,
                    overflow: 'visible',
                    boxShadow: mode === 'light' 
                      ? '0 10px 40px rgba(0,0,0,0.12)' 
                      : '0 10px 40px rgba(0,0,0,0.5)',
                    border: mode === 'light' 
                      ? '1px solid rgba(0,0,0,0.05)'
                      : '1px solid rgba(255,255,255,0.1)',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 20,
                      width: 12,
                      height: 12,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                      borderLeft: mode === 'light' 
                        ? '1px solid rgba(0,0,0,0.05)'
                        : '1px solid rgba(255,255,255,0.1)',
                      borderTop: mode === 'light' 
                        ? '1px solid rgba(0,0,0,0.05)'
                        : '1px solid rgba(255,255,255,0.1)',
                    },
                  }
                }}
              >
                <Box sx={{ p: 2.5, textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      mx: 'auto', 
                      mb: 1.5,
                      bgcolor: colors.primary,
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      boxShadow: `0 4px 14px rgba(27, 94, 32, 0.3)`,
                    }}
                  >
                    {currentUser?.nome?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {currentUser?.nome || 'Usuário'}
                  </Typography>
                  <Chip 
                    label={currentUser?.cargo || 'Administrador'} 
                    size="small"
                    sx={{ 
                      mt: 0.5,
                      backgroundColor: mode === 'light' 
                        ? 'rgba(27, 94, 32, 0.1)' 
                        : 'rgba(76, 175, 80, 0.2)',
                      color: mode === 'light' ? colors.primary : colors.accent,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
                <Divider />
                <Box sx={{ py: 1 }}>
                  <MenuItem 
                    onClick={toggleTheme}
                    sx={{ 
                      py: 1.5, 
                      px: 2.5,
                      gap: 1.5,
                      '&:hover': {
                        backgroundColor: mode === 'light' 
                          ? 'rgba(27, 94, 32, 0.05)' 
                          : 'rgba(76, 175, 80, 0.1)',
                      }
                    }}
                  >
                    {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                    <Typography variant="body2">
                      {mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5, 
                      px: 2.5,
                      gap: 1.5,
                      color: '#f44336',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.08)',
                      }
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                    <Typography variant="body2">Sair</Typography>
                  </MenuItem>
                </Box>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              component={Link}
              to="/login"
              sx={{ 
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                backgroundColor: '#fff',
                color: colors.primary,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                },
              }}
            >
              Entrar
            </Button>
          )}
          
          {/* Menu para dispositivos móveis */}
          {isMobile && (
            <>
              <IconButton 
                edge="end" 
                onClick={handleMobileMenuOpen}
                sx={{ 
                  ml: 1,
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                }}
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
                  elevation: 0,
                  sx: {
                    mt: 1.5,
                    width: 240,
                    borderRadius: 3,
                    boxShadow: mode === 'light' 
                      ? '0 10px 40px rgba(0,0,0,0.12)' 
                      : '0 10px 40px rgba(0,0,0,0.5)',
                    border: mode === 'light' 
                      ? '1px solid rgba(0,0,0,0.05)'
                      : '1px solid rgba(255,255,255,0.1)',
                  }
                }}
              >
                {navItems.map((item) => {
                  if (item.auth && !isAuthenticated) return null;
                  const active = isActive(item.path);
                  return (
                    <MenuItem 
                      key={item.path}
                      component={Link} 
                      to={item.path} 
                      onClick={handleMobileMenuClose}
                      sx={{
                        py: 1.5,
                        px: 2.5,
                        gap: 1.5,
                        backgroundColor: active 
                          ? (mode === 'light' ? 'rgba(27, 94, 32, 0.08)' : 'rgba(76, 175, 80, 0.15)')
                          : 'transparent',
                        color: active ? colors.primary : 'inherit',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {item.icon}
                      <Typography variant="body2">{item.label}</Typography>
                    </MenuItem>
                  );
                })}
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem 
                  onClick={toggleTheme}
                  sx={{ py: 1.5, px: 2.5, gap: 1.5 }}
                >
                  {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                  <Typography variant="body2">
                    {mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                  </Typography>
                </MenuItem>
                
                {isAuthenticated && (
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5, 
                      px: 2.5,
                      gap: 1.5,
                      color: '#f44336',
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                    <Typography variant="body2">Sair</Typography>
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
