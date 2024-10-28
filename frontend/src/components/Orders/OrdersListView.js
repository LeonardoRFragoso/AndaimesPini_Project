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
} from "@mui/material";
import OrdersTable from "../tables/OrdersTable"; // Caminho corrigido
import {
  fetchOrders,
  updateOrderStatus,
  extendOrder,
  completeOrderEarly,
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

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      filterOrders(filter, data);
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
        await handleCompleteOrderEarly(selectedOrder.id);
      }
      setSnackbarMessage("Ação realizada com sucesso!");
    } catch (error) {
      setSnackbarMessage("Erro ao realizar ação.");
      console.error("Erro ao confirmar ação:", error);
    } finally {
      setSnackbarOpen(true);
      setAlertOpen(false);
      loadOrders(); // Atualiza a tabela após a ação
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

  const handleExtendOrder = async (days) => {
    try {
      await extendOrder(selectedOrder.id, days);
      setSnackbarMessage("Pedido prorrogado com sucesso!");
      loadOrders();
    } catch (error) {
      console.error("Erro ao prorrogar pedido:", error);
      throw error;
    } finally {
      setExtendDialogOpen(false);
      setExtendDays("");
    }
  };

  const handleCompleteOrderEarly = async (orderId) => {
    try {
      await completeOrderEarly(orderId);
      loadOrders();
    } catch (error) {
      console.error("Erro ao completar pedido antecipadamente:", error);
      throw error;
    }
  };

  const handleExtendConfirm = async () => {
    if (extendDays <= 0) {
      setSnackbarMessage("Por favor, insira um número de dias válido.");
      setSnackbarOpen(true);
      return;
    }
    await handleExtendOrder(extendDays);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  return (
    <Paper elevation={3} sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Pedidos
      </Typography>

      <Grid container spacing={2} justifyContent="space-between">
        <Grid item>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Filtrar Pedidos</InputLabel>
            <Select
              value={filter}
              onChange={handleFilterChange}
              label="Filtrar Pedidos"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Ativos</MenuItem>
              <MenuItem value="expired">Expirados (não devolvidos)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={loadOrders}>
            Atualizar
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onAction={handleOrderAction}
          loadOrders={loadOrders} // Passa a função de recarregar pedidos para atualizar a tabela
        />
      )}

      {/* Dialog para confirmar ações */}
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
        <DialogTitle>Confirmar Ação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedOrder &&
              `Deseja realmente ${selectedOrder.action} para o pedido #${selectedOrder.id}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmAction} color="primary">
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleExtendConfirm} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens de feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default OrdersListView;
