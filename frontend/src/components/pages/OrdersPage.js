// frontend/src/components/pages/OrdersPage.js

import React, { useState } from "react";
import { Box, Typography, Button, Snackbar } from "@mui/material";
import { Link } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import OrdersListView from "../Orders/OrdersListView";

const OrdersPage = () => {
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Função para exibir mensagem de feedback
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  return (
    <PageLayout>
      {/* Cabeçalho da página */}
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ color: "#2c552d", fontWeight: "bold", marginTop: "20px" }}
      >
        Visualizar Pedidos
      </Typography>
      <Typography
        variant="body1"
        paragraph
        align="center"
        sx={{ color: "#666", marginBottom: "20px" }}
      >
        Aqui você pode visualizar todos os pedidos realizados.
      </Typography>

      {/* Conteúdo do OrdersListView com passagem da função de feedback */}
      <Box sx={{ mt: 4 }}>
        <OrdersListView showSnackbar={showSnackbar} />
      </Box>

      {/* Botão para voltar à HomePage */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          sx={{
            backgroundColor: "#2c552d",
            "&:hover": { backgroundColor: "#45a049" },
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Voltar para Início
        </Button>
      </Box>

      {/* Snackbar para exibir mensagens de feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor: "#333", // Fundo escuro para contraste
            color: "#fff", // Texto claro para melhor leitura
            fontSize: "1rem",
          },
        }}
      />
    </PageLayout>
  );
};

export default OrdersPage;
