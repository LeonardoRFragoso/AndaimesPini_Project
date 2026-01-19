import React, { useState, useEffect } from "react";
import { Paper, Typography, Grid, Box, useTheme, Container } from "@mui/material";
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

const normalizeStatus = (status) =>
  status
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const OrdersListView = ({ showTitle = true }) => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [alertOpen, setAlertOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    message: "",
    open: false,
    type: "",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      if (!data || !Array.isArray(data)) {
        throw new Error("Dados inválidos recebidos.");
      }
      const formattedData = formatOrders(data);
      setOrders(formattedData);
      filterOrders(filter, formattedData);
    } catch (error) {
      handleError("Erro ao carregar pedidos. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatOrders = (orders) =>
    orders.map((order) => ({
      ...order,
      valor_ajustado: !isNaN(order.valor_total)
        ? (
            parseFloat(order.valor_total) - parseFloat(order.abatimento || 0)
          ).toFixed(2)
        : "N/A",
      data_inicio_formatada: formatDate(order.data_inicio),
      data_fim_formatada: formatDate(order.data_fim),
      data_devolucao_formatada: formatDate(order.data_devolucao),
    }));

  const filterOrders = (filterValue, ordersList = orders) => {
    const now = new Date();
    let filtered = ordersList;

    switch (filterValue) {
      case "active":
        filtered = ordersList.filter(
          (order) =>
            new Date(order.data_fim) >= now &&
            normalizeStatus(order.status) === "ativo"
        );
        break;
      case "expired":
        filtered = ordersList.filter(
          (order) =>
            new Date(order.data_fim) < now &&
            normalizeStatus(order.status) === "ativo"
        );
        break;
      case "completed":
        filtered = ordersList.filter(
          (order) => normalizeStatus(order.status) === "concluido"
        );
        break;
      case "awaiting_return":
        filtered = ordersList.filter((order) => !order.data_devolucao);
        break;
      default:
        filtered = ordersList;
    }

    setFilteredOrders(filtered);
  };

  const handleError = (message) => {
    console.error(message);
    setSnackbar({ message, open: true, type: "error" });
  };

  const openSnackbar = (message, isError = false) => {
    setSnackbar({
      message,
      open: true,
      type: isError ? "error" : "success",
    });
  };

  const closeSnackbar = () => {
    setSnackbar({ message: "", open: false, type: "" });
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
        await loadOrders(); // Atualiza a lista após a ação
        openSnackbar("Ação realizada com sucesso!");
      } else {
        handleError("Erro ao realizar ação. Por favor, tente novamente.");
      }
    } catch (error) {
      handleError("Erro ao realizar ação. Por favor, tente novamente.");
    } finally {
      setSelectedOrder(null);
      setAlertOpen(false);
    }
  };

  const handleExtendOrder = async (order, extendData) => {
    if (!extendData.dias || !extendData.novoValor) {
      handleError("Por favor, insira todos os campos obrigatórios.");
      return;
    }

    try {
      const response = await extendOrder(order.id, {
        dias_adicionais: extendData.dias,
        novo_valor_total: extendData.novoValor,
        abatimento: extendData.abatimento || 0,
      });
      if (response) {
        await loadOrders(); // Atualiza os dados após a prorrogação
        openSnackbar("Pedido prorrogado com sucesso!");
      } else {
        handleError("Erro ao prorrogar pedido. Por favor, tente novamente.");
      }
    } catch (error) {
      handleError("Erro ao prorrogar pedido. Por favor, tente novamente.");
    } finally {
      setSelectedOrder(null);
      setExtendDialogOpen(false);
    }
  };

  const colors = {
    primary: '#1B5E20',
    primaryDark: '#0D3D12',
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: theme.palette.mode === 'light' ? '#f5f7fa' : '#0a0a0a',
      pb: 4,
    }}>
      {/* Header */}
      {showTitle && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            pt: 3,
            pb: 8,
            px: { xs: 2, md: 4 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#fff', 
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Pedidos
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
              Aqui você pode visualizar e gerenciar todos os pedidos realizados
            </Typography>
          </Container>
        </Box>
      )}

      <Container maxWidth="xl" sx={{ mt: showTitle ? -5 : 0 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            border: theme.palette.mode === 'light' 
              ? '1px solid rgba(0,0,0,0.08)' 
              : '1px solid rgba(255,255,255,0.1)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 4px 20px rgba(0,0,0,0.08)'
              : '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
        <Box sx={{
          padding: 4,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : '#fff',
        }}>
        <Box sx={{ mb: 4 }}>
          <OrdersFilter
            filter={filter}
            onFilterChange={handleFilterChange}
            onRefresh={loadOrders}
            loading={loading}
          />
        </Box>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <OrdersTableWrapper
            orders={filteredOrders}
            onAction={(order, actionType) => {
              setSelectedOrder({ ...order, action: actionType });
              if (actionType === "extend") setExtendDialogOpen(true);
              else setAlertOpen(true);
            }}
          />
        )}
        </Box>
        </Paper>
      </Container>
      
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
    </Box>
  );
};

export default OrdersListView;
