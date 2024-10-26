// RegisterPage.js
import React from "react";
import { Typography, Box } from "@mui/material";
import PageLayout from "../layouts/PageLayout";
import RegisterForm from "../Forms/RegisterForm";

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
        <RegisterForm />
      </Box>
    </PageLayout>
  );
};

export default RegisterPage;
