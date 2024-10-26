// OrdersTable.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const OrdersTable = () => {
  // Dados de exemplo para os pedidos. Substitua por dados reais ou integre com uma API.
  const orders = [
    { id: 1, date: "2024-10-01", status: "Concluído" },
    { id: 2, date: "2024-10-05", status: "Pendente" },
    { id: 3, date: "2024-10-10", status: "Cancelado" },
  ];

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID do Pedido</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrdersTable;
