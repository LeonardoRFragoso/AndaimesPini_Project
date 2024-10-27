// frontend/src/components/pages/OrdersPage.js

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import OrdersListView from "../Orders/OrdersListView"; // Caminho correto para o componente OrdersListView

const OrdersPage = () => {
  return (
    <PageLayout>
      {/* Cabeçalho da página */}
      <Typography variant="h4" gutterBottom align="center">
        Visualizar Pedidos
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Aqui você pode visualizar todos os pedidos realizados.
      </Typography>

      {/* Conteúdo do OrdersListView */}
      <Box sx={{ mt: 4 }}>
        <OrdersListView />
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
          }}
        >
          Voltar para Início
        </Button>
      </Box>
    </PageLayout>
  );
};

export default OrdersPage;
