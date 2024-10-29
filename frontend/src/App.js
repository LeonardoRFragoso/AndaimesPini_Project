// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "./components/layouts/Navbar";
import HomePage from "./components/pages/HomePage"; // Página inicial
import RegisterFormContainer from "./components/Forms/RegisterFormContainer"; // Container para registrar locação
import OrdersPage from "./components/pages/OrdersPage"; // Página para visualizar pedidos
import InventoryPage from "./components/pages/inventory/InventoryPage"; // Página para controle de estoque
import ClientsPage from "./components/pages/ClientsPage"; // Página para gerenciar clientes
import ClientOrdersView from "./components/Orders/ClientOrdersView"; // Página para pedidos específicos de um cliente
import ReportsPage from "./components/pages/ReportsPage"; // Página de relatórios
import "./App.css";

function App() {
  return (
    <Router>
      <CssBaseline /> {/* Reset de estilos do navegador */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Navbar /> {/* Navbar fixa no topo */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, // Ajuste de margem para o conteúdo principal
            transition: "margin-left 0.3s ease", // Transição suave (caso tenha sidebar)
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} /> {/* Rota inicial */}
            <Route path="/register" element={<RegisterFormContainer />} />{" "}
            {/* Formulário de registro */}
            <Route path="/orders" element={<OrdersPage />} />{" "}
            {/* Visualização de pedidos */}
            <Route path="/inventory" element={<InventoryPage />} />{" "}
            {/* Controle de estoque */}
            <Route path="/clientes" element={<ClientsPage />} />{" "}
            {/* Gerenciamento de clientes */}
            <Route
              path="/clientes/:clientId/pedidos"
              element={<ClientOrdersView />}
            />{" "}
            {/* Pedidos específicos de um cliente */}
            <Route path="/reports" element={<ReportsPage />} />{" "}
            {/* Página de relatórios */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
