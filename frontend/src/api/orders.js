// frontend/src/api/orders.js
import axios from "axios";

// Definição do URL base da API; ajuste conforme necessário.
const API_URL = "http://127.0.0.1:5000"; // Substitua conforme necessário para produção

/**
 * Busca todos os pedidos (locações) do backend.
 * @returns {Array} Lista de pedidos
 */
export const fetchOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/locacoes`);
    return response.data; // Verifique se a estrutura de dados é a esperada
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error.response || error.message);
    throw new Error("Erro ao buscar pedidos. Tente novamente.");
  }
};

/**
 * Atualiza o status de um pedido.
 * @param {Number} orderId - ID do pedido
 * @param {String} status - Novo status do pedido
 * @returns {Object} Resposta da API
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`${API_URL}/locacoes/${orderId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao atualizar status do pedido ${orderId}:`,
      error.response || error.message
    );
    throw new Error("Erro ao atualizar o status do pedido. Tente novamente.");
  }
};

/**
 * Prorroga um pedido por um número específico de dias.
 * @param {Number} orderId - ID do pedido
 * @param {Number} days - Número de dias adicionais para a prorrogação
 * @returns {Object} Resposta da API
 */
export const extendOrder = async (orderId, days) => {
  try {
    const response = await axios.put(
      `${API_URL}/locacoes/${orderId}/prorrogacao`,
      { dias_adicionais: days }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao prorrogar pedido ${orderId} em ${days} dias:`,
      error.response || error.message
    );
    throw new Error("Erro ao prorrogar o pedido. Tente novamente.");
  }
};

/**
 * Marca um pedido como concluído antecipadamente.
 * @param {Number} orderId - ID do pedido
 * @returns {Object} Resposta da API
 */
export const completeOrderEarly = async (orderId) => {
  try {
    const response = await axios.post(
      `${API_URL}/locacoes/${orderId}/devolucao`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao concluir pedido antecipadamente ${orderId}:`,
      error.response || error.message
    );
    throw new Error(
      "Erro ao completar o pedido antecipadamente. Tente novamente."
    );
  }
};
