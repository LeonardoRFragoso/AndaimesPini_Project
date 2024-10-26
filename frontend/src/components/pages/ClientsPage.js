// ClientsPage.js
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
} from "@mui/material";

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:5000/clientes");
      if (!response.ok) {
        throw new Error("Erro ao buscar clientes");
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setSnackbarMessage("Erro ao buscar clientes.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleAddClient = async () => {
    const newClient = {
      nome: "Novo Cliente",
      endereco: "Endereço do Novo Cliente",
      telefone: "123456789",
      referencia: "Referência do Cliente",
    };
    try {
      const response = await fetch("http://localhost:5000/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClient),
      });

      if (response.ok) {
        fetchClients();
        setSnackbarMessage("Cliente adicionado com sucesso!");
        setOpenSnackbar(true);
      } else {
        throw new Error("Erro ao adicionar cliente");
      }
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      setSnackbarMessage("Erro ao adicionar cliente.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditClient = async (id) => {
    const updatedClient = {
      nome: "Cliente Editado",
      endereco: "Novo Endereço",
      telefone: "987654321",
      referencia: "Nova Referência",
    };
    try {
      const response = await fetch(`http://localhost:5000/clientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedClient),
      });

      if (response.ok) {
        fetchClients();
        setSnackbarMessage("Cliente editado com sucesso!");
        setOpenSnackbar(true);
      } else {
        throw new Error("Erro ao editar cliente");
      }
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
      setSnackbarMessage("Erro ao editar cliente.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/clientes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchClients();
        setSnackbarMessage("Cliente removido com sucesso!");
        setOpenSnackbar(true);
      } else {
        throw new Error("Erro ao remover cliente");
      }
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      setSnackbarMessage("Erro ao remover cliente.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Clientes
      </Typography>
      <Button variant="contained" color="primary" onClick={handleAddClient}>
        Adicionar Novo Cliente
      </Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.nome}</TableCell>
                <TableCell>{client.endereco}</TableCell>
                <TableCell>{client.telefone}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditClient(client.id)}>
                    Editar
                  </Button>
                  <Button onClick={() => handleDeleteClient(client.id)}>
                    Remover
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
    </Box>
  );
};

export default ClientsPage;
