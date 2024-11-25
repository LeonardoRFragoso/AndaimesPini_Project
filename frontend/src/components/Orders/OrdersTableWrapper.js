import React, { useState } from "react";
import PropTypes from "prop-types";
import { TableContainer, Paper, CircularProgress, Box } from "@mui/material";
import OrdersTable from "../tables/OrdersTable";
import { reactivateOrder } from "../../api/orders";

const OrdersTableWrapper = ({ orders, onAction }) => {
  const [loading, setLoading] = useState(false);

  /**
   * Lida com a reativação de pedidos.
   * @param {number} orderId - ID do pedido.
   */
  const handleReactivateOrder = async (orderId) => {
    setLoading(true);
    try {
      console.log(`Tentando reativar o pedido #${orderId}...`);
      const response = await reactivateOrder(orderId);

      if (response) {
        console.log(`Pedido #${orderId} reativado com sucesso.`);
        onAction?.(`Pedido #${orderId} reativado com sucesso!`, "success");
      } else {
        throw new Error(`Erro ao reativar o pedido #${orderId}`);
      }
    } catch (error) {
      console.error(`Erro ao reativar pedido #${orderId}:`, error.message);
      onAction?.(`Falha ao reativar o pedido #${orderId}.`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        overflowX: "auto",
        maxWidth: "100%",
        margin: "0 auto",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        padding: "16px",
        position: "relative",
      }}
    >
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <OrdersTable
        orders={Array.isArray(orders) ? orders : []}
        onReactivateOrder={handleReactivateOrder}
      />
    </TableContainer>
  );
};

OrdersTableWrapper.propTypes = {
  orders: PropTypes.array.isRequired, // Lista de pedidos
  onAction: PropTypes.func.isRequired, // Função de feedback para o componente pai
};

export default OrdersTableWrapper;
