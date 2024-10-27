// src/components/pages/inventory/InventoryList.js
import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const InventoryList = ({ items, onEdit, onDelete }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Lista de Inventário
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "50%" }}>Item</TableCell>
            <TableCell sx={{ width: "30%" }}>Quantidade</TableCell>
            <TableCell align="right" sx={{ width: "20%" }}>
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
                  {item.quantidade ?? "Quantidade não especificada"}
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => onEdit(item)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => onDelete(item.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                Nenhum item encontrado no inventário.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default InventoryList;
