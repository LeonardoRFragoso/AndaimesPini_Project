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
} from "@mui/material";
import { Refresh } from "@mui/icons-material";

const OrdersFilter = ({ filter, onFilterChange, onRefresh, loading }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  return (
    <Grid container spacing={2} alignItems="center">
      {/* Filtro de Pedidos */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="orders-filter-label" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>Filtrar Pedidos</InputLabel>
          <Select
            id="orders-filter"
            labelId="orders-filter-label"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            label="Filtrar Pedidos"
            sx={{
              backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : '#fff',
              color: isDarkMode ? '#fff' : 'inherit',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDarkMode ? '#4caf50' : '#45a049',
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#45a049",
              },
            }}
            aria-labelledby="orders-filter-label"
          >
            <MenuItem value="all" aria-label="Todos os pedidos" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              Todos
            </MenuItem>
            <MenuItem value="active" aria-label="Pedidos ativos" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              Ativos
            </MenuItem>
            <MenuItem value="expired" aria-label="Pedidos expirados" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              Expirados (não devolvidos)
            </MenuItem>
            <MenuItem value="completed" aria-label="Pedidos concluídos" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              Concluídos
            </MenuItem>
            <MenuItem
              value="awaiting_return"
              aria-label="Pedidos aguardando devolução"
              sx={{ color: isDarkMode ? '#fff' : 'inherit' }}
            >
              Aguardando Devolução
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Botão Atualizar */}
      <Grid item xs={12} sm={6} md={2}>
        <Button
          variant="contained"
          color="success"
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
          onClick={onRefresh}
          sx={{
            backgroundColor: loading 
              ? (isDarkMode ? "rgba(212, 225, 87, 0.7)" : "#d4e157") 
              : (isDarkMode ? "rgba(69, 160, 73, 0.8)" : "#45a049"),
            "&:hover": {
              backgroundColor: loading 
                ? (isDarkMode ? "rgba(192, 202, 51, 0.8)" : "#c0ca33") 
                : (isDarkMode ? "rgba(56, 142, 60, 0.9)" : "#388e3c"),
            },
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            color: isDarkMode ? '#fff' : 'inherit',
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
          color="error"
          onClick={() => onFilterChange("all")}
          sx={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            fontWeight: "bold",
            borderColor: filter === "all" 
              ? (isDarkMode ? "rgba(214, 214, 214, 0.3)" : "#d6d6d6") 
              : (isDarkMode ? "rgba(255, 82, 82, 0.7)" : "#ff5252"),
            color: filter === "all" 
              ? (isDarkMode ? "rgba(214, 214, 214, 0.3)" : "#d6d6d6") 
              : (isDarkMode ? "rgba(255, 82, 82, 0.9)" : "#ff5252"),
            "&:hover": {
              backgroundColor: filter === "all" 
                ? "transparent" 
                : (isDarkMode ? "rgba(255, 82, 82, 0.1)" : "#ffebee"),
              borderColor: filter === "all" 
                ? (isDarkMode ? "rgba(214, 214, 214, 0.3)" : "#d6d6d6") 
                : (isDarkMode ? "rgba(255, 82, 82, 0.7)" : "#ff5252"),
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
  );
};

OrdersFilter.propTypes = {
  filter: PropTypes.string.isRequired, // Valor atual do filtro
  onFilterChange: PropTypes.func.isRequired, // Função para alterar o filtro
  onRefresh: PropTypes.func.isRequired, // Função para recarregar pedidos
  loading: PropTypes.bool.isRequired, // Estado de carregamento
};

export default OrdersFilter;
