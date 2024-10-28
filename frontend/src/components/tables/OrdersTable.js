import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
} from "@mui/material";

const OrdersTable = ({ orders, onAction, loadOrders }) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Função para buscar detalhes específicos de uma locação
  const handleOpenDetails = async (order) => {
    try {
      const response = await fetch(`/locacoes/${order.id}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSelectedOrder(data);
      setOpenDetails(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da locação:", error);
      setSnackbarMessage("Erro ao carregar detalhes do pedido.");
      setSnackbarOpen(true);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOpenDetails(false);
  };

  // Função para confirmar devolução e atualizar o status para "concluído"
  const handleConfirmReturn = async (orderId) => {
    try {
      await fetch(`/locacoes/${orderId}/confirmar-devolucao`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      setSnackbarMessage("Devolução confirmada com sucesso!");
      loadOrders(); // Recarrega a lista de pedidos para atualizar o status
    } catch (error) {
      console.error("Erro ao confirmar devolução:", error);
      setSnackbarMessage("Erro ao confirmar devolução.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  // Função para prorrogar a locação
  const handleExtendOrder = async (orderId) => {
    const days = prompt("Quantos dias deseja prorrogar?");
    if (!days) return;
    try {
      await fetch(`/locacoes/${orderId}/prorrogar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dias: days }),
      });
      setSnackbarMessage("Locação prorrogada com sucesso!");
      loadOrders(); // Recarrega para atualizar a data de término
    } catch (error) {
      console.error("Erro ao prorrogar locação:", error);
      setSnackbarMessage("Erro ao prorrogar locação.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID do Pedido</TableCell>
              <TableCell>Data de Início</TableCell>
              <TableCell>Data de Término</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.data_inicio || "Data Indisponível"}
                </TableCell>
                <TableCell>{order.data_fim || "Data Indisponível"}</TableCell>
                <TableCell>{order.cliente?.nome || "Não informado"}</TableCell>
                <TableCell>{`R$ ${(order.valor_total ?? 0).toFixed(
                  2
                )}`}</TableCell>
                <TableCell>{order.status || "Indefinido"}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenDetails(order)}
                  >
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleConfirmReturn(order.id)}
                  >
                    Confirmar Devolução
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExtendOrder(order.id)}
                  >
                    Prorrogar
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => onAction(order, "early")}
                  >
                    Completar Antecipado
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Detalhes do Pedido */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes do Pedido</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography variant="h6">Cliente</Typography>
              <Typography>
                Nome: {selectedOrder.cliente?.nome || "Não informado"}
              </Typography>
              <Typography>
                Endereço: {selectedOrder.cliente?.endereco || "Não informado"}
              </Typography>

              <Typography variant="h6" style={{ marginTop: "1em" }}>
                Itens Locados
              </Typography>
              {selectedOrder.itens && selectedOrder.itens.length > 0 ? (
                <ul>
                  {selectedOrder.itens.map((item, index) => (
                    <li key={index}>
                      {item.descricao} - Quantidade: {item.quantidade}
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>Nenhum item locado.</Typography>
              )}

              <Typography variant="h6" style={{ marginTop: "1em" }}>
                Detalhes da Locaçao
              </Typography>
              <Typography>
                Data de Início: {selectedOrder.data_inicio}
              </Typography>
              <Typography>Data de Término: {selectedOrder.data_fim}</Typography>
              <Typography>
                Valor Total: R$ {selectedOrder.valor_total.toFixed(2)}
              </Typography>
              <Typography>
                Status: {selectedOrder.status || "Indefinido"}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default OrdersTable;
