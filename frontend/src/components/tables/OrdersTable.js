import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  useTheme,
} from "@mui/material";
import TableHeader from "./TableHeader";
import OrderTableRow from "./OrderTableRow";
import OrderDetailsDialog from "./OrderDetailsDialog";
import { Check } from "@mui/icons-material";
import {
  fetchOrders,
  updateOrderStatus,
  reactivateOrder,
} from "../../api/orders";

const OrdersTable = ({ orders: initialOrders = [], onReactivateOrder: externalReactivateOrder, onExtendOrder, onCompleteOrder, onConfirmReturn }) => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({
    message: "",
    type: "info",
    open: false,
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState(null);
  const [orderBy, setOrderBy] = useState({ field: null, direction: "asc" });
  const isMounted = useRef(true);

  // Carregar pedidos no carregamento inicial
  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      setOrders(initialOrders);
    } else {
      const loadOrders = async () => {
        try {
          const data = await fetchOrders();
          if (isMounted.current) {
            setOrders(data);
            console.log("Pedidos carregados com sucesso:", data);
          }
        } catch (error) {
          console.error("Erro ao carregar pedidos:", error);
          openSnackbar("Erro ao carregar pedidos. Tente novamente.", "error");
        }
      };

      loadOrders();
    }

    return () => {
      isMounted.current = false;
    };
  }, [initialOrders]);

  // Abrir snackbar com mensagens de sucesso/erro
  const openSnackbar = (message, type = "info") => {
    setSnackbar({ message, type, open: true });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Função para ordenar a tabela
  const handleSort = (field) => {
    const isAsc = orderBy.field === field && orderBy.direction === "asc";
    setOrderBy({ field, direction: isAsc ? "desc" : "asc" });
  };

  const sortedOrders = React.useMemo(() => {
    const getNestedValue = (obj, path) =>
      path.split(".").reduce((acc, part) => acc?.[part] ?? null, obj);

    return [...orders].sort((a, b) => {
      if (!orderBy.field) return 0;
      const aValue = getNestedValue(a, orderBy.field) ?? "";
      const bValue = getNestedValue(b, orderBy.field) ?? "";
      if (aValue < bValue) return orderBy.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return orderBy.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, orderBy]);

  // Abrir diálogo de detalhes do pedido
  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOpenDetails(false);
  };

  // Abrir diálogo de confirmação de devolução
  const handleConfirmReturn = (orderId) => {
    setOrderToReturn(orderId);
    setConfirmDialogOpen(true);
  };

  // Confirmar devolução do pedido
  const confirmReturnAction = async () => {
    setConfirmDialogOpen(false);
    try {
      const response = await updateOrderStatus(orderToReturn, "concluído");
      if (response) {
        openSnackbar("Devolução confirmada com sucesso!", "success");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderToReturn
              ? { ...order, status: "concluído" }
              : order
          )
        );
        console.log(`Pedido ${orderToReturn} atualizado para 'concluído'.`);
      } else {
        throw new Error("Erro ao confirmar devolução.");
      }
    } catch (error) {
      console.error("Erro ao confirmar devolução:", error);
      openSnackbar("Erro ao confirmar devolução. Tente novamente.", "error");
    } finally {
      setOrderToReturn(null);
    }
  };

  // Reativar pedido
  const handleReactivateOrder = async (orderId) => {
    try {
      if (externalReactivateOrder) {
        // Use the external handler if provided
        await externalReactivateOrder(orderId);
        return;
      }
      
      const response = await reactivateOrder(orderId);
      if (response) {
        openSnackbar("Pedido reativado com sucesso!", "success");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "ativo" } : order
          )
        );
        console.log(`Pedido ${orderId} atualizado para 'ativo'.`);
      } else {
        throw new Error("Erro ao reativar pedido.");
      }
    } catch (error) {
      console.error("Erro ao reativar pedido:", error);
      openSnackbar("Erro ao reativar pedido. Tente novamente.", "error");
    }
  };

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 3,
          backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : '#fff',
          borderRadius: 2,
          boxShadow: theme => theme.palette.mode === 'dark' 
            ? '0px 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0px 4px 12px rgba(0, 0, 0, 0.1)',
          border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        }}
      >
        <Table>
          <TableHeader orderBy={orderBy} onSort={handleSort} />
          <TableBody>
            {sortedOrders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                onOpenDetails={handleOpenDetails}
                onConfirmReturn={onConfirmReturn || handleConfirmReturn}
                onExtendOrder={onExtendOrder || (() => {})}
                onReactivateOrder={handleReactivateOrder}
                onCompleteOrder={onCompleteOrder || (() => {})}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <OrderDetailsDialog
        open={openDetails}
        selectedOrder={selectedOrder}
        onClose={handleCloseDetails}
      />

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.95)' : '#fff',
            color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
            borderRadius: 2,
            boxShadow: theme => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>
          Confirmar Devolução
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'inherit' }}>
            Tem certeza de que deseja confirmar a devolução deste pedido?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={confirmReturnAction}
            color="primary"
            startIcon={<Check />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor:
              snackbar.type === "success"
                ? "#4caf50"
                : snackbar.type === "error"
                ? "#f44336"
                : "#2196f3",
            color: "#fff",
          },
        }}
      />
    </>
  );
};

export default OrdersTable;
