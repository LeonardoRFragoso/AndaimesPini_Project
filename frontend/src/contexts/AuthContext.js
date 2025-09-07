import React, { createContext, useState, useEffect, useContext } from 'react';
import { verificarToken, getUsuarioLogado, isAutenticado, limparSessao } from '../api/auth';

// Criação do contexto de autenticação
const AuthContext = createContext(null);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticação ao carregar o componente
  useEffect(() => {
    const checkAuth = async () => {
      if (isAutenticado()) {
        try {
          // Verificar se o token é válido
          const response = await verificarToken();
          setCurrentUser(response.data.usuario);
        } catch (err) {
          console.error('Erro ao verificar token:', err);
          // Se o token for inválido, limpar a sessão
          limparSessao();
          setCurrentUser(null);
        }
      } else {
        // Se não houver token, definir usuário como null
        setCurrentUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Função para fazer login
  const login = (user, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
  };

  // Função para fazer logout
  const logout = () => {
    limparSessao();
    setCurrentUser(null);
  };

  // Valor do contexto
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAdmin: currentUser?.cargo === 'admin',
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
