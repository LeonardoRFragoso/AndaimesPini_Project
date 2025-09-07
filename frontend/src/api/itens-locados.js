// src/api/itens-locados.js
// Serviço de API para gerenciamento de itens locados
import api from './config';

// Obter itens de uma locação específica
export const obterItensPorLocacao = (locacaoId) => {
  return api.get(`/itens-locados/locacao/${locacaoId}`);
};

// Adicionar um item a uma locação
export const adicionarItem = (locacaoId, itemId, quantidade) => {
  return api.post('/itens-locados/adicionar', {
    locacao_id: locacaoId,
    item_id: itemId,
    quantidade
  });
};

// Marcar um item como devolvido
export const marcarComoDevolvido = (locacaoId, itemId = null, dataDevolucao = null) => {
  const dados = {
    locacao_id: locacaoId
  };
  
  if (itemId) dados.item_id = itemId;
  if (dataDevolucao) dados.data_devolucao = dataDevolucao;
  
  return api.post('/itens-locados/devolver', dados);
};

// Registrar um problema com um item
export const registrarProblema = (locacaoId, itemId, descricaoProblema) => {
  return api.post('/itens-locados/problema', {
    locacao_id: locacaoId,
    item_id: itemId,
    descricao_problema: descricaoProblema
  });
};
