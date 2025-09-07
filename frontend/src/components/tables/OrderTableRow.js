import React from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Chip, useTheme } from "@mui/material";
import { Check, WarningAmber } from "@mui/icons-material";
import OrderActions from "./OrderActions";

// Configurações de exibição para o status (serão ajustadas com base no tema)
const getStatusChipConfig = (isDarkMode) => ({
  ativo: {
    label: "Ativo",
    color: "warning",
    backgroundColor: isDarkMode ? "rgba(255, 193, 7, 0.2)" : "#fff3cd",
    textColor: isDarkMode ? "#ffc107" : "#856404",
    icon: <WarningAmber />,
  },
  concluido: {
    label: "Concluído",
    color: "success",
    backgroundColor: isDarkMode ? "rgba(76, 175, 80, 0.2)" : "#d4edda",
    textColor: isDarkMode ? "#4caf50" : "#155724",
    icon: <Check />,
  },
  indefinido: {
    label: "Indefinido",
    color: "default",
    backgroundColor: isDarkMode ? "rgba(158, 158, 158, 0.2)" : "#e2e3e5",
    textColor: isDarkMode ? "#9e9e9e" : "#6c757d",
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
              ? 'rgba(60, 60, 60, 0.3)' 
              : '#f8f9fa' 
          },
          "&:hover": { 
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(76, 175, 80, 0.1)' 
              : 'rgba(76, 175, 80, 0.05)', 
            cursor: "pointer",
            transform: 'translateY(-1px)',
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)'
          },
          color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
          transition: 'all 0.2s ease-in-out',
          borderBottom: theme => theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.05)' 
            : '1px solid rgba(0, 0, 0, 0.05)'
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
