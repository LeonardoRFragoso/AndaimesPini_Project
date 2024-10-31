import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ReportsDataTable = ({ data, filter }) => {
  // Define as colunas da tabela de acordo com o filtro selecionado
  const columns = {
    overview: ["Categoria", "Valor"],
    "by-client": ["Locação ID", "Data Início", "Data Fim", "Valor Total", "Status", "Nome do Item", "Tipo do Item", "Quantidade"],
    "by-item": ["Locação ID", "Data Início", "Data Fim", "Status", "Nome do Item", "Quantidade"],
    "by-status": ["Status", "Total de Locações", "Receita Total"]
  };

  // Seleciona as colunas com base no filtro atual
  const headers = columns[filter] || [];

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return value ? `R$ ${parseFloat(value).toFixed(2)}` : "N/A";
  };

  return (
    <Box sx={{ mt: 4 }}>
      {data.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell key={header}><strong>{header}</strong></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {filter === "overview" && (
                    <>
                      <TableCell>{row.label || "Indisponível"}</TableCell>
                      <TableCell>{row.value || 0}</TableCell>
                    </>
                  )}
                  {filter === "by-client" && (
                    <>
                      <TableCell>{row.locacao_id || "N/A"}</TableCell>
                      <TableCell>{row.data_inicio || "N/A"}</TableCell>
                      <TableCell>{row.data_fim || "N/A"}</TableCell>
                      <TableCell>{formatCurrency(row.valor_total)}</TableCell>
                      <TableCell>{row.status || "N/A"}</TableCell>
                      <TableCell>{row.nome_item || "N/A"}</TableCell>
                      <TableCell>{row.tipo_item || "N/A"}</TableCell>
                      <TableCell>{row.quantidade ?? "0"}</TableCell>
                    </>
                  )}
                  {filter === "by-item" && (
                    <>
                      <TableCell>{row.locacao_id || "N/A"}</TableCell>
                      <TableCell>{row.data_inicio || "N/A"}</TableCell>
                      <TableCell>{row.data_fim || "N/A"}</TableCell>
                      <TableCell>{row.status || "N/A"}</TableCell>
                      <TableCell>{row.nome_item || "N/A"}</TableCell>
                      <TableCell>{row.quantidade ?? "0"}</TableCell>
                    </>
                  )}
                  {filter === "by-status" && (
                    <>
                      <TableCell>{row.status || "N/A"}</TableCell>
                      <TableCell>{row.total_locacoes ?? "0"}</TableCell>
                      <TableCell>{formatCurrency(row.receita_total)}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="textSecondary" align="center">
          Nenhum dado disponível para o filtro selecionado.
        </Typography>
      )}
    </Box>
  );
};

export default ReportsDataTable;
