// RegisterPage.js
import React from "react";
import { Typography, Box } from "@mui/material";
import PageLayout from "../layouts/PageLayout";
import RegisterFormContainer from "../Forms/RegisterFormContainer"; // Atualizado para usar o novo componente

const RegisterPage = () => {
  return (
    <PageLayout>
      {/* Cabeçalho da página */}
      <Typography variant="h4" gutterBottom align="center">
        Registrar Nova Locação
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Preencha os dados abaixo para registrar uma nova locação.
      </Typography>

      {/* Formulário de Registro */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <RegisterFormContainer /> {/* Atualizado para usar o novo componente */}
      </Box>
    </PageLayout>
  );
};

export default RegisterPage;
