import React from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';

const ReportsSummaryPanel = ({ overviewData }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
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
    <Box sx={{ 
      mb: 4, 
      p: 3, 
      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.9)' : '#e0f7fa', 
      borderRadius: "8px", 
      boxShadow: theme => theme.palette.mode === 'dark' ? '0px 4px 12px rgba(0, 0, 0, 0.3)' : 1,
      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
    }}>
      <Typography 
        variant="h6" 
        gutterBottom 
        align="center"
        sx={{ 
          color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
          fontWeight: "bold"
        }}
      >
        Resumo Geral
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2}>
          <Typography 
            variant="body2" 
            sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            Total de Locações
          </Typography>
          <Typography 
            variant="body1"
            sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}
          >
            {totalLocacoes}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography 
            variant="body2" 
            sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            Receita Total
          </Typography>
          <Typography 
            variant="body1"
            sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}
          >
            {receitaTotal}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography 
            variant="body2" 
            sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            Clientes Únicos
          </Typography>
          <Typography 
            variant="body1"
            sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}
          >
            {clientesUnicos}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography 
            variant="body2" 
            sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            Itens Únicos Alugados
          </Typography>
          <Typography 
            variant="body1"
            sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}
          >
            {itensUnicosAlugados}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography 
            variant="body2" 
            sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            Locações Concluídas
          </Typography>
          <Typography 
            variant="body1"
            sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}
          >
            {locacoesConcluidas}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Typography 
            variant="body2" 
            sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            Locações Pendentes
          </Typography>
          <Typography 
            variant="body1"
            sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}
          >
            {locacoesPendentes}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsSummaryPanel;
