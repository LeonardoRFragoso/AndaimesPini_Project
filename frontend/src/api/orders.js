// frontend/src/api/orders.js
import axios from "axios";

const API_URL = "/api"; // ajuste conforme necessário

export const fetchOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/locacoes`);
    return response.data; // Verifique se a estrutura de dados é a esperada
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    throw error; // Propaga o erro para ser tratado em outro lugar
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`${API_URL}/locacoes/${orderId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    throw error;
  }
};

export const extendOrder = async (orderId, days) => {
  try {
    const response = await axios.put(
      `${API_URL}/locacoes/${orderId}/prorrogacao`,
      { dias_adicionais: days }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao prorrogar pedido:", error);
    throw error;
  }
};

export const completeOrderEarly = async (orderId) => {
  try {
    const response = await axios.post(
      `${API_URL}/locacoes/${orderId}/devolucao`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao completar pedido antecipadamente:", error);
    throw error;
  }
};
