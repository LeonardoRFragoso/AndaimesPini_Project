import React from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Chip, useTheme, Box, Fade, Tooltip, Typography } from "@mui/material";
import { Check, WarningAmber, HelpOutline, AccessTime } from "@mui/icons-material";
import OrderActions from "./OrderActions";

// Configurações de exibição para o status (serão ajustadas com base no tema)
const getStatusChipConfig = (isDarkMode) => ({
  ativo: {
    label: "Ativo",
    color: "warning",
    backgroundColor: isDarkMode ? "rgba(255, 193, 7, 0.15)" : "#fff8e1",
    textColor: isDarkMode ? "#ffca28" : "#f57c00",
    borderColor: isDarkMode ? "rgba(255, 193, 7, 0.4)" : "#ffca28",
    icon: <AccessTime fontSize="small" />,
  },
  concluido: {
    label: "Concluído",
    color: "success",
    backgroundColor: isDarkMode ? "rgba(76, 175, 80, 0.15)" : "#e8f5e9",
    textColor: isDarkMode ? "#66bb6a" : "#2e7d32",
    borderColor: isDarkMode ? "rgba(76, 175, 80, 0.4)" : "#66bb6a",
    icon: <Check fontSize="small" />,
  },
  indefinido: {
    label: "Indefinido",
    color: "default",
    backgroundColor: isDarkMode ? "rgba(158, 158, 158, 0.15)" : "#f5f5f5",
    textColor: isDarkMode ? "#bdbdbd" : "#757575",
    borderColor: isDarkMode ? "rgba(158, 158, 158, 0.4)" : "#bdbdbd",
    icon: <HelpOutline fontSize="small" />,
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

    const cellStyles = {
      color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
      fontSize: '0.875rem',
      padding: '14px 12px',
      borderBottom: isDarkMode 
        ? '1px solid rgba(255, 255, 255, 0.06)' 
        : '1px solid rgba(0, 0, 0, 0.06)',
    };

    const moneyStyles = {
      ...cellStyles,
      fontWeight: 600,
      fontFamily: 'monospace',
    };

    return (
      <Fade in timeout={300}>
        <TableRow
          key={order.id}
          sx={{
            "&:nth-of-type(odd)": { 
              backgroundColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.02)' 
                : 'rgba(0, 0, 0, 0.02)' 
            },
            "&:hover": { 
              backgroundColor: isDarkMode 
                ? 'rgba(46, 125, 50, 0.08)' 
                : 'rgba(46, 125, 50, 0.04)', 
              cursor: "pointer",
              transform: 'translateY(-1px)',
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                : '0 4px 12px rgba(0, 0, 0, 0.08)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
          aria-label={`Pedido ${order.id}`}
        >
          <TableCell sx={{ ...cellStyles, fontWeight: 700, color: isDarkMode ? '#1B5E20' : '#2E7D32' }}>
            <Tooltip title={`Ver detalhes do pedido #${order.id}`}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                backgroundColor: isDarkMode ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                padding: '4px 10px',
                borderRadius: 2,
                fontWeight: 700,
              }}>
                #{order.id}
              </Box>
            </Tooltip>
          </TableCell>
          <TableCell sx={cellStyles}>{formatDate(order.data_inicio)}</TableCell>
          <TableCell sx={cellStyles}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: terminoMessage.includes("Locado") 
                  ? (isDarkMode ? '#ffca28' : '#f57c00') 
                  : 'inherit',
                fontStyle: terminoMessage.includes("Locado") ? 'italic' : 'normal',
              }}
            >
              {terminoMessage}
            </Typography>
          </TableCell>
          <TableCell sx={{ ...cellStyles, fontWeight: 500 }}>
            {order.cliente?.nome || (
              <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                Não informado
              </Typography>
            )}
          </TableCell>
          <TableCell sx={moneyStyles}>{formatCurrency(order.valor_total)}</TableCell>
          <TableCell sx={moneyStyles}>
            {formatCurrency(order.novo_valor_total || order.valor_receber_final)}
          </TableCell>
          <TableCell sx={{ ...cellStyles, textAlign: 'center' }}>
            <Chip
              label={currentStatus.label}
              size="small"
              sx={{
                backgroundColor: currentStatus.backgroundColor,
                color: currentStatus.textColor,
                fontWeight: 600,
                fontSize: '0.75rem',
                border: `1px solid ${currentStatus.borderColor}`,
                '& .MuiChip-icon': {
                  color: currentStatus.textColor,
                },
              }}
              icon={currentStatus.icon}
            />
          </TableCell>
          <TableCell sx={moneyStyles}>{formatCurrency(order.abatimento)}</TableCell>
          <TableCell sx={cellStyles}>{formatDate(order.data_fim_original)}</TableCell>
          <TableCell sx={cellStyles}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: devolucaoMessage.includes("Locado") 
                  ? (isDarkMode ? '#ffca28' : '#f57c00') 
                  : devolucaoMessage.includes("Confirmada")
                  ? (isDarkMode ? '#66bb6a' : '#2e7d32')
                  : 'inherit',
                fontStyle: devolucaoMessage.includes("Locado") ? 'italic' : 'normal',
              }}
            >
              {devolucaoMessage}
            </Typography>
          </TableCell>
          <TableCell sx={cellStyles}>
            {order.motivo_ajuste || (
              <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                Não informado
              </Typography>
            )}
          </TableCell>
          <TableCell sx={cellStyles}>{formatDate(order.data_prorrogacao)}</TableCell>
          <TableCell sx={moneyStyles}>{formatCurrency(order.novo_valor_total)}</TableCell>
          <TableCell sx={{ ...cellStyles, textAlign: 'center' }}>
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
      </Fade>
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
