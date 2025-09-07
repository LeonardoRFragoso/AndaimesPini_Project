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
} from "@mui/material";
import { Edit, Delete, ArrowUpward, ArrowDownward } from "@mui/icons-material";

const InventoryTable = ({ items, onEdit, onDelete, sortItems, sortConfig }) => {
  const theme = useTheme();
  // Função para exibir o ícone de ordenação baseado na coluna selecionada
  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ArrowUpward fontSize="small" />
      ) : (
        <ArrowDownward fontSize="small" />
      );
    }
    return null;
  };

  return (
    <TableContainer 
      component={Paper}
      sx={{
        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : '#fff',
        borderRadius: 2,
        boxShadow: theme => theme.palette.mode === 'dark' 
          ? '0px 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0px 4px 12px rgba(0, 0, 0, 0.1)',
        border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
      }}
    >
      <Table>
        <TableHead sx={{ 
          backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.9)' : 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
          borderBottom: theme => theme.palette.mode === 'dark' ? '2px solid rgba(76, 175, 80, 0.3)' : '2px solid #4caf50'
        }}>
          <TableRow>
            <TableCell
              sx={{ 
                width: "30%", 
                cursor: "pointer",
                color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                fontWeight: 'bold'
              }}
              onClick={() => sortItems("nome_item")}
            >
              Nome {getSortIcon("nome_item")}
            </TableCell>
            <TableCell
              sx={{ 
                width: "20%", 
                cursor: "pointer",
                color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                fontWeight: 'bold'
              }}
              onClick={() => sortItems("tipo_item")}
            >
              Tipo {getSortIcon("tipo_item")}
            </TableCell>
            <TableCell
              sx={{ 
                width: "20%", 
                cursor: "pointer",
                color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                fontWeight: 'bold'
              }}
              onClick={() => sortItems("quantidade")}
            >
              Quantidade {getSortIcon("quantidade")}
            </TableCell>
            <TableCell 
              align="right" 
              sx={{ 
                width: "30%",
                color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                fontWeight: 'bold'
              }}
            >
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow
                key={item.id}
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
              >
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'inherit' }}>
                  {item.nome_item || "Nome não especificado"}
                </TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'inherit' }}>
                  {item.tipo_item || "Tipo não especificado"}
                </TableCell>
                <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'inherit' }}>
                  {item.quantidade !== undefined
                    ? item.quantidade
                    : "Quantidade não especificada"}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton 
                      onClick={() => onEdit(item)}
                      size="small"
                      sx={{
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)',
                          transform: 'scale(1.1)',
                          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Edit fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton 
                      onClick={() => onDelete(item.id)}
                      size="small"
                      sx={{
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)',
                          transform: 'scale(1.1)',
                          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={4} 
                align="center"
                sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}
              >
                Nenhum item encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryTable;
