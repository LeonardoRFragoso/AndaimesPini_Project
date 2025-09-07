import React from "react";
import PropTypes from "prop-types";
import { Button, useTheme } from "@mui/material";
import { Restore } from "@mui/icons-material";
import CompleteButton from "../common/CompleteButton";
import DetailsButton from "../common/DetailsButton";
import ExtendButton from "../common/ExtendButton";
import ReturnButton from "../common/ReturnButton";

// Estilos para hover nos botões com suporte a tema escuro
const getHoverStyles = (isDarkMode) => ({
  details: {
    backgroundColor: isDarkMode ? "rgba(25, 118, 210, 0.2)" : "#e3f2fd",
    color: isDarkMode ? "#90caf9" : "#1e88e5",
  },
  return: {
    backgroundColor: isDarkMode ? "rgba(255, 152, 0, 0.2)" : "#ffb74d",
    color: isDarkMode ? "#ffb74d" : "#000",
  },
  extend: {
    backgroundColor: isDarkMode ? "rgba(76, 175, 80, 0.2)" : "#81c784",
    color: isDarkMode ? "#81c784" : "#000",
  },
  complete: {
    backgroundColor: isDarkMode ? "rgba(76, 175, 80, 0.3)" : "#66bb6a",
    color: isDarkMode ? "#a5d6a7" : "#fff",
  },
  reactivate: {
    backgroundColor: isDarkMode ? "rgba(255, 235, 59, 0.2)" : "#ffeb3b",
    color: isDarkMode ? "#fff176" : "#000",
  },
});

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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const hoverStyles = getHoverStyles(isDarkMode);
  
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
        color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
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
            color: theme => theme.palette.mode === 'dark' ? '#fff176' : 'inherit',
            borderColor: theme => theme.palette.mode === 'dark' ? '#fff176' : 'inherit',
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
