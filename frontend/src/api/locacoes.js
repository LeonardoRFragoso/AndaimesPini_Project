// src/api/locacoes.js
// Serviço de API para gerenciamento de locações
import api from './config';

// Listar todas as locações
export const listarLocacoes = () => {
  return api.get('/locacoes');
};

// Obter uma locação específica pelo ID
export const obterLocacao = (id) => {
  return api.get(`/locacoes/${id}`);
};

// Criar uma nova locação
export const criarLocacao = (locacao) => {
  return api.post('/locacoes', locacao);
};

// Atualizar o status de uma locação
export const atualizarStatus = (id, status) => {
  return api.patch(`/locacoes/${id}/status`, { status });
};

// Confirmar devolução de uma locação
export const confirmarDevolucao = (id) => {
  return api.post(`/locacoes/${id}/confirmar-devolucao`);
};

// Prorrogar uma locação
export const prorrogarLocacao = (id, dados) => {
  return api.post(`/locacoes/${id}/prorrogar`, dados);
};

// Finalizar uma locação antecipadamente
export const finalizarAntecipadamente = (id, dados) => {
  return api.post(`/locacoes/${id}/finalizar-antecipadamente`, dados);
};
