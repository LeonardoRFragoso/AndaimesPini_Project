import React from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Chip, useTheme } from "@mui/material";
import { Check, WarningAmber } from "@mui/icons-material";
import OrderActions from "./OrderActions";

// Configurações de exibição para o status (serão ajustadas com base no tema)
const getStatusChipConfig = (isDarkMode) => ({
  ativo: {
    label: "Ativo",
    color: "error",
    backgroundColor: isDarkMode ? "rgba(255, 0, 0, 0.15)" : "#ffebee",
    textColor: isDarkMode ? "#ff6b6b" : "#d32f2f",
    icon: <WarningAmber />,
  },
  concluido: {
    label: "Concluído",
    color: "success",
    backgroundColor: isDarkMode ? "rgba(0, 255, 0, 0.15)" : "#d1f7d1",
    textColor: isDarkMode ? "#69f0ae" : "#388e3c",
    icon: <Check />,
  },
  indefinido: {
    label: "Indefinido",
    color: "default",
    backgroundColor: isDarkMode ? "rgba(128, 128, 128, 0.15)" : "#f0f0f0",
    textColor: isDarkMode ? "#bdbdbd" : "#000",
    icon: null,
  },
});

// Função para normalizar o status
const normalizeStatus = (status) =>
  status
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Função para formatação de valores monetários
const formatCurrency = (value) => {
  const formattedValue = value !== undefined && value !== null ? value : 0;
  return `R$ ${formattedValue.toFixed(2)}`;
};

// Função para formatação de datas
const formatDate = (date, fallbackMessage = "Não disponível") => {
  const parsedDate = new Date(date);
  return !date || isNaN(parsedDate)
    ? fallbackMessage
    : parsedDate.toLocaleDateString();
};

const OrderTableRow = React.memo(
  ({
    order,
    onOpenDetails,
    onConfirmReturn,
    onExtendOrder,
    onReactivateOrder,
    onCompleteOrder,
  }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const statusChipConfig = getStatusChipConfig(isDarkMode);
    
    const normalizedStatus = normalizeStatus(order.status);

    const currentStatus =
      statusChipConfig[normalizedStatus] || statusChipConfig.indefinido;

    // Lógica para exibir "Data de Término"
    const terminoMessage = formatDate(
      order.data_fim,
      normalizedStatus === "ativo"
        ? "Ainda Locado com o Cliente"
        : "Data Indisponível"
    );

    // Lógica para exibir "Data de Devolução"
    const devolucaoMessage = formatDate(
      order.data_devolucao,
      normalizedStatus === "concluido"
        ? "Devolução Confirmada"
        : "Ainda Locado com o Cliente"
    );

    return (
      <TableRow
        key={order.id}
        sx={{
          "&:nth-of-type(odd)": { 
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(50, 50, 50, 0.5)' 
              : '#f9f9f9' 
          },
          "&:hover": { 
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(70, 70, 70, 0.7)' 
              : '#e0f7fa', 
            cursor: "pointer" 
          },
          color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
        }}
        aria-label={`Pedido ${order.id}`} // Acessibilidade
      >
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{order.id}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{formatDate(order.data_inicio)}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{terminoMessage}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{order.cliente?.nome || "Não informado"}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{formatCurrency(order.valor_total)}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>
          {formatCurrency(order.novo_valor_total || order.valor_receber_final)}
        </TableCell>
        <TableCell>
          <Chip
            label={currentStatus.label}
            color={currentStatus.color}
            sx={{
              backgroundColor: currentStatus.backgroundColor,
              color: currentStatus.textColor,
              fontWeight: "bold",
            }}
            icon={currentStatus.icon}
          />
        </TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{formatCurrency(order.abatimento)}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{formatDate(order.data_fim_original)}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{devolucaoMessage}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{order.motivo_ajuste || "Não informado"}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{formatDate(order.data_prorrogacao)}</TableCell>
        <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{formatCurrency(order.novo_valor_total)}</TableCell>
        <TableCell>
          <OrderActions
            order={order}
            onOpenDetails={() => onOpenDetails(order)}
            onConfirmReturn={() => onConfirmReturn(order.id)}
            onExtendOrder={() => onExtendOrder(order)}
            onReactivateOrder={() => onReactivateOrder(order.id)}
            onCompleteOrder={() => onCompleteOrder(order)}
          />
        </TableCell>
      </TableRow>
    );
  }
);

// Validação de propriedades com PropTypes
OrderTableRow.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.number.isRequired,
    data_inicio: PropTypes.string,
    data_fim: PropTypes.string,
    cliente: PropTypes.shape({
      nome: PropTypes.string,
    }),
    valor_total: PropTypes.number,
    novo_valor_total: PropTypes.number,
    valor_receber_final: PropTypes.number,
    abatimento: PropTypes.number,
    data_fim_original: PropTypes.string,
    data_devolucao: PropTypes.string,
    motivo_ajuste: PropTypes.string,
    data_prorrogacao: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onOpenDetails: PropTypes.func.isRequired, // Função para abrir detalhes
  onConfirmReturn: PropTypes.func.isRequired, // Função para confirmar devolução
  onExtendOrder: PropTypes.func.isRequired, // Função para prorrogar pedido
  onReactivateOrder: PropTypes.func.isRequired, // Função para reativar pedido
  onCompleteOrder: PropTypes.func.isRequired, // Função para concluir antecipadamente
};

export default OrderTableRow;
