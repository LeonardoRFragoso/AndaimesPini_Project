import axios from "axios";

// Definição do URL base da API; ajuste conforme necessário.
const API_URL = "http://127.0.0.1:5000"; // Ajuste conforme necessário para produção

/**
 * Busca todos os pedidos (locações) do backend.
 * @returns {Array} Lista de pedidos
 */
export const fetchOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/locacoes`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error.response || error.message);
    throw new Error("Erro ao buscar pedidos. Tente novamente.");
  }
};

/**
 * Busca os pedidos (locações) associados a um cliente específico.
 * Inclui detalhes de itens locados.
 * @param {Number} clientId - ID do cliente
 * @returns {Array} Lista de pedidos do cliente, incluindo detalhes dos itens locados
 */
export const fetchOrdersByClient = async (clientId) => {
  try {
    const response = await axios.get(`${API_URL}/locacoes/cliente/${clientId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao buscar pedidos do cliente ${clientId}:`,
      error.response || error.message
    );
    throw new Error("Erro ao buscar pedidos do cliente. Tente novamente.");
  }
};

/**
 * Atualiza o status de um pedido.
 * @param {Number} orderId - ID do pedido
 * @param {String} status - Novo status do pedido
 * @returns {Object} Resposta da API com detalhes do pedido atualizado
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/locacoes/${orderId}/status`,
      { status }
    );
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
 * @param {Number} novoValorTotal - Novo valor total da locação após prorrogação
 * @param {Number} [abatimento=0] - Abatimento opcional a ser aplicado
 * @returns {Object} Resposta da API com os novos detalhes do pedido prorrogado,
 * incluindo a data de término original e a nova data de término.
 */
export const extendOrder = async (
  orderId,
  days,
  novoValorTotal,
  abatimento = 0
) => {
  try {
    const response = await axios.put(
      `${API_URL}/locacoes/${orderId}/prorrogar`,
      {
        dias_adicionais: days,
        novo_valor_total: novoValorTotal,
        abatimento, // Aqui o abatimento é enviado no corpo da requisição
      }
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
 * Marca um pedido como concluído antecipadamente e restaura o estoque.
 * @param {Number} orderId - ID do pedido
 * @param {String} novaDataFim - Nova data de término da locação (formato yyyy-MM-dd)
 * @param {Number} novoValorFinal - Novo valor total após finalizar antecipadamente
 * @returns {Object} Resposta da API confirmando a conclusão antecipada, com os detalhes atualizados do pedido
 */
export const completeOrderEarly = async (
  orderId,
  novaDataFim,
  novoValorFinal
) => {
  try {
    const response = await axios.put(
      `${API_URL}/locacoes/${orderId}/finalizar_antecipadamente`,
      {
        nova_data_fim: novaDataFim,
        novo_valor_final: novoValorFinal,
      }
    );
    return response.data; // Inclui detalhes do pedido atualizado
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

/**
 * Reativa um pedido concluído, alterando seu status para ativo e removendo os itens do estoque.
 * @param {Number} orderId - ID do pedido
 * @returns {Object} Resposta da API confirmando a reativação do pedido
 */
export const reactivateOrder = async (orderId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/locacoes/${orderId}/reativar`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao reativar pedido ${orderId}:`,
      error.response || error.message
    );
    throw new Error("Erro ao reativar o pedido. Tente novamente.");
  }
};

/**
 * Registra um problema em um item locado específico.
 * @param {Number} orderId - ID do pedido
 * @param {Number} itemId - ID do item com problema
 * @param {String} descricaoProblema - Descrição do problema encontrado
 * @returns {Object} Resposta da API confirmando o registro do problema
 */
export const reportProblem = async (orderId, itemId, descricaoProblema) => {
  try {
    const response = await axios.post(
      `${API_URL}/locacoes/${orderId}/problema`,
      {
        item_id: itemId,
        descricao_problema: descricaoProblema,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao reportar problema para o item ${itemId} no pedido ${orderId}:`,
      error.response || error.message
    );
    throw new Error("Erro ao reportar problema no pedido. Tente novamente.");
  }
};

/**
 * Busca os detalhes de uma locação específica.
 * @param {Number} orderId - ID do pedido
 * @returns {Object} Detalhes completos da locação, incluindo datas e valores ajustados
 */
export const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/locacoes/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao buscar detalhes do pedido ${orderId}:`,
      error.response || error.message
    );
    throw new Error("Erro ao buscar detalhes do pedido. Tente novamente.");
  }
};
