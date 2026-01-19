// src/components/tables/InventoryTable.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  useTheme,
  Box,
  Tooltip,
  Typography,
  Chip,
  Fade,
} from "@mui/material";
import { 
  Edit, 
  Delete, 
  ArrowUpward, 
  ArrowDownward,
  Inventory,
  Category,
  Numbers,
  Settings,
} from "@mui/icons-material";

const InventoryTable = ({ items, onEdit, onDelete, sortItems, sortConfig }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
  };

  // Função para exibir o ícone de ordenação baseado na coluna selecionada
  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} />
      ) : (
        <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
      );
    }
    return null;
  };

  const columns = [
    { id: 'nome_item', label: 'Nome', icon: <Inventory fontSize="small" />, width: '30%' },
    { id: 'tipo_item', label: 'Tipo', icon: <Category fontSize="small" />, width: '20%' },
    { id: 'quantidade', label: 'Quantidade', icon: <Numbers fontSize="small" />, width: '20%' },
  ];

  return (
    <TableContainer 
      component={Paper}
      sx={{
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : '#fff',
        borderRadius: 3,
        boxShadow: isDarkMode 
          ? '0px 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0px 4px 12px rgba(0, 0, 0, 0.1)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        overflow: 'hidden',
      }}
    >
      <Table>
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
              const isActive = sortConfig.key === column.id;
              return (
                <TableCell
                  key={column.id}
                  sx={{ 
                    width: column.width, 
                    cursor: "pointer",
                    color: isActive 
                      ? colors.primary 
                      : (isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)'),
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    padding: '16px 20px',
                    transition: 'all 0.2s ease',
                    borderBottom: 'none',
                    '&:hover': {
                      color: colors.primaryLight,
                      backgroundColor: isDarkMode 
                        ? 'rgba(46, 125, 50, 0.1)' 
                        : 'rgba(46, 125, 50, 0.05)',
                    },
                  }}
                  onClick={() => sortItems(column.id)}
                >
                  <Tooltip title={`Ordenar por ${column.label}`} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                        }}>
                          {getSortIcon(column.id)}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                </TableCell>
              );
            })}
            <TableCell 
              align="right" 
              sx={{ 
                width: "30%",
                color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '16px 20px',
                borderBottom: 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                <Settings fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                Ações
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Fade in timeout={200 + index * 50} key={item.id}>
                <TableRow
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
                        : '0 4px 12px rgba(0, 0, 0, 0.08)'
                    },
                    transition: 'all 0.2s ease-in-out',
                    borderBottom: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.06)' 
                      : '1px solid rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0,0,0,0.87)',
                    fontWeight: 500,
                    padding: '16px 20px',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        backgroundColor: `${colors.primary}15`,
                        borderRadius: 1.5,
                        p: 0.75,
                        display: 'flex',
                      }}>
                        <Inventory fontSize="small" sx={{ color: colors.primary, fontSize: 16 }} />
                      </Box>
                      {item.nome_item || (
                        <Typography sx={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                          Não especificado
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0,0,0,0.87)',
                    padding: '16px 20px',
                  }}>
                    <Chip 
                      label={item.tipo_item || "Não especificado"}
                      size="small"
                      sx={{ 
                        backgroundColor: isDarkMode ? 'rgba(156, 39, 176, 0.15)' : 'rgba(156, 39, 176, 0.1)',
                        color: isDarkMode ? '#ce93d8' : '#7b1fa2',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        border: `1px solid ${isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(156, 39, 176, 0.2)'}`,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0,0,0,0.87)',
                    padding: '16px 20px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        sx={{ 
                          fontWeight: 700, 
                          color: item.quantidade > 0 ? colors.primary : '#f44336',
                          fontFamily: 'monospace',
                        }}
                      >
                        {item.quantidade !== undefined ? item.quantidade.toLocaleString() : "—"}
                      </Typography>
                      {item.quantidade === 0 && (
                        <Chip 
                          label="Sem estoque" 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            color: '#f44336',
                            fontSize: '0.65rem',
                            height: 20,
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ padding: '16px 20px' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Editar item" arrow>
                        <IconButton 
                          onClick={() => onEdit(item)}
                          size="small"
                          sx={{
                            backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.1)',
                            borderRadius: 2,
                            width: 36,
                            height: 36,
                            border: `1px solid ${isDarkMode ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'}`,
                            '&:hover': {
                              backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.25)' : 'rgba(33, 150, 243, 0.15)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <Edit fontSize="small" sx={{ color: '#2196f3' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir item" arrow>
                        <IconButton 
                          onClick={() => onDelete(item.id)}
                          size="small"
                          sx={{
                            backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)',
                            borderRadius: 2,
                            width: 36,
                            height: 36,
                            border: `1px solid ${isDarkMode ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)'}`,
                            '&:hover': {
                              backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.25)' : 'rgba(244, 67, 54, 0.15)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.25)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <Delete fontSize="small" sx={{ color: '#f44336' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              </Fade>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={4} 
                align="center"
                sx={{ 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0,0,0,0.5)',
                  py: 6,
                  fontStyle: 'italic',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Inventory sx={{ fontSize: 48, color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }} />
                  <Typography>Nenhum item encontrado</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryTable;
