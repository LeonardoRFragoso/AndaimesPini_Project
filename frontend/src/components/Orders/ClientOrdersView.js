import React, { useEffect, useState } from "react";
import OrdersTable from "../tables/OrdersTable"; // Supondo que OrdersTable já existe
import { fetchOrdersByClient } from "../../api/orders"; // Importa a função para buscar pedidos pelo ID do cliente
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const ClientOrdersView = () => {
  const { clientId } = useParams(); // Captura o ID do cliente da URL
  const [clientOrders, setClientOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [selectedOrder, setSelectedOrder] = useState(null); // Pedido selecionado para exibir detalhes

  useEffect(() => {
    const loadClientOrders = async () => {
      setLoading(true);
      try {
        const orders = await fetchOrdersByClient(clientId);
        setClientOrders(orders);
        if (orders.length === 0) {
          showSnackbar("Nenhum pedido encontrado para este cliente.", "info");
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos do cliente:", error);
        showSnackbar(
          "Erro ao carregar pedidos. Tente novamente mais tarde.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadClientOrders();
  }, [clientId]);

  const showSnackbar = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order); // Define o pedido selecionado
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null); // Fecha o diálogo de detalhes do pedido
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Pedidos do Cliente
      </Typography>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      ) : clientOrders.length > 0 ? (
        <OrdersTable
          orders={clientOrders}
          onOrderClick={handleOpenOrderDetails}
        />
      ) : (
        <Typography variant="body1" align="center" color="textSecondary">
          Nenhum pedido encontrado para este cliente.
        </Typography>
      )}

      {/* Snackbar para feedback do usuário */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Diálogo para exibir detalhes do pedido */}
      <Dialog open={Boolean(selectedOrder)} onClose={handleCloseOrderDetails}>
        <DialogTitle>Detalhes do Pedido</DialogTitle>
        <DialogContent>
          {selectedOrder ? (
            <>
              <Typography variant="subtitle1">
                Data de Início:{" "}
                {new Date(selectedOrder.data_inicio).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1">
                Data de Término:{" "}
                {new Date(selectedOrder.data_fim).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1">
                Valor Total: R$ {selectedOrder.valor_total.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1">
                Status: {selectedOrder.status}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Itens Locados:
              </Typography>
              {selectedOrder.itens && selectedOrder.itens.length > 0 ? (
                selectedOrder.itens.map((item, index) => (
                  <DialogContentText key={index}>
                    Nome do Item: {item.nome_item} | Tipo: {item.tipo_item} |
                    Quantidade: {item.quantidade_locada}
                  </DialogContentText>
                ))
              ) : (
                <DialogContentText>
                  Nenhum item locado encontrado para este pedido.
                </DialogContentText>
              )}
            </>
          ) : (
            <DialogContentText>
              Carregando detalhes do pedido...
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDetails} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientOrdersView;
