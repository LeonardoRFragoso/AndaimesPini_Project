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
} from "@mui/material";
import { Refresh } from "@mui/icons-material";

const OrdersFilter = ({ filter, onFilterChange, onRefresh, loading }) => {
  return (
    <Grid container spacing={2} alignItems="center">
      {/* Filtro de Pedidos */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="orders-filter-label">Filtrar Pedidos</InputLabel>
          <Select
            id="orders-filter"
            labelId="orders-filter-label"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            label="Filtrar Pedidos"
            sx={{
              backgroundColor: "#fff",
              "&:focus": {
                borderColor: "#45a049",
              },
            }}
            aria-labelledby="orders-filter-label"
          >
            <MenuItem value="all" aria-label="Todos os pedidos">
              Todos
            </MenuItem>
            <MenuItem value="active" aria-label="Pedidos ativos">
              Ativos
            </MenuItem>
            <MenuItem value="expired" aria-label="Pedidos expirados">
              Expirados (não devolvidos)
            </MenuItem>
            <MenuItem value="completed" aria-label="Pedidos concluídos">
              Concluídos
            </MenuItem>
            <MenuItem
              value="awaiting_return"
              aria-label="Pedidos aguardando devolução"
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
            backgroundColor: loading ? "#d4e157" : "#45a049",
            "&:hover": {
              backgroundColor: loading ? "#c0ca33" : "#388e3c",
            },
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
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
            borderColor: filter === "all" ? "#d6d6d6" : "#ff5252",
            color: filter === "all" ? "#d6d6d6" : "#ff5252",
            "&:hover": {
              backgroundColor: filter === "all" ? "transparent" : "#ffebee",
              borderColor: filter === "all" ? "#d6d6d6" : "#ff5252",
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
