import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from "@mui/material";
import {
  fetchOrders,
  updateOrderStatus,
  extendOrder,
  completeOrderEarly,
} from "../../api/orders"; // Ajuste para o caminho correto da API

const OrdersListView = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const filterValue = event.target.value;
    setFilter(filterValue);
    filterOrders(filterValue);
  };

  const filterOrders = (filterValue) => {
    const now = new Date();
    let filtered = orders;

    if (filterValue === "active") {
      filtered = orders.filter((order) => new Date(order.data_fim) >= now);
    } else if (filterValue === "expired") {
      filtered = orders.filter(
        (order) => new Date(order.data_fim) < now && !order.returned
      );
    }

    setFilteredOrders(filtered);
  };

  const handleOrderAction = (order, action) => {
    setSelectedOrder({ ...order, action });
    setAlertOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (selectedOrder.action === "return") {
        await completeOrder(selectedOrder);
      } else if (selectedOrder.action === "extend") {
        const days = prompt("Quantos dias deseja prorrogar?");
        if (days) {
          await handleExtendOrder(days);
        }
      } else if (selectedOrder.action === "early") {
        await handleCompleteOrderEarly();
      }
    } catch (error) {
      console.error("Erro ao confirmar ação:", error);
    } finally {
      setAlertOpen(false);
    }
  };

  const completeOrder = async (order) => {
    await updateOrderStatus(order.id, "returned");
    loadOrders();
  };

  const handleExtendOrder = async (days) => {
    await extendOrder(selectedOrder.id, days);
    loadOrders();
  };

  const handleCompleteOrderEarly = async () => {
    await completeOrderEarly(selectedOrder.id);
    loadOrders();
  };

  return (
    <Paper elevation={3} sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Visualizar Pedidos
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID do Pedido</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.data}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleOrderAction(order, "return")}
                    >
                      Confirmar Devolução
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOrderAction(order, "extend")}
                    >
                      Prorrogar
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleOrderAction(order, "early")}
                    >
                      Completar Antecipado
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
    </Paper>
  );
};

export default OrdersListView;
