import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import { Restore } from "@mui/icons-material";
import CompleteButton from "../common/CompleteButton";
import DetailsButton from "../common/DetailsButton";
import ExtendButton from "../common/ExtendButton";
import ReturnButton from "../common/ReturnButton";

// Estilos para hover nos botões
const hoverStyles = {
  details: {
    backgroundColor: "#e3f2fd",
    color: "#1e88e5",
  },
  return: {
    backgroundColor: "#ffb74d",
    color: "#000",
  },
  extend: {
    backgroundColor: "#81c784",
    color: "#000",
  },
  complete: {
    backgroundColor: "#66bb6a",
    color: "#fff",
  },
  reactivate: {
    backgroundColor: "#ffeb3b",
    color: "#000",
  },
};

// Função para normalizar o status
const normalizeStatus = (status) =>
  status
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const OrderActions = ({
  order,
  onOpenDetails,
  onConfirmReturn,
  onExtendOrder,
  onReactivateOrder,
  onCompleteOrder,
}) => {
  // Normaliza o status do pedido para evitar problemas de formatação
  const normalizedStatus = normalizeStatus(order.status);

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap", // Exibição responsiva para dispositivos menores
      }}
    >
      {/* Botão para abrir os detalhes do pedido (sempre visível) */}
      <DetailsButton
        onClick={() => onOpenDetails(order)}
        aria-label={`Ver detalhes do pedido ${order.id}`}
        title="Ver detalhes do pedido"
        sx={{
          "&:hover": hoverStyles.details,
        }}
      />

      {/* Renderização condicional dos botões baseados no status */}
      {normalizedStatus === "concluido" ? (
        // Botão para reativar o pedido se estiver concluído
        <Button
          onClick={() => onReactivateOrder(order.id)}
          color="warning"
          startIcon={<Restore />}
          variant="outlined"
          aria-label={`Reativar pedido ${order.id}`}
          title="Reativar pedido"
          sx={{
            fontWeight: "bold",
            padding: "6px 12px",
            fontSize: "0.875rem",
            "&:hover": hoverStyles.reactivate,
          }}
        >
          Reativar
        </Button>
      ) : (
        <>
          {/* Botão para confirmar a devolução */}
          <ReturnButton
            onClick={() => onConfirmReturn(order.id)}
            aria-label={`Confirmar devolução do pedido ${order.id}`}
            title="Confirmar devolução"
            sx={{
              "&:hover": hoverStyles.return,
            }}
          />
          {/* Botão para prorrogar o pedido */}
          <ExtendButton
            onClick={() => onExtendOrder(order)}
            aria-label={`Prorrogar o pedido ${order.id}`}
            title="Prorrogar pedido"
            sx={{
              "&:hover": hoverStyles.extend,
            }}
          />
          {/* Botão para concluir antecipadamente */}
          <CompleteButton
            onClick={() => onCompleteOrder(order)}
            aria-label={`Concluir antecipadamente o pedido ${order.id}`}
            title="Concluir antecipadamente"
            sx={{
              "&:hover": hoverStyles.complete,
            }}
          />
        </>
      )}
    </div>
  );
};

// Validação de propriedades (PropTypes)
OrderActions.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.number.isRequired, // ID do pedido
    status: PropTypes.string.isRequired, // Status do pedido
  }).isRequired,
  onOpenDetails: PropTypes.func.isRequired, // Função para abrir detalhes
  onConfirmReturn: PropTypes.func.isRequired, // Função para confirmar devolução
  onExtendOrder: PropTypes.func.isRequired, // Função para prorrogar pedido
  onReactivateOrder: PropTypes.func.isRequired, // Função para reativar pedido
  onCompleteOrder: PropTypes.func.isRequired, // Função para concluir antecipadamente
};

export default OrderActions;
