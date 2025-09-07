import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Componente para proteger rotas que requerem autenticação
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Se ainda estiver carregando, não renderiza nada
  if (loading) {
    return null;
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota for apenas para administradores e o usuário não for admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, renderiza o conteúdo da rota
  return children;
};

export default ProtectedRoute;
