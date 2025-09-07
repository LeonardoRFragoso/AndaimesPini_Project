import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme } from '@mui/material';

const ReportsDataTable = ({ data, filter }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
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
        <TableContainer 
          component={Paper}
          sx={{
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.9)' : '#fff',
            boxShadow: theme => theme.palette.mode === 'dark' ? '0px 4px 12px rgba(0, 0, 0, 0.3)' : '0px 2px 4px rgba(0, 0, 0, 0.1)',
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.9)' : '#e0f2f1' }}>
              <TableRow>
                {headers.map((header) => (
                  <TableCell 
                    key={header}
                    sx={{ 
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                      fontWeight: 'bold'
                    }}
                  >
                    <strong>{header}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(60, 60, 60, 0.5)' : '#f9f9f9',
                    },
                    '&:hover': {
                      backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(70, 70, 70, 0.7)' : '#e0f7fa',
                    },
                  }}
                >
                  {filter === "overview" && (
                    <>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.label || "Indisponível"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.value || 0}</TableCell>
                    </>
                  )}
                  {filter === "by-client" && (
                    <>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.locacao_id || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.data_inicio || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.data_fim || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{formatCurrency(row.valor_total)}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.status || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.nome_item || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.tipo_item || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.quantidade ?? "0"}</TableCell>
                    </>
                  )}
                  {filter === "by-item" && (
                    <>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.locacao_id || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.data_inicio || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.data_fim || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.status || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.nome_item || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.quantidade ?? "0"}</TableCell>
                    </>
                  )}
                  {filter === "by-status" && (
                    <>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.status || "N/A"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{row.total_locacoes ?? "0"}</TableCell>
                      <TableCell sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{formatCurrency(row.receita_total)}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography 
          variant="body2" 
          align="center"
          sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
        >
          Nenhum dado disponível para o filtro selecionado.
        </Typography>
      )}
    </Box>
  );
};

export default ReportsDataTable;
