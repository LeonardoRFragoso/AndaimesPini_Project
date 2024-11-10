import React, { useState, useEffect } from "react";
import { Paper, Typography, Grid, Box } from "@mui/material";
import OrdersFilter from "./OrdersFilter";
import OrdersActionsDialog from "./OrdersActionsDialog";
import OrdersExtendDialog from "./OrdersExtendDialog";
import OrdersTableWrapper from "./OrdersTableWrapper";
import SnackbarNotification from "./SnackbarNotification";
import LoadingSpinner from "./LoadingSpinner";
import {
  fetchOrders,
  updateOrderStatus,
  extendOrder,
  completeOrderEarly,
  reactivateOrder,
} from "../../api/orders";
import { formatDate, formatCurrency } from "../../utils/formatters";

const OrdersListView = ({ showTitle = true }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [alertOpen, setAlertOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: "", open: false });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      const formattedData = formatOrders(data);
      setOrders(formattedData);
      filterOrders(filter, formattedData);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      openSnackbar(
        "Erro ao carregar pedidos. Por favor, tente novamente.",
        true
      );
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (filterValue, ordersList = orders) => {
    const now = new Date();
    let filtered = ordersList;

    switch (filterValue) {
      case "active":
        filtered = ordersList.filter(
          (order) => new Date(order.data_fim) >= now && order.status === "ativo"
        );
        break;
      case "expired":
        filtered = ordersList.filter(
          (order) => new Date(order.data_fim) < now && order.status === "ativo"
        );
        break;
      case "completed":
        filtered = ordersList.filter((order) => order.status === "concluído");
        break;
      case "awaiting_return":
        filtered = ordersList.filter((order) => !order.data_devolucao);
        break;
      default:
        filtered = ordersList;
    }

    setFilteredOrders(filtered);
  };

  const openSnackbar = (message, isError = false) => {
    setSnackbar({
      message,
      open: true,
      type: isError ? "error" : "success",
    });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
    filterOrders(filterValue);
  };

  const handleConfirmAction = async () => {
    if (!selectedOrder) return;

    try {
      let response;
      switch (selectedOrder.action) {
        case "return":
          response = await updateOrderStatus(selectedOrder.id, "concluído");
          break;
        case "early":
          response = await completeOrderEarly(selectedOrder.id, {
            nova_data_fim: selectedOrder.data_fim,
            novo_valor_final: selectedOrder.valor_total,
          });
          break;
        case "reactivate":
          response = await reactivateOrder(selectedOrder.id);
          break;
        default:
          throw new Error("Ação desconhecida");
      }

      if (response) {
        loadOrders(); // Garante consistência ao recarregar a lista
        openSnackbar("Ação realizada com sucesso!");
      } else {
        openSnackbar(
          "Erro ao realizar ação. Por favor, tente novamente.",
          true
        );
      }
    } catch (error) {
      console.error("Erro ao realizar ação:", error);
      openSnackbar("Erro ao realizar ação. Por favor, tente novamente.", true);
    } finally {
      setSelectedOrder(null);
      setAlertOpen(false);
    }
  };

  const handleExtendOrder = async (order, extendData) => {
    if (!extendData.dias || !extendData.novoValor) {
      openSnackbar("Por favor, insira todos os campos obrigatórios.", true);
      return;
    }

    try {
      const response = await extendOrder(order.id, {
        dias_adicionais: extendData.dias,
        novo_valor_total: extendData.novoValor,
        abatimento: extendData.abatimento || 0,
      });
      if (response) {
        loadOrders(); // Recarrega a lista para atualizar os dados
        openSnackbar("Pedido prorrogado com sucesso!");
      } else {
        openSnackbar(
          "Erro ao prorrogar pedido. Por favor, tente novamente.",
          true
        );
      }
    } catch (error) {
      console.error("Erro ao prorrogar pedido:", error);
      openSnackbar(
        "Erro ao prorrogar pedido. Por favor, tente novamente.",
        true
      );
    } finally {
      setSelectedOrder(null);
      setExtendDialogOpen(false);
    }
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
      {showTitle && (
        <>
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
        </>
      )}
      <Grid container spacing={3} justifyContent="space-between">
        <OrdersFilter
          filter={filter}
          onFilterChange={handleFilterChange}
          onRefresh={loadOrders}
          loading={loading}
        />
      </Grid>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Box sx={{ marginTop: 3 }}>
          <OrdersTableWrapper
            orders={filteredOrders}
            onAction={(order, actionType) => {
              setSelectedOrder({ ...order, action: actionType });
              if (actionType === "extend") setExtendDialogOpen(true);
              else setAlertOpen(true);
            }}
          />
        </Box>
      )}
      <OrdersActionsDialog
        open={alertOpen}
        order={selectedOrder}
        onClose={() => setAlertOpen(false)}
        onConfirm={handleConfirmAction}
      />
      <OrdersExtendDialog
        open={extendDialogOpen}
        order={selectedOrder}
        onClose={() => setExtendDialogOpen(false)}
        onExtend={handleExtendOrder}
      />
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={closeSnackbar}
      />
    </Paper>
  );
};

export default OrdersListView;
