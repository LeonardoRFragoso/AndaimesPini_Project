import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  TextField,
  Box,
} from "@mui/material";
import { Check, Event, Refresh } from "@mui/icons-material";
import OrdersTable from "../tables/OrdersTable";
import {
  fetchOrders,
  updateOrderStatus,
  extendOrder,
  completeOrderEarly,
  reactivateOrder,
} from "../../api/orders";

const OrdersListView = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [alertOpen, setAlertOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extendDays, setExtendDays] = useState("");
  const [novoValorTotal, setNovoValorTotal] = useState("");
  const [abatimento, setAbatimento] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();

      const updatedData = data.map((order) => {
        const valorAjustado = order.novo_valor_total
          ? order.novo_valor_total - (order.abatimento || 0)
          : order.valor_receber_final ?? order.valor_total;
        return {
          ...order,
          valor_ajustado: parseFloat(valorAjustado).toFixed(2),
        };
      });

      setOrders(updatedData);
      filterOrders(filter, updatedData);
    } catch (error) {
      setSnackbarMessage("Erro ao carregar pedidos.");
      setSnackbarOpen(true);
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const filterValue = event.target.value;
    setFilter(filterValue);
    filterOrders(filterValue, orders);
  };

  const filterOrders = (filterValue, ordersList) => {
    const now = new Date();
    let filtered = ordersList;

    if (filterValue === "active") {
      filtered = ordersList.filter((order) => new Date(order.data_fim) >= now);
    } else if (filterValue === "expired") {
      filtered = ordersList.filter(
        (order) =>
          new Date(order.data_fim) < now && order.status !== "concluído"
      );
    } else if (filterValue === "completed") {
      filtered = ordersList.filter((order) => order.status === "concluído");
    }

    setFilteredOrders(filtered);
  };

  const handleOrderAction = (order, action) => {
    setSelectedOrder({ ...order, action });
    if (action === "extend") {
      setExtendDialogOpen(true);
    } else {
      setAlertOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (selectedOrder.action === "return") {
        await handleConfirmReturn(selectedOrder.id);
      } else if (selectedOrder.action === "early") {
        await handleCompleteOrderEarly(
          selectedOrder.id,
          selectedOrder.data_fim,
          selectedOrder.valor_total
        );
      } else if (selectedOrder.action === "reactivate") {
        await handleReactivateOrder(selectedOrder.id);
      }
      setSnackbarMessage("Ação realizada com sucesso!");
    } catch (error) {
      setSnackbarMessage("Erro ao realizar ação.");
      console.error("Erro ao confirmar ação:", error);
    } finally {
      setSnackbarOpen(true);
      setAlertOpen(false);
    }
  };

  const handleConfirmReturn = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "concluído");
      loadOrders();
    } catch (error) {
      console.error("Erro ao confirmar devolução:", error);
      throw error;
    }
  };

  const handleExtendOrder = async () => {
    if (
      !extendDays ||
      !novoValorTotal ||
      isNaN(extendDays) ||
      isNaN(novoValorTotal)
    ) {
      setSnackbarMessage("Por favor, insira valores válidos.");
      setSnackbarOpen(true);
      return;
    }
    try {
      await extendOrder(
        selectedOrder.id,
        parseInt(extendDays, 10),
        parseFloat(novoValorTotal),
        parseFloat(abatimento) || 0
      );
      setSnackbarMessage("Pedido prorrogado com sucesso!");

      // Recarregar pedidos para garantir valores atualizados na interface
      await loadOrders();
    } catch (error) {
      console.error("Erro ao prorrogar pedido:", error);
      setSnackbarMessage("Erro ao prorrogar pedido.");
      setSnackbarOpen(true);
    } finally {
      setExtendDialogOpen(false);
      setExtendDays("");
      setNovoValorTotal("");
      setAbatimento("");
    }
  };

  const handleCompleteOrderEarly = async (
    orderId,
    novaDataFim,
    novoValorFinal
  ) => {
    try {
      const response = await completeOrderEarly(
        orderId,
        novaDataFim,
        novoValorFinal
      );
      const updatedOrder = response.locacao;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );

      filterOrders(filter, orders);
      setSnackbarMessage("Pedido concluído antecipadamente com sucesso!");
    } catch (error) {
      console.error("Erro ao completar pedido antecipadamente:", error);
      setSnackbarMessage("Erro ao completar pedido antecipadamente.");
      setSnackbarOpen(true);
    }
  };

  const handleReactivateOrder = async (orderId) => {
    try {
      await reactivateOrder(orderId);
      setSnackbarMessage("Pedido reativado com sucesso!");
      loadOrders();
    } catch (error) {
      console.error("Erro ao reativar pedido:", error);
      setSnackbarMessage("Erro ao reativar pedido.");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  return (
    <Paper
      elevation={4}
      sx={{
        padding: 4,
        maxWidth: "90%",
        margin: "20px auto",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#2c552d", fontWeight: "bold" }}
      >
        Pedidos
      </Typography>
      <Typography
        variant="body1"
        align="center"
        gutterBottom
        sx={{ color: "#666", marginBottom: "20px" }}
      >
        Aqui você pode visualizar e gerenciar todos os pedidos realizados.
      </Typography>

      <Grid container spacing={3} justifyContent="space-between">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Filtrar Pedidos</InputLabel>
            <Select
              value={filter}
              onChange={handleFilterChange}
              label="Filtrar Pedidos"
              sx={{ backgroundColor: "#fff" }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Ativos</MenuItem>
              <MenuItem value="expired">Expirados (não devolvidos)</MenuItem>
              <MenuItem value="completed">Concluídos</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={loadOrders}
            sx={{
              backgroundColor: "#45a049",
              "&:hover": { backgroundColor: "#388e3c" },
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {loading ? "Carregando..." : "Atualizar"}
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "30px auto" }} />
      ) : (
        <Box sx={{ marginTop: 3 }}>
          <OrdersTable
            orders={filteredOrders}
            onAction={handleOrderAction}
            loadOrders={loadOrders}
          />
        </Box>
      )}

      {/* Dialog para confirmar ações */}
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
        <DialogTitle>Confirmar Ação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedOrder &&
              `Deseja realmente ${selectedOrder.action} o pedido #${selectedOrder.id}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="primary"
            startIcon={<Check />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para prorrogar pedido */}
      <Dialog
        open={extendDialogOpen}
        onClose={() => setExtendDialogOpen(false)}
      >
        <DialogTitle>Prorrogar Pedido</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Quantos dias deseja prorrogar o pedido #{selectedOrder?.id}?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Dias"
            type="number"
            fullWidth
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Novo Valor Total"
            type="number"
            fullWidth
            value={novoValorTotal}
            onChange={(e) => setNovoValorTotal(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Abatimento (opcional)"
            type="number"
            fullWidth
            value={abatimento}
            onChange={(e) => setAbatimento(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleExtendOrder}
            color="primary"
            startIcon={<Event />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens de feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor: "#333",
            color: "#fff",
            fontSize: "1rem",
          },
        }}
      />
    </Paper>
  );
};

export default OrdersListView;
