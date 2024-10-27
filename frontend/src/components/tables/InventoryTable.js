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
import { Edit, Delete } from "@mui/icons-material";

const InventoryTable = ({ items, onEdit, onDelete }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "30%" }}>Nome</TableCell>
            <TableCell sx={{ width: "20%" }}>Tipo</TableCell>
            <TableCell sx={{ width: "20%" }}>Quantidade</TableCell>
            <TableCell align="right" sx={{ width: "30%" }}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id}>
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
