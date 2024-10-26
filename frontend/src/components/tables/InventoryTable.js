// src/components/tables/InventoryTable.js
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const InventoryTable = ({ items, onEdit, onDelete, fetchItems }) => {
  // Atualiza a tabela ao montar o componente ou quando `fetchItems` é alterado
  useEffect(() => {
    if (typeof fetchItems === "function") {
      fetchItems();
    }
  }, [fetchItems]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Quantidade</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id || item.nome_item}>
                <TableCell>{item.nome_item}</TableCell> {/* Nome ajustado */}
                <TableCell>{item.quantidade}</TableCell>{" "}
                {/* Quantidade ajustada */}
                <TableCell align="right">
                  <IconButton onClick={() => onEdit(item)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(item.id || item.nome_item)}
                  >
                    <Delete color="secondary" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
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
