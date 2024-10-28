import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Chip,
  Button,
} from "@mui/material";
import {
  Check,
  WarningAmber,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

// Importando os botões modularizados
import CompleteButton from "../common/CompleteButton";
import DetailsButton from "../common/DetailsButton";
import ExtendButton from "../common/ExtendButton";
import ReturnButton from "../common/ReturnButton";

const OrdersTable = ({ orders, onAction, loadOrders }) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState(null);
  const isMounted = useRef(true);
  const [orderBy, setOrderBy] = useState({ field: null, direction: "asc" });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Função para alternar a ordenação das colunas
  const handleSort = (field) => {
    const isAsc = orderBy.field === field && orderBy.direction === "asc";
    setOrderBy({ field, direction: isAsc ? "desc" : "asc" });
  };

  // Função auxiliar para acessar valores de campos aninhados com segurança
  const getNestedValue = (obj, path) => {
    return path
      .split(".")
      .reduce(
        (acc, part) => (acc && acc[part] !== undefined ? acc[part] : null),
        obj
      );
  };

  // Ordenação dos pedidos com base na coluna e direção
  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => {
      if (!orderBy.field) return 0;
      const aValue = getNestedValue(a, orderBy.field) ?? ""; // Valor padrão para comparação
      const bValue = getNestedValue(b, orderBy.field) ?? ""; // Valor padrão para comparação
      if (aValue < bValue) return orderBy.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return orderBy.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, orderBy]);

  // Função para abrir o modal de detalhes da locação
  const handleOpenDetails = async (order) => {
    try {
      const response = await fetch(
        `http://localhost:5000/locacoes/${order.id}`
      );
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (isMounted.current) {
        setSelectedOrder(data);
        setOpenDetails(true);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da locação:", error);
      if (isMounted.current) {
        setSnackbarMessage("Erro ao carregar detalhes do pedido.");
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOpenDetails(false);
  };

  // Função para abrir o modal de confirmação de devolução
  const handleConfirmReturn = (orderId) => {
    setOrderToReturn(orderId);
    setConfirmDialogOpen(true);
  };

  // Função que realiza a devolução após confirmação
  const confirmReturnAction = async () => {
    setConfirmDialogOpen(false);
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const response = await fetch(
        `http://localhost:5000/locacoes/${orderToReturn}/confirmar-devolucao`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          signal,
        }
      );

      if (response.ok && isMounted.current) {
        setSnackbarMessage("Devolução confirmada com sucesso!");
        loadOrders();
      } else {
        throw new Error("Erro ao confirmar devolução no backend.");
      }
    } catch (error) {
      console.error("Erro ao confirmar devolução:", error);
      if (isMounted.current) {
        setSnackbarMessage("Erro ao confirmar devolução. Tente novamente.");
      }
    } finally {
      if (isMounted.current) {
        setSnackbarOpen(true);
      }
      setOrderToReturn(null);
    }
  };

  // Função para prorrogar a locação
  const handleExtendOrder = async (orderId) => {
    const diasAdicionais = parseInt(
      prompt("Quantos dias deseja prorrogar?"),
      10
    );
    if (!diasAdicionais || diasAdicionais <= 0) {
      alert("Número de dias adicionais deve ser maior que zero.");
      return;
    }

    const novoValorTotal = parseFloat(
      prompt("Informe o novo valor total do pedido:")
    );
    if (!novoValorTotal || novoValorTotal <= 0) {
      alert("O valor total deve ser maior que zero.");
      return;
    }

    const abatimento =
      parseFloat(
        prompt("Informe o valor de abatimento, se houver (0 para nenhum):")
      ) || 0;

    try {
      const response = await fetch(
        `http://localhost:5000/locacoes/${orderId}/prorrogacao`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dias_adicionais: diasAdicionais,
            novo_valor_total: novoValorTotal,
            abatimento: abatimento,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao prorrogar locação.");
      }

      setSnackbarMessage("Locação prorrogada com sucesso!");
      loadOrders(); // Recarrega os pedidos
    } catch (error) {
      console.error("Erro ao prorrogar locação:", error);
      setSnackbarMessage("Erro ao prorrogar locação. Tente novamente.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  // Função para devolução antecipada
  const handleEarlyReturn = async (orderId) => {
    // Prompt para nova data de fim no formato dd-MM-yyyy
    const newEndDate = prompt(
      "Informe a nova data final do pedido (dd-MM-yyyy):"
    );
    if (!newEndDate) return;

    const [day, month, year] = newEndDate.split("-");
    const formattedEndDate = `${year}-${month}-${day}`;

    const newTotalValue = parseFloat(
      prompt("Informe o novo valor total do pedido:")
    );
    if (!newTotalValue || newTotalValue <= 0) {
      alert("O valor total deve ser maior que zero.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/locacoes/${orderId}/finalizar_antecipadamente`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nova_data_fim: formattedEndDate,
            novo_valor_final: newTotalValue,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao registrar devolução antecipada.");
      }

      setSnackbarMessage("Devolução antecipada registrada com sucesso!");
      loadOrders(); // Recarrega a lista de pedidos
    } catch (error) {
      console.error("Erro ao registrar devolução antecipada:", error);
      setSnackbarMessage(
        "Erro ao registrar devolução antecipada. Tente novamente."
      );
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e0f2f1" }}>
            <TableRow>
              <TableCell
                onClick={() => handleSort("id")}
                style={{ cursor: "pointer" }}
              >
                ID do Pedido{" "}
                {orderBy.field === "id" &&
                  (orderBy.direction === "asc" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => handleSort("data_inicio")}
                style={{ cursor: "pointer" }}
              >
                Data de Início{" "}
                {orderBy.field === "data_inicio" &&
                  (orderBy.direction === "asc" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => handleSort("data_fim")}
                style={{ cursor: "pointer" }}
              >
                Data de Término{" "}
                {orderBy.field === "data_fim" &&
                  (orderBy.direction === "asc" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => handleSort("cliente.nome")}
                style={{ cursor: "pointer" }}
              >
                Cliente{" "}
                {orderBy.field === "cliente.nome" &&
                  (orderBy.direction === "asc" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => handleSort("valor_total")}
                style={{ cursor: "pointer" }}
              >
                Valor Total{" "}
                {orderBy.field === "valor_total" &&
                  (orderBy.direction === "asc" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => handleSort("status")}
                style={{ cursor: "pointer" }}
              >
                Status{" "}
                {orderBy.field === "status" &&
                  (orderBy.direction === "asc" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  ))}
              </TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow
                key={order.id}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                  "&:hover": { backgroundColor: "#e0f7fa" },
                }}
              >
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.data_inicio || "Data Indisponível"}
                </TableCell>
                <TableCell>{order.data_fim || "Data Indisponível"}</TableCell>
                <TableCell>{order.cliente?.nome || "Não informado"}</TableCell>
                <TableCell>{`R$ ${(order.valor_total ?? 0).toFixed(
                  2
                )}`}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status === "concluído" ? "Concluído" : "Ativo"}
                    color={order.status === "concluído" ? "success" : "error"}
                    sx={{
                      backgroundColor:
                        order.status === "concluído" ? "#d1f7d1" : "#ffebee",
                      color:
                        order.status === "concluído" ? "#388e3c" : "#d32f2f",
                      fontWeight: "bold",
                    }}
                    icon={
                      order.status === "concluído" ? (
                        <Check />
                      ) : (
                        <WarningAmber />
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <DetailsButton onClick={() => handleOpenDetails(order)} />
                  <ReturnButton onClick={() => handleConfirmReturn(order.id)} />
                  <ExtendButton onClick={() => handleExtendOrder(order.id)} />
                  <CompleteButton onClick={() => handleEarlyReturn(order.id)} />
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
                      {item.nome_item} - Quantidade: {item.quantidade} (
                      {item.tipo_item})
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>Nenhum item locado.</Typography>
              )}
              <Typography variant="h6" style={{ marginTop: "1em" }}>
                Detalhes da Locação
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

      {/* Modal de Confirmação de Devolução */}
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

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default OrdersTable;
