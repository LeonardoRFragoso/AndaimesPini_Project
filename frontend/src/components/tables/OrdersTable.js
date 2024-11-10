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

const OrdersTable = () => {
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

    isMounted.current = true;
    loadOrders();

    return () => {
      isMounted.current = false;
    };
  }, []);

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
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHeader orderBy={orderBy} onSort={handleSort} />
          <TableBody>
            {sortedOrders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                onOpenDetails={handleOpenDetails}
                onConfirmReturn={handleConfirmReturn}
                onExtendOrder={() => {}}
                onReactivateOrder={handleReactivateOrder}
                onCompleteOrder={() => {}}
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
      >
        <DialogTitle>Confirmar Devolução</DialogTitle>
        <DialogContent>
          <Typography>
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
