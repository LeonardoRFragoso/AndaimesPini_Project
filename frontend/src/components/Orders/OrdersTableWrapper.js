import React from "react";
import PropTypes from "prop-types";
import { TableContainer, Paper } from "@mui/material";
import OrdersTable from "../tables/OrdersTable";
import { reactivateOrder } from "../../api/orders";

const OrdersTableWrapper = ({ orders, onAction }) => {
  /**
   * Lida com a reativação de pedidos.
   * @param {number} orderId - ID do pedido.
   */
  const handleReactivateOrder = async (orderId) => {
    try {
      const response = await reactivateOrder(orderId);

      if (response) {
        // Notifica o componente pai sobre o sucesso
        onAction?.(`Pedido #${orderId} reativado com sucesso!`, "success");
      } else {
        throw new Error(`Erro ao reativar o pedido #${orderId}`);
      }
    } catch (error) {
      console.error(`Erro ao reativar pedido #${orderId}:`, error);

      // Notifica o componente pai sobre o erro
      onAction?.(`Falha ao reativar o pedido #${orderId}.`, "error");
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        overflowX: "auto", // Permite rolagem horizontal para tabelas largas
        maxWidth: "100%", // Garante que a tabela ocupe toda a largura disponível
        margin: "0 auto", // Centraliza a tabela
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Adiciona um efeito de sombra suave
        backgroundColor: "#f9f9f9", // Define um fundo suave
        borderRadius: "8px", // Adiciona bordas arredondadas
        padding: "16px", // Adiciona um espaçamento interno
      }}
    >
      <OrdersTable
        orders={orders}
        onReactivateOrder={handleReactivateOrder} // Lógica passada como prop
      />
    </TableContainer>
  );
};

OrdersTableWrapper.propTypes = {
  orders: PropTypes.array.isRequired, // Lista de pedidos
  onAction: PropTypes.func.isRequired, // Função de feedback para o componente pai
};

export default OrdersTableWrapper;
