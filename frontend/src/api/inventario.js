// src/api/inventario.js
// Serviço de API para gerenciamento de inventário
import api from './config';

// Listar todos os itens do inventário
export const listarItens = (apenasDisponiveis = false) => {
  return api.get(`/inventario${apenasDisponiveis ? '?disponivel=true' : ''}`);
};

// Obter um item específico pelo ID
export const obterItem = (id) => {
  return api.get(`/inventario/${id}`);
};

// Criar um novo item no inventário
export const criarItem = (item) => {
  return api.post('/inventario', item);
};

// Atualizar um item existente
export const atualizarItem = (id, dados) => {
  return api.put(`/inventario/${id}`, dados);
};

// Excluir um item do inventário
export const excluirItem = (id) => {
  return api.delete(`/inventario/${id}`);
};

// Atualizar o estoque de um item
export const atualizarEstoque = (id, quantidade, operacao = 'decrease') => {
  return api.patch(`/inventario/${id}/estoque`, { quantidade, operacao });
};
