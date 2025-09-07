// src/api/clientes.js
// Serviço de API para gerenciamento de clientes
import api from './config';

// Listar todos os clientes
export const listarClientes = () => {
  return api.get('/clientes');
};

// Obter um cliente específico pelo ID
export const obterCliente = (id) => {
  return api.get(`/clientes/${id}`);
};

// Criar um novo cliente
export const criarCliente = (cliente) => {
  return api.post('/clientes', cliente);
};

// Atualizar um cliente existente
export const atualizarCliente = (id, dados) => {
  return api.put(`/clientes/${id}`, dados);
};

// Excluir um cliente
export const excluirCliente = (id) => {
  return api.delete(`/clientes/${id}`);
};

// Obter pedidos de um cliente específico
export const obterPedidosCliente = (id) => {
  return api.get(`/clientes/${id}/pedidos`);
};
