// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/layouts/Navbar";
import ThemeToggleButton from "./components/ThemeToggleButton";
import HomePage from "./components/pages/HomePage"; // Página inicial (Dashboard)
import LandingPage from "./components/pages/LandingPage"; // Landing Page pública
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

// Componente interno que usa useLocation
function AppContent() {
  const location = useLocation();
  
  // Rotas que não precisam do layout padrão (full-screen)
  const fullScreenRoutes = ['/', '/login'];
  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isFullScreen ? 0 : 3,
          mt: isFullScreen ? 0 : 8,
          transition: "margin-left 0.3s ease",
          overflowY: "auto",
          height: isFullScreen ? "100vh" : "calc(100vh - 64px)"
        }}
      >
        {!isFullScreen && <ThemeToggleButton position="bottom-right" size="large" />}
        <Routes>
          {/* Rotas públicas (full-screen) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
                  
                  {/* Dashboard protegido */}
                  <Route 
                    path="/dashboard" 
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
                    path="/clients" 
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
  );
}

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
