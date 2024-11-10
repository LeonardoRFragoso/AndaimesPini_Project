import React, { useState } from "react";
import { Box, Button, Snackbar } from "@mui/material";
import { Link } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import OrdersListView from "../Orders/OrdersListView"; // Importação do componente OrdersListView refatorado

const OrdersPage = () => {
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Mensagem do Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Controle do Snackbar

  /**
   * Exibe uma mensagem de feedback no Snackbar.
   * @param {string} message - Mensagem a ser exibida.
   */
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  /**
   * Fecha o Snackbar e limpa a mensagem.
   */
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  return (
    <PageLayout>
      {/* Componente OrdersListView com o título interno */}
      <Box sx={{ mt: 4 }}>
        <OrdersListView onSnackbarMessage={showSnackbar} showTitle />
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
            backgroundColor: "#333",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "10px",
            borderRadius: "8px",
          },
        }}
      />
    </PageLayout>
  );
};

export default OrdersPage;
