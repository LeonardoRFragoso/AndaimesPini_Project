import axios from "axios";

// Configuração global do axios
const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // Atualize para a URL de produção, se necessário
  timeout: 5000, // Tempo limite para requisições
});

/**
 * Trata os erros das requisições.
 * @param {Error} error - Objeto de erro retornado pelo axios
 */
const handleRequestError = (error) => {
  const status = error.response?.status || "Desconhecido";
  const message =
    error.response?.data?.message || error.message || "Erro desconhecido.";
  console.error(`Erro na requisição (status: ${status}): ${message}`);
  throw new Error(message); // Lança a mensagem do erro
};

/**
 * Busca todos os pedidos (locações) do backend.
 * @returns {Array} Lista de pedidos
 */
export const fetchOrders = async () => {
  try {
    const response = await api.get("/locacoes");
    console.log("Pedidos carregados com sucesso:", response.data);
    return response.data;
  } catch (error) {
    handleRequestError(error);
  }
};

/**
 * Busca os pedidos associados a um cliente específico.
 * @param {Number} clientId - ID do cliente
 * @returns {Array} Lista de pedidos do cliente
 */
export const fetchOrdersByClient = async (clientId) => {
  if (!clientId) throw new Error("O ID do cliente é obrigatório.");
  try {
    const response = await api.get(`/locacoes/cliente/${clientId}`);
    console.log(`Pedidos do cliente ${clientId} carregados com sucesso.`);
    return response.data;
  } catch (error) {
    handleRequestError(error);
  }
};

/**
 * Atualiza o status de um pedido.
 * @param {Number} orderId - ID do pedido
 * @param {String} status - Novo status do pedido
 * @returns {Object} Resposta completa da API
 */
export const updateOrderStatus = async (orderId, status) => {
  if (!orderId) throw new Error("O ID do pedido é obrigatório.");
  if (!status) throw new Error("O status do pedido é obrigatório.");
  try {
    console.log(`Atualizando status do pedido ${orderId} para '${status}'...`);
    const response = await api.patch(`/locacoes/${orderId}/status`, { status });
    console.log(
      `Status do pedido ${orderId} atualizado com sucesso para '${status}'.`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao atualizar o status do pedido ${orderId} para '${status}':`,
      error
    );
    handleRequestError(error);
  }
};

/**
 * Prorroga um pedido por um número específico de dias.
 * @param {Number} orderId - ID do pedido
 * @param {Object} extendData - Dados para prorrogação (dias adicionais, novo valor total, abatimento)
 * @returns {Object} Resposta da API
 */
export const extendOrder = async (orderId, extendData) => {
  const {
    dias_adicionais,
    novo_valor_total,
    abatimento = 0,
  } = extendData || {};
  if (!orderId) throw new Error("O ID do pedido é obrigatório.");
  if (!dias_adicionais)
    throw new Error("O número de dias adicionais é obrigatório.");
  if (!novo_valor_total)
    throw new Error("O novo valor total da locação é obrigatório.");
  try {
    console.log(`Prorrogando pedido ${orderId}...`);
    const response = await api.put(`/locacoes/${orderId}/prorrogar`, {
      dias_adicionais,
      novo_valor_total,
      abatimento,
    });
    console.log(`Pedido ${orderId} prorrogado com sucesso.`);
    return response.data;
  } catch (error) {
    handleRequestError(error);
  }
};

/**
 * Conclui um pedido antecipadamente.
 * @param {Number} orderId - ID do pedido
 * @param {Object} completeData - Dados para conclusão antecipada (nova data de término, novo valor final)
 * @returns {Object} Resposta da API
 */
export const completeOrderEarly = async (orderId, completeData) => {
  const { nova_data_fim, novo_valor_final } = completeData || {};
  if (!orderId) throw new Error("O ID do pedido é obrigatório.");
  if (!nova_data_fim) throw new Error("A nova data de término é obrigatória.");
  if (!novo_valor_final)
    throw new Error("O novo valor final da locação é obrigatório.");
  try {
    console.log(`Concluindo pedido ${orderId} antecipadamente...`);
    const response = await api.put(
      `/locacoes/${orderId}/finalizar_antecipadamente`,
      {
        nova_data_fim,
        novo_valor_final,
      }
    );
    console.log(`Pedido ${orderId} concluído antecipadamente com sucesso.`);
    return response.data;
  } catch (error) {
    handleRequestError(error);
  }
};

/**
 * Reativa um pedido concluído.
 * @param {Number} orderId - ID do pedido
 * @returns {Object} Resposta da API
 */
export const reactivateOrder = async (orderId) => {
  if (!orderId) throw new Error("O ID do pedido é obrigatório.");
  try {
    console.log(`Reativando pedido ${orderId}...`);
    const response = await api.patch(`/locacoes/${orderId}/reativar`);
    console.log(`Pedido ${orderId} reativado com sucesso.`);
    return response.data;
  } catch (error) {
    handleRequestError(error);
  }
};

/**
 * Registra um problema em um item locado.
 * @param {Number} orderId - ID do pedido
 * @param {Number} itemId - ID do item
 * @param {String} descricaoProblema - Descrição do problema
 * @returns {Object} Resposta da API
 */
export const reportProblem = async (orderId, itemId, descricaoProblema) => {
  if (!orderId) throw new Error("O ID do pedido é obrigatório.");
  if (!itemId) throw new Error("O ID do item é obrigatório.");
  if (!descricaoProblema)
    throw new Error("A descrição do problema é obrigatória.");
  try {
    console.log(`Registrando problema para o pedido ${orderId}...`);
    const response = await api.post(`/locacoes/${orderId}/problema`, {
      item_id: itemId,
      descricao_problema: descricaoProblema,
    });
    console.log(`Problema registrado para o pedido ${orderId} com sucesso.`);
    return response.data;
  } catch (error) {
    handleRequestError(error);
  }
};

/**
 * Busca detalhes de um pedido específico.
 * @param {Number} orderId - ID do pedido
 * @returns {Object} Detalhes do pedido
 */
export const fetchOrderDetails = async (orderId) => {
  if (!orderId) throw new Error("O ID do pedido é obrigatório.");
  try {
    const response = await api.get(`/locacoes/${orderId}`);
    console.log(`Detalhes do pedido ${orderId} carregados com sucesso.`);
    return response.data;
  } catch (error) {
    handleRequestError(error);
  }
};

/**
 * Deleta um pedido do sistema.
 * @param {Number} orderId - ID do pedido
 * @returns {Object} Resposta da API
 */
export const deleteOrder = async (orderId) => {
  if (!orderId) throw new Error("O ID do pedido é obrigatório.");
  try {
    console.log(`Deletando pedido ${orderId}...`);
    const response = await api.delete(`/locacoes/${orderId}`);
    console.log(`Pedido ${orderId} deletado com sucesso.`);
    return response.data;
  } catch (error) {
    handleRequestError(error);
  }
};
