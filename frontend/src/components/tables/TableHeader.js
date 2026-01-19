import React from "react";
import PropTypes from "prop-types";
import { TableHead, TableRow, TableCell, useTheme, Box, Tooltip } from "@mui/material";
import { 
  ArrowUpward, 
  ArrowDownward,
  Tag,
  CalendarToday,
  Person,
  AttachMoney,
  CheckCircle,
  Discount,
  EventBusy,
  EventAvailable,
  Info,
  Update,
  Settings,
} from "@mui/icons-material";

const TableHeader = ({ orderBy, onSort }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
  };

  // Definição das colunas da tabela com ícones
  const columns = [
    { id: "id", label: "ID do Pedido", align: "center", icon: <Tag fontSize="small" /> },
    { id: "data_inicio", label: "Data de Início", icon: <CalendarToday fontSize="small" /> },
    { id: "data_fim", label: "Data de Término", icon: <EventBusy fontSize="small" /> },
    { id: "cliente.nome", label: "Cliente", icon: <Person fontSize="small" /> },
    { id: "valor_total", label: "Valor Total", align: "right", icon: <AttachMoney fontSize="small" /> },
    { id: "valor_ajustado", label: "Valor Ajustado", align: "right", icon: <AttachMoney fontSize="small" /> },
    { id: "status", label: "Status", align: "center", icon: <CheckCircle fontSize="small" /> },
    { id: "abatimento", label: "Abatimento", align: "right", icon: <Discount fontSize="small" /> },
    { id: "data_fim_original", label: "Data de Término Original", icon: <EventBusy fontSize="small" /> },
    { id: "data_devolucao", label: "Data de Devolução", icon: <EventAvailable fontSize="small" /> },
    { id: "motivo_ajuste", label: "Motivo do Ajuste", icon: <Info fontSize="small" /> },
    { id: "data_prorrogacao", label: "Data de Prorrogação", icon: <Update fontSize="small" /> },
    { id: "novo_valor_total", label: "Novo Valor Total", align: "right", icon: <AttachMoney fontSize="small" /> },
  ];

  return (
    <TableHead sx={{ 
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.primary}40 0%, ${colors.primaryLight}30 100%)`
        : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primaryLight}10 100%)`,
      borderBottom: isDarkMode 
        ? `2px solid ${colors.primaryLight}60` 
        : `2px solid ${colors.primary}`,
    }}>
      <TableRow>
        {columns.map((column) => {
          const isActive = orderBy.field === column.id;
          return (
            <TableCell
              key={column.id}
              align={column.align || "left"}
              onClick={() => onSort(column.id)}
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                fontSize: '0.8rem',
                textAlign: column.align || "left",
                color: isActive 
                  ? colors.primary 
                  : (isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)'),
                padding: '16px 12px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                borderBottom: 'none',
                "&:hover": { 
                  color: colors.primaryLight,
                  backgroundColor: isDarkMode 
                    ? 'rgba(46, 125, 50, 0.1)' 
                    : 'rgba(46, 125, 50, 0.05)',
                },
              }}
              aria-label={`Ordenar por ${column.label}`}
            >
              <Tooltip title={`Ordenar por ${column.label}`} arrow>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start',
                }}>
                  <Box sx={{ 
                    color: isActive ? colors.primary : (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'),
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {column.icon}
                  </Box>
                  <span>{column.label}</span>
                  {isActive && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: colors.primary,
                      animation: 'fadeIn 0.2s ease',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(-4px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}>
                      {orderBy.direction === "asc" ? (
                        <ArrowUpward fontSize="small" aria-label="Ordenado ascendente" />
                      ) : (
                        <ArrowDownward fontSize="small" aria-label="Ordenado descendente" />
                      )}
                    </Box>
                  )}
                </Box>
              </Tooltip>
            </TableCell>
          );
        })}
        {/* Célula adicional para ações */}
        <TableCell
          align="center"
          sx={{ 
            fontWeight: 600,
            fontSize: '0.8rem',
            color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
            padding: '16px 12px',
            borderBottom: 'none',
          }}
          aria-label="Ações"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
            <Settings fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
            Ações
          </Box>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

// Validação das propriedades recebidas
TableHeader.propTypes = {
  orderBy: PropTypes.shape({
    field: PropTypes.string, // Campo sendo ordenado
    direction: PropTypes.oneOf(["asc", "desc"]), // Direção da ordenação
  }).isRequired,
  onSort: PropTypes.func.isRequired, // Função para manipular a ordenação
};

export default TableHeader;
