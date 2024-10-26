// InventoryList.js
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
            <TableCell>Item</TableCell>
            <TableCell>Quantidade</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell align="right">
                <IconButton color="primary" onClick={() => onEdit(item)}>
                  <Edit />
                </IconButton>
                <IconButton color="secondary" onClick={() => onDelete(item.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default InventoryList;
