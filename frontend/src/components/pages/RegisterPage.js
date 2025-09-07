// RegisterPage.js
import React from "react";
import { Typography, Box } from "@mui/material";
import PageLayout from "../layouts/PageLayout";
import RegisterFormContainer from "../Forms/RegisterFormContainer"; // Atualizado para usar o novo componente

const RegisterPage = () => {
  return (
    <PageLayout>
      {/* Formulário de Registro */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <RegisterFormContainer /> {/* Atualizado para usar o novo componente */}
      </Box>
    </PageLayout>
  );
};

export default RegisterPage;
