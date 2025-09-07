import React, { useState } from "react";
import PropTypes from "prop-types";
import { TableContainer, Paper, CircularProgress, Box, useTheme } from "@mui/material";
import OrdersTable from "../tables/OrdersTable";
import { reactivateOrder } from "../../api/orders";

const OrdersTableWrapper = ({ orders, onAction }) => {
  const theme = useTheme();
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
        boxShadow: theme => theme.palette.mode === 'dark' 
          ? '0px 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0px 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: theme => theme.palette.mode === 'dark' 
          ? 'rgba(30, 30, 30, 0.8)' 
          : '#f9f9f9',
        borderRadius: "8px",
        padding: "16px",
        position: "relative",
        border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
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
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(0, 0, 0, 0.7)' 
              : 'rgba(255, 255, 255, 0.7)',
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <OrdersTable
        orders={Array.isArray(orders) ? orders : []}
        onReactivateOrder={handleReactivateOrder}
        onExtendOrder={(order) => onAction(order, "extend")}
        onCompleteOrder={(order) => onAction(order, "early")}
        onConfirmReturn={(orderId) => {
          const order = orders.find(o => o.id === orderId);
          if (order) onAction(order, "return");
        }}
      />
    </TableContainer>
  );
};

OrdersTableWrapper.propTypes = {
  orders: PropTypes.array.isRequired, // Lista de pedidos
  onAction: PropTypes.func.isRequired, // Função de feedback para o componente pai
};

export default OrdersTableWrapper;
