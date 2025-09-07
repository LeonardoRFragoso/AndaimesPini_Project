// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/layouts/Navbar";
import ThemeToggleButton from "./components/ThemeToggleButton";
import HomePage from "./components/pages/HomePage"; // Página inicial
import RegisterPage from "./components/pages/RegisterPage"; // Página de registro de locação
import OrdersPage from "./components/pages/OrdersPage"; // Página para visualizar pedidos
import InventoryPage from "./components/pages/inventory/InventoryPage"; // Página para controle de estoque
import ClientsPage from "./components/pages/ClientsPage"; // Página para gerenciar clientes
import ClientOrdersView from "./components/Orders/ClientOrdersView"; // Página para pedidos específicos de um cliente
import ReportsPage from "./components/pages/ReportsPage"; // Página de relatórios
import OverdueOrdersPage from "./components/pages/OverdueOrdersPage"; // Página para pedidos atrasados
import LoginPage from "./components/Auth/LoginPage"; // Página de login
import ProtectedRoute from "./components/Auth/ProtectedRoute"; // Componente de proteção de rotas

// Contextos
import { AuthProvider } from "./contexts/AuthContext"; // Contexto de autenticação
import { ThemeProvider } from "./contexts/ThemeContext"; // Contexto de tema

// Estilos
import "./App.css";

// Feedback global
import { SnackbarProvider } from "notistack";

// Import future flags configuration
import "./router-config";

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: "column",
                height: "100vh", // Full viewport height
                overflow: "hidden" // Prevent double scrollbars
              }}
            >
              <Navbar /> {/* Navbar fixa no topo */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  mt: 8, // Ajuste de margem para o conteúdo principal
                  transition: "margin-left 0.3s ease", // Transição suave (caso tenha sidebar)
                  overflowY: "auto", // Single scrollbar for content
                  height: "calc(100vh - 64px)" // Full height minus navbar
                }}
              >
                {/* Theme toggle button */}
                <ThemeToggleButton position="bottom-right" size="large" />
                <Routes>
                  {/* Rota pública de login */}
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Rota inicial protegida */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Rotas protegidas que requerem autenticação */}
                  <Route 
                    path="/register" 
                    element={
                      <ProtectedRoute>
                        <RegisterPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/inventory" 
                    element={
                      <ProtectedRoute>
                        <InventoryPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/clientes" 
                    element={
                      <ProtectedRoute>
                        <ClientsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route
                    path="/clientes/:clientId/pedidos"
                    element={
                      <ProtectedRoute>
                        <ClientOrdersView />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route 
                    path="/reports" 
                    element={
                      <ProtectedRoute>
                        <ReportsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/overdue-orders" 
                    element={
                      <ProtectedRoute>
                        <OverdueOrdersPage />
                      </ProtectedRoute>
                    } 
                  />
              </Routes>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
