import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
} from "@mui/material";

const ClientsTable = ({ onEdit, onDelete }) => {
  const [clientes, setClientes] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [pedidos, setPedidos] = useState([]);

  // Função para buscar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch("http://localhost:5000/clientes");
        if (!response.ok) throw new Error("Erro ao buscar clientes");
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        showSnackbar(
          "Erro ao buscar clientes. Tente novamente mais tarde.",
          "error"
        );
        console.error("Erro ao buscar clientes:", error);
      }
    };

    fetchClientes();
  }, []);

  // Função para buscar pedidos de um cliente específico
  const fetchPedidos = async (clienteId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/clientes/${clienteId}/pedidos`
      );
      if (!response.ok) throw new Error("Erro ao buscar pedidos");
      const data = await response.json();
      setPedidos(data);
      setOpenDialog(true);
    } catch (error) {
      showSnackbar(
        "Erro ao buscar pedidos. Tente novamente mais tarde.",
        "error"
      );
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  // Função para exibir mensagens de feedback
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Função para fechar o snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Função para fechar o diálogo de pedidos
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPedidos([]);
  };

  // Função para agrupar itens por pedido
  const groupPedidosByLocacao = (pedidos) => {
    return pedidos.reduce((acc, pedido) => {
      const { locacao_id } = pedido;
      if (!acc[locacao_id]) {
        acc[locacao_id] = {
          ...pedido,
          itens: [],
        };
      }
      acc[locacao_id].itens.push({
        nome_item: pedido.nome_item,
        tipo_item: pedido.tipo_item,
        quantidade_locada: pedido.quantidade_locada,
      });
      return acc;
    }, {});
  };

  const groupedPedidos = groupPedidosByLocacao(pedidos);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Referência</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nome}</TableCell>
                <TableCell>{cliente.endereco}</TableCell>
                <TableCell>{cliente.telefone}</TableCell>
                <TableCell>{cliente.referencia}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => onEdit(cliente)}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => onDelete(cliente.id)}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Excluir
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedClient(cliente);
                      fetchPedidos(cliente.id);
                    }}
                    color="info"
                    variant="outlined"
                    size="small"
                  >
                    Visualizar Pedidos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Pedidos de {selectedClient?.nome}</DialogTitle>
        <DialogContent>
          {Object.keys(groupedPedidos).length > 0 ? (
            Object.values(groupedPedidos).map((pedido, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <Typography variant="subtitle1">
                  Pedido ID: {pedido.locacao_id} | Início:{" "}
                  {new Date(pedido.data_inicio).toLocaleDateString()} | Fim:{" "}
                  {new Date(pedido.data_fim).toLocaleDateString()} | Valor: R$
                  {pedido.valor_total.toFixed(2)} | Status: {pedido.status}
                </Typography>

                {/* Exibir dados de prorrogação, se disponíveis */}
                {pedido.nova_data_fim && (
                  <Typography variant="body2" color="text.secondary">
                    Prorrogado até:{" "}
                    {new Date(pedido.nova_data_fim).toLocaleDateString()}
                  </Typography>
                )}
                {pedido.valor_final_ajustado && (
                  <Typography variant="body2" color="text.secondary">
                    Valor ajustado: R$ {pedido.valor_final_ajustado.toFixed(2)}
                  </Typography>
                )}
                {pedido.abatimento && (
                  <Typography variant="body2" color="text.secondary">
                    Abatimento aplicado: R$ {pedido.abatimento.toFixed(2)}
                  </Typography>
                )}

                {/* Exibir data de devolução antecipada, se disponível */}
                {pedido.data_devolucao_efetiva && (
                  <Typography variant="body2" color="text.secondary">
                    Devolvido em:{" "}
                    {new Date(
                      pedido.data_devolucao_efetiva
                    ).toLocaleDateString()}
                  </Typography>
                )}

                <Typography variant="body2" sx={{ mt: 1 }}>
                  Itens Locados:
                </Typography>
                {pedido.itens.map((item, idx) => (
                  <DialogContentText key={idx} sx={{ ml: 2 }}>
                    - Nome do Item: {item.nome_item} | Tipo: {item.tipo_item} |
                    Quantidade: {item.quantidade_locada}
                  </DialogContentText>
                ))}
              </div>
            ))
          ) : (
            <DialogContentText>
              Nenhum pedido encontrado para este cliente.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientsTable;
