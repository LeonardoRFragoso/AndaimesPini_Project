// PageLayout.js
import React from "react";
import { Box } from "@mui/material";
import Navbar from "./Navbar";

const PageLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Navbar no topo */}
      <Navbar />

      {/* Conteúdo principal ocupando toda a largura */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;
