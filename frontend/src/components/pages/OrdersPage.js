// OrdersPage.js
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import OrdersTable from "../tables/OrdersTable"; // Importa o componente da tabela de pedidos

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

      {/* Conteúdo da Tabela */}
      <Box sx={{ mt: 4 }}>
        <OrdersTable />
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
