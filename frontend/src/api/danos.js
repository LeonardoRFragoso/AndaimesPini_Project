// src/api/danos.js
// Serviço de API para gerenciamento de danos
import api from './config';

// Listar todos os danos
export const listarDanos = () => {
  return api.get('/danos');
};

// Obter danos de uma locação específica
export const obterDanosPorLocacao = (locacaoId) => {
  return api.get(`/danos/${locacaoId}`);
};

// Registrar um novo dano
export const registrarDano = (dano) => {
  return api.post('/danos', dano);
};

// Atualizar um dano existente
export const atualizarDano = (id, dados) => {
  return api.put(`/danos/${id}`, dados);
};

// Excluir um dano
export const excluirDano = (id) => {
  return api.delete(`/danos/${id}`);
};
