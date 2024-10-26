// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "./components/layouts/Navbar";
import HomePage from "./components/pages/HomePage"; // Ajustado para refletir o caminho
import RegisterPage from "./components/pages/RegisterPage"; // Ajustado para refletir o caminho
import OrdersPage from "./components/pages/OrdersPage"; // Ajustado para refletir o caminho
import InventoryPage from "./components/pages/inventory/InventoryPage.js"; // Ajustado para refletir o caminho
import "./App.css";

function App() {
  return (
    <Router>
      {/* CssBaseline aplica um reset de CSS padrão do Material-UI */}
      <CssBaseline />

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* Navbar no topo */}
        <Navbar />

        {/* Conteúdo principal ocupando toda a largura */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            transition: "margin-left 0.3s ease",
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
