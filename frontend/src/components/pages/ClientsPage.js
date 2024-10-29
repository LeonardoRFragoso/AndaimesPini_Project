import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]); // Armazena os pedidos do cliente selecionado
  const [openOrdersModal, setOpenOrdersModal] = useState(false); // Controle do modal de pedidos
  const [selectedClient, setSelectedClient] = useState(null); // Cliente atualmente selecionado
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add"); // "add" ou "edit"
  const [currentClient, setCurrentClient] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    referencia: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:5000/clientes");
      if (!response.ok) throw new Error("Erro ao buscar clientes");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao buscar clientes.", "error");
    }
  };

  const fetchClientOrders = async (clientId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/clientes/${clientId}/pedidos`
      );
      if (!response.ok) throw new Error("Erro ao buscar pedidos do cliente");
      const data = await response.json();
      setOrders(data);
      setOpenOrdersModal(true);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao buscar pedidos do cliente.", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleDialogOpen = (type, client = null) => {
    setDialogType(type);
    if (client) {
      setCurrentClient(client);
    } else {
      setCurrentClient({
        nome: "",
        endereco: "",
        telefone: "",
        referencia: "",
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogSave = async () => {
    if (dialogType === "add") {
      await handleAddClient();
    } else {
      await handleEditClient(currentClient.id);
    }
    handleDialogClose();
  };

  const handleAddClient = async () => {
    try {
      const response = await fetch("http://localhost:5000/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentClient),
      });
      if (response.ok) {
        fetchClients();
        showSnackbar("Cliente adicionado com sucesso!");
      } else {
        throw new Error("Erro ao adicionar cliente");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao adicionar cliente.", "error");
    }
  };

  const handleEditClient = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentClient),
      });
      if (response.ok) {
        fetchClients();
        showSnackbar("Cliente editado com sucesso!");
      } else {
        throw new Error("Erro ao editar cliente");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao editar cliente.", "error");
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este cliente?")) return;
    try {
      const response = await fetch(`http://localhost:5000/clientes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchClients();
        showSnackbar("Cliente removido com sucesso!");
      } else {
        throw new Error("Erro ao remover cliente");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao remover cliente.", "error");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenOrdersModal = (client) => {
    setSelectedClient(client);
    fetchClientOrders(client.id);
  };

  const handleCloseOrdersModal = () => {
    setOpenOrdersModal(false);
    setOrders([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Clientes
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleDialogOpen("add")}
      >
        Adicionar Novo Cliente
      </Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
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
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.nome}</TableCell>
                <TableCell>{client.endereco}</TableCell>
                <TableCell>{client.telefone}</TableCell>
                <TableCell>{client.referencia}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDialogOpen("edit", client)}
                    color="primary"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteClient(client.id)}
                    color="secondary"
                  >
                    Remover
                  </Button>
                  <Button
                    onClick={() => handleOpenOrdersModal(client)}
                    color="info"
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
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Modal para visualização dos pedidos */}
      <Dialog
        open={openOrdersModal}
        onClose={handleCloseOrdersModal}
        maxWidth="md"
      >
        <DialogTitle>Pedidos de {selectedClient?.nome}</DialogTitle>
        <DialogContent>
          {orders.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data de Início</TableCell>
                    <TableCell>Data de Término</TableCell>
                    <TableCell>Valor Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Nome do Item</TableCell>
                    <TableCell>Tipo do Item</TableCell>
                    <TableCell>Quantidade Locada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {new Date(order.data_inicio).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(order.data_fim).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.valor_total)}
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.nome_item}</TableCell>
                      <TableCell>{order.tipo_item}</TableCell>
                      <TableCell>{order.quantidade_locada}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Nenhum pedido encontrado para este cliente.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrdersModal} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsPage;
