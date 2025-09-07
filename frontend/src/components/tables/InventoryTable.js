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
        <TableHead>
          <TableRow sx={{ 
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.9)' : '#f5f5f5' 
          }}>
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
                      ? 'rgba(50, 50, 50, 0.6)' 
                      : '#f9f9f9' 
                  },
                  "&:hover": { 
                    backgroundColor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(70, 70, 70, 0.8)' 
                      : '#e0f7fa' 
                  },
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
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
                  <IconButton onClick={() => onEdit(item)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => onDelete(item.id)}>
                    <Delete color="secondary" />
                  </IconButton>
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
