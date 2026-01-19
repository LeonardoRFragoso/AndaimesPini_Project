import React from 'react';
import { Box, Typography, Grid, useTheme, Paper, Card, CardContent, Fade } from '@mui/material';
import { TrendingUp, People, Inventory, Assessment, CheckCircle, Schedule } from '@mui/icons-material';

const ReportsSummaryPanel = ({ overviewData }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Debug log para verificar os dados recebidos
  console.log("ReportsSummaryPanel received overviewData:", overviewData);
  
  // Extrai e formata os dados do overview com valores padrão caso estejam ausentes
  const totalLocacoes = overviewData?.total_locacoes ?? "N/A";
  const receitaTotal = overviewData?.receita_total 
    ? `R$ ${parseFloat(overviewData.receita_total).toFixed(2)}`
    : "N/A";
  const clientesUnicos = overviewData?.clientes_unicos ?? "N/A";
  const itensUnicosAlugados = overviewData?.itens_unicos_alugados ?? "N/A";
  const locacoesConcluidas = overviewData?.locacoes_concluidas ?? "N/A";
  const locacoesPendentes = overviewData?.locacoes_pendentes ?? "N/A";

  const summaryCards = [
    {
      title: 'Total de Locações',
      value: totalLocacoes,
      icon: <Assessment />,
      color: '#2196f3',
      bgColor: 'rgba(33, 150, 243, 0.1)'
    },
    {
      title: 'Receita Total',
      value: receitaTotal,
      icon: <TrendingUp />,
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.1)'
    },
    {
      title: 'Clientes Únicos',
      value: clientesUnicos,
      icon: <People />,
      color: '#ff9800',
      bgColor: 'rgba(255, 152, 0, 0.1)'
    },
    {
      title: 'Itens Únicos Alugados',
      value: itensUnicosAlugados,
      icon: <Inventory />,
      color: '#9c27b0',
      bgColor: 'rgba(156, 39, 176, 0.1)'
    },
    {
      title: 'Locações Concluídas',
      value: locacoesConcluidas,
      icon: <CheckCircle />,
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.1)'
    },
    {
      title: 'Locações Pendentes',
      value: locacoesPendentes,
      icon: <Schedule />,
      color: '#f44336',
      bgColor: 'rgba(244, 67, 54, 0.1)'
    }
  ];

  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          borderRadius: 3,
          p: 2.5,
          mb: 3,
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Assessment />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            Resumo Geral
          </Typography>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Fade in timeout={300 + index * 100}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                  border: isDarkMode 
                    ? `1px solid ${card.color}30` 
                    : `1px solid ${card.color}20`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDarkMode 
                      ? `0 12px 24px ${card.color}20`
                      : `0 12px 24px ${card.color}15`,
                    borderColor: `${card.color}50`,
                  }
                }}
              >
                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: `${card.color}15`,
                      border: `1px solid ${card.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      transition: 'all 0.3s ease',
                      '& svg': {
                        color: card.color,
                        fontSize: '1.5rem'
                      }
                    }}
                  >
                    {card.icon}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                      mb: 1,
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}
                  >
                    {card.title}
                  </Typography>
                  
                  <Typography 
                    variant="h5"
                    sx={{ 
                      color: card.color,
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      fontFamily: String(card.value).includes('R$') ? 'monospace' : 'inherit',
                    }}
                  >
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsSummaryPanel;
