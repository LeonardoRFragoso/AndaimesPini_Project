// src/api/auth.js
// Serviço de API para autenticação e gerenciamento de usuários
import api from './config';

// Login de usuário
export const login = (email, senha) => {
  return api.post('/auth/login', { email, senha });
};

// Logout de usuário
export const logout = () => {
  return api.post('/auth/logout');
};

// Verificar se o token é válido
export const verificarToken = () => {
  return api.get('/auth/verificar');
};

// Listar todos os usuários (apenas para administradores)
export const listarUsuarios = () => {
  return api.get('/auth/usuarios');
};

// Criar um novo usuário (apenas para administradores)
export const criarUsuario = (usuario) => {
  return api.post('/auth/usuarios', usuario);
};

// Atualizar um usuário existente (apenas para administradores)
export const atualizarUsuario = (id, dados) => {
  return api.put(`/auth/usuarios/${id}`, dados);
};

// Excluir um usuário (apenas para administradores)
export const excluirUsuario = (id) => {
  return api.delete(`/auth/usuarios/${id}`);
};

// Função para salvar dados do usuário e token no localStorage
export const salvarSessao = (token, usuario) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(usuario));
};

// Função para limpar dados de sessão do localStorage
export const limparSessao = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Função para obter dados do usuário logado
export const getUsuarioLogado = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Função para verificar se o usuário está autenticado
export const isAutenticado = () => {
  return !!localStorage.getItem('authToken');
};

// Função para verificar se o usuário é administrador
export const isAdmin = () => {
  const usuario = getUsuarioLogado();
  return usuario && usuario.cargo === 'admin';
};
