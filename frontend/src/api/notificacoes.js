import api from './config';

/**
 * Serviço para gerenciar notificações
 */
export const NotificacoesService = {
  /**
   * Obtém todas as notificações
   * @returns {Promise} Promise com os dados das notificações
   */
  obterTodas: async () => {
    try {
      const response = await api.get('/notificacoes');
      return response;
    } catch (error) {
      console.error('Erro ao obter notificações:', error);
      throw error;
    }
  },

  /**
   * Obtém apenas notificações não lidas
   * @returns {Promise} Promise com os dados das notificações não lidas
   */
  obterNaoLidas: async () => {
    try {
      const response = await api.get('/notificacoes/nao-lidas');
      return response;
    } catch (error) {
      console.error('Erro ao obter notificações não lidas:', error);
      throw error;
    }
  },

  /**
   * Marca uma notificação específica como lida
   * @param {number} id - ID da notificação
   * @returns {Promise} Promise com o resultado da operação
   */
  marcarComoLida: async (id) => {
    try {
      const response = await api.put(`/notificacoes/${id}/marcar-lida`);
      return response;
    } catch (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error);
      throw error;
    }
  },

  /**
   * Marca todas as notificações como lidas
   * @returns {Promise} Promise com o resultado da operação
   */
  marcarTodasComoLidas: async () => {
    try {
      const response = await api.put('/notificacoes/marcar-todas-lidas');
      return response;
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      throw error;
    }
  },

  /**
   * Exclui uma notificação específica
   * @param {number} id - ID da notificação
   * @returns {Promise} Promise com o resultado da operação
   */
  excluir: async (id) => {
    try {
      const response = await api.delete(`/notificacoes/${id}`);
      return response;
    } catch (error) {
      console.error(`Erro ao excluir notificação ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria uma nova notificação
   * @param {Object} dados - Dados da notificação
   * @returns {Promise} Promise com o resultado da operação
   */
  criar: async (dados) => {
    try {
      const response = await api.post('/notificacoes', dados);
      return response;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  },

  /**
   * Gera notificações automáticas com base em condições do sistema
   * @returns {Promise} Promise com o resultado da operação
   */
  gerarAutomaticas: async () => {
    try {
      const response = await api.post('/notificacoes/gerar-automaticas');
      return response;
    } catch (error) {
      console.error('Erro ao gerar notificações automáticas:', error);
      throw error;
    }
  }
};

export default NotificacoesService;
