import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

const ReportsSummaryPanel = ({ overviewData }) => {
  // Extrai e formata os dados do overview com valores padrão caso estejam ausentes
  const totalLocacoes = overviewData?.total_locacoes ?? "N/A";
  const receitaTotal = overviewData?.receita_total 
    ? `R$ ${parseFloat(overviewData.receita_total).toFixed(2)}`
    : "N/A";
  const clientesUnicos = overviewData?.clientes_unicos ?? "N/A";
  const itensUnicosAlugados = overviewData?.itens_unicos_alugados ?? "N/A";
  const locacoesConcluidas = overviewData?.locacoes_concluidas ?? "N/A";
  const locacoesPendentes = overviewData?.locacoes_pendentes ?? "N/A";

  return (
    <Box sx={{ mb: 4, p: 3, bgcolor: "#e0f7fa", borderRadius: "8px", boxShadow: 1 }}>
      <Typography variant="h6" gutterBottom align="center">Resumo Geral</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2}>
          <Typography variant="body2" color="textSecondary">Total de Locações</Typography>
          <Typography variant="body1">{totalLocacoes}</Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography variant="body2" color="textSecondary">Receita Total</Typography>
          <Typography variant="body1">{receitaTotal}</Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography variant="body2" color="textSecondary">Clientes Únicos</Typography>
          <Typography variant="body1">{clientesUnicos}</Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography variant="body2" color="textSecondary">Itens Únicos Alugados</Typography>
          <Typography variant="body1">{itensUnicosAlugados}</Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography variant="body2" color="textSecondary">Locações Concluídas</Typography>
          <Typography variant="body1">{locacoesConcluidas}</Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography variant="body2" color="textSecondary">Locações Pendentes</Typography>
          <Typography variant="body1">{locacoesPendentes}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsSummaryPanel;
