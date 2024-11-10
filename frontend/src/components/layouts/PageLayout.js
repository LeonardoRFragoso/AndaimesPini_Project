// PageLayout.js
import React from "react";
import { Box } from "@mui/material";
import Navbar from "./Navbar";

const PageLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh", // Garante que o layout ocupe 100% da altura da tela
        overflow: "hidden", // Remove rolagens desnecessárias
      }}
    >
      {/* Navbar no topo */}
      <Navbar />

      {/* Conteúdo principal ocupando toda a largura e altura disponível */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          overflowY: "auto", // Adiciona rolagem apenas para o conteúdo principal
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;
