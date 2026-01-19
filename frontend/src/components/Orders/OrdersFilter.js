import React from "react";
import PropTypes from "prop-types";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  useTheme,
  Paper,
  Box,
  Chip,
  InputAdornment,
  Typography,
  Fade,
} from "@mui/material";
import { 
  Refresh, 
  FilterList, 
  AllInclusive, 
  CheckCircle, 
  Warning, 
  Done, 
  Schedule,
  ClearAll,
} from "@mui/icons-material";

const OrdersFilter = ({ filter, onFilterChange, onRefresh, loading }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
  };

  const filterOptions = [
    { value: 'all', label: 'Todos os Pedidos', icon: <AllInclusive fontSize="small" />, color: colors.primary },
    { value: 'active', label: 'Ativos', icon: <CheckCircle fontSize="small" />, color: '#4caf50' },
    { value: 'expired', label: 'Expirados', icon: <Warning fontSize="small" />, color: '#ff9800' },
    { value: 'completed', label: 'Concluídos', icon: <Done fontSize="small" />, color: '#2196f3' },
    { value: 'awaiting_return', label: 'Aguardando Devolução', icon: <Schedule fontSize="small" />, color: '#9c27b0' },
  ];

  const currentFilter = filterOptions.find(f => f.value === filter) || filterOptions[0];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        backgroundColor: isDarkMode ? 'rgba(40, 40, 40, 0.8)' : '#ffffff',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        mb: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ 
          backgroundColor: `${colors.primary}20`, 
          borderRadius: 2, 
          p: 1, 
          display: 'flex' 
        }}>
          <FilterList sx={{ color: colors.primary }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filtros
        </Typography>
        <Fade in={filter !== 'all'}>
          <Chip 
            label={currentFilter.label}
            size="small"
            icon={currentFilter.icon}
            sx={{ 
              ml: 1,
              backgroundColor: `${currentFilter.color}20`,
              color: currentFilter.color,
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: currentFilter.color,
              },
            }}
          />
        </Fade>
      </Box>

      <Grid container spacing={3} alignItems="center">
        {/* Filtro de Pedidos */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel 
              id="orders-filter-label" 
              sx={{ 
                color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                '&.Mui-focused': {
                  color: colors.primary,
                },
              }}
            >
              Filtrar Pedidos
            </InputLabel>
            <Select
              id="orders-filter"
              labelId="orders-filter-label"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              label="Filtrar Pedidos"
              startAdornment={
                <InputAdornment position="start">
                  {currentFilter.icon}
                </InputAdornment>
              }
              sx={{
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                color: isDarkMode ? '#fff' : 'inherit',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#fafafa',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primaryLight,
                },
                '&.Mui-focused': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#fff',
                  boxShadow: `0 0 0 2px ${colors.primaryLight}40`,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary,
                },
                '& .MuiSelect-icon': {
                  color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                },
              }}
              aria-labelledby="orders-filter-label"
            >
              {filterOptions.map((option) => (
                <MenuItem 
                  key={option.value}
                  value={option.value} 
                  aria-label={option.label}
                  sx={{ 
                    color: isDarkMode ? '#fff' : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: `${option.color}15`,
                    },
                    '&.Mui-selected': {
                      backgroundColor: `${option.color}20`,
                      '&:hover': {
                        backgroundColor: `${option.color}30`,
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: option.color }}>{option.icon}</Box>
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Botão Atualizar */}
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
            onClick={onRefresh}
            sx={{
              backgroundColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.primaryDark,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(27, 94, 32, 0.3)',
              },
              width: "100%",
              padding: "12px 20px",
              borderRadius: 2,
              fontWeight: 600,
              transition: "all 0.3s ease",
              color: '#fff',
              boxShadow: '0 2px 8px rgba(27, 94, 32, 0.2)',
            }}
            aria-label={loading ? "Atualizando pedidos" : "Atualizar pedidos"}
            disabled={loading}
          >
            {loading ? "Carregando..." : "Atualizar"}
          </Button>
        </Grid>

        {/* Botão de Limpar Filtros */}
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<ClearAll />}
            onClick={() => onFilterChange("all")}
            sx={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: 2,
              fontWeight: 600,
              borderColor: filter === "all" 
                ? (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.12)") 
                : colors.primary,
              color: filter === "all" 
                ? (isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.26)") 
                : colors.primary,
              "&:hover": {
                backgroundColor: filter === "all" 
                  ? "transparent" 
                  : `${colors.primary}10`,
                borderColor: filter === "all" 
                  ? (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.12)") 
                  : colors.primaryDark,
                transform: filter !== "all" ? 'translateY(-2px)' : 'none',
              },
              transition: "all 0.3s ease",
            }}
            aria-label="Limpar filtros"
            disabled={filter === "all"}
          >
            Limpar Filtros
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

OrdersFilter.propTypes = {
  filter: PropTypes.string.isRequired, // Valor atual do filtro
  onFilterChange: PropTypes.func.isRequired, // Função para alterar o filtro
  onRefresh: PropTypes.func.isRequired, // Função para recarregar pedidos
  loading: PropTypes.bool.isRequired, // Estado de carregamento
};

export default OrdersFilter;
