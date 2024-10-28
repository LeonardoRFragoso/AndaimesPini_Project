// OrdersTable.js
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
} from "@mui/material";

const OrdersTable = ({ orders, onAction }) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOpenDetails(false);
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
                    onClick={() => onAction(order, "return")}
                  >
                    Confirmar Devolução
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => onAction(order, "extend")}
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
              {selectedOrder.itens_locados &&
              selectedOrder.itens_locados.length > 0 ? (
                <ul>
                  {selectedOrder.itens_locados.map((item, index) => (
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
    </>
  );
};

export default OrdersTable;
