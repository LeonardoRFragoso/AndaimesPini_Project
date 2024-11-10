import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import { Check, Cancel } from "@mui/icons-material";
import PropTypes from "prop-types";

const OrdersActionsDialog = ({ open, order, onClose, onConfirm }) => {
  if (!order) return null;

  // Utilitário para descrever ações
  const getActionDescription = (action) => {
    const descriptions = {
      return: "confirmar a devolução de",
      extend: "prorrogar",
      early: "finalizar antecipadamente",
      reactivate: "reativar",
    };
    return descriptions[action] || "executar esta ação para";
  };

  const actionText = getActionDescription(order.action);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="action-dialog-title"
      aria-describedby="action-dialog-description"
    >
      <DialogTitle id="action-dialog-title">Confirmar Ação</DialogTitle>
      <DialogContent>
        <DialogContentText id="action-dialog-description">
          Deseja realmente {actionText} o pedido #{order.id}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
          startIcon={<Cancel />}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
          }}
          aria-label="Cancelar ação"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm(order.action, order)}
          color="primary"
          startIcon={<Check />}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
          }}
          aria-label={`Confirmar ${actionText}`}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Validação de props com PropTypes
OrdersActionsDialog.propTypes = {
  open: PropTypes.bool.isRequired, // Indica se o diálogo está aberto
  order: PropTypes.shape({
    id: PropTypes.number.isRequired, // ID do pedido
    action: PropTypes.string.isRequired, // Ação a ser confirmada
  }), // Detalhes do pedido atual
  onClose: PropTypes.func.isRequired, // Função para fechar o diálogo
  onConfirm: PropTypes.func.isRequired, // Função para confirmar a ação
};

// Define valores padrão para `order` quando não especificado
OrdersActionsDialog.defaultProps = {
  order: null, // Garante que o componente lide com a ausência de `order`
};

export default OrdersActionsDialog;
