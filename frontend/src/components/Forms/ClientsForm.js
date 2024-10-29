import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";

const ClientsForm = ({ onSave }) => {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [referencia, setReferencia] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Função para lidar com o envio do formulário
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Verificação básica para campos obrigatórios
    if (!nome || !telefone) {
      showSnackbar("Nome e telefone são obrigatórios!", "warning");
      return;
    }

    // Objeto do cliente a ser enviado
    const novoCliente = { nome, endereco, telefone, referencia };

    try {
      const response = await fetch("http://localhost:5000/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novoCliente),
      });

      if (response.ok) {
        // Limpa os campos e notifica o sucesso
        onSave(); // Atualiza a lista de clientes
        resetForm();
        showSnackbar("Cliente adicionado com sucesso!", "success");
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || "Erro ao adicionar cliente.", "error");
        console.error("Erro ao adicionar cliente:", errorData);
      }
    } catch (error) {
      showSnackbar("Erro ao adicionar cliente.", "error");
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  // Função para mostrar notificações
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Função para fechar o snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Função para resetar o formulário após salvar com sucesso
  const resetForm = () => {
    setNome("");
    setEndereco("");
    setTelefone("");
    setReferencia("");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Adicionar Cliente
      </Typography>
      <TextField
        label="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        required
        fullWidth
        margin="normal"
        type="tel" // Tipo de input específico para telefone
      />
      <TextField
        label="Referência"
        value={referencia}
        onChange={(e) => setReferencia(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        Salvar
      </Button>
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
    </Box>
  );
};

export default ClientsForm;
