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
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: theme => theme.palette.mode === 'dark' 
          ? 'rgba(40, 40, 40, 0.9)' 
          : '#ffffff',
        border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
        position: "relative",
      }}
    >
    <TableContainer
      sx={{
        overflowX: "auto",
        maxWidth: "100%",
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
    </Paper>
  );
};

OrdersTableWrapper.propTypes = {
  orders: PropTypes.array.isRequired, // Lista de pedidos
  onAction: PropTypes.func.isRequired, // Função de feedback para o componente pai
};

export default OrdersTableWrapper;
