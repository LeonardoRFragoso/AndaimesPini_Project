import axios from 'axios';
import api from './config';

const API_BASE_URL = 'http://localhost:5000';
const NOTIFICACOES_URL = `${API_BASE_URL}/notificacoes`;

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
      const response = await axios.get(NOTIFICACOES_URL);
      return response.data;
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
      const response = await axios.get(`${NOTIFICACOES_URL}/nao-lidas`);
      return response.data;
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
      const response = await axios.put(`${NOTIFICACOES_URL}/${id}/marcar-lida`);
      return response.data;
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
      const response = await axios.put(`${NOTIFICACOES_URL}/marcar-todas-lidas`);
      return response.data;
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
      const response = await axios.delete(`${NOTIFICACOES_URL}/${id}`);
      return response.data;
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
      const response = await axios.post(NOTIFICACOES_URL, dados);
      return response.data;
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
      const response = await axios.post(`${NOTIFICACOES_URL}/gerar-automaticas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar notificações automáticas:', error);
      throw error;
    }
  }
};

export default NotificacoesService;
