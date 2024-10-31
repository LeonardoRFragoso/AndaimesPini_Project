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
} from "@mui/material";
import { Edit, Delete, ArrowUpward, ArrowDownward } from "@mui/icons-material";

const InventoryTable = ({ items, onEdit, onDelete, sortItems, sortConfig }) => {
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
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ width: "30%", cursor: "pointer" }}
              onClick={() => sortItems("nome_item")}
            >
              Nome {getSortIcon("nome_item")}
            </TableCell>
            <TableCell
              sx={{ width: "20%", cursor: "pointer" }}
              onClick={() => sortItems("tipo_item")}
            >
              Tipo {getSortIcon("tipo_item")}
            </TableCell>
            <TableCell
              sx={{ width: "20%", cursor: "pointer" }}
              onClick={() => sortItems("quantidade")}
            >
              Quantidade {getSortIcon("quantidade")}
            </TableCell>
            <TableCell align="right" sx={{ width: "30%" }}>
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
                  "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                  "&:hover": { backgroundColor: "#e0f7fa" }, // Efeito de hover
                }}
              >
                <TableCell>
                  {item.nome_item || "Nome não especificado"}
                </TableCell>
                <TableCell>
                  {item.tipo_item || "Tipo não especificado"}
                </TableCell>
                <TableCell>
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
              <TableCell colSpan={4} align="center">
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
