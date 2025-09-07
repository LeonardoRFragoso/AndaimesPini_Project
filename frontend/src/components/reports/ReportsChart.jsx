import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';

const ReportsChart = ({ data, filter, chartType = "bar" }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  // Mapeia labels e valores para o gráfico, tratando a estrutura dos dados conforme o filtro
  const labels = data.map((item) => 
    filter === "by-client" ? item.nome_cliente :
    filter === "by-item" ? item.nome_item :
    filter === "by-status" ? item.status :
    "Indisponível"
  );
  
  const values = data.map((item) => 
    filter === "by-client" ? item.total_locacoes :
    filter === "by-item" ? item.quantidade :
    filter === "by-status" ? item.total_locacoes :
    0
  );

  // Configuração do gráfico com os dados mapeados
  const chartData = {
    labels,
    datasets: [
      {
        label: 
          filter === "by-client" ? "Locações por Cliente" :
          filter === "by-item" ? "Uso por Item" :
          filter === "by-status" ? "Locações por Status" :
          "Visão Geral",
        data: values,
        backgroundColor: chartType === "pie" ? 
          isDarkMode ? 
            ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 
             'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'] :
            ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] : 
          isDarkMode ? 'rgba(76, 175, 80, 0.5)' : 'rgba(75, 192, 192, 0.2)',
        borderColor: chartType === "pie" ? 
          isDarkMode ? 
            ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 
             'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'] :
            ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] :
          isDarkMode ? 'rgba(76, 175, 80, 1)' : 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Opções de configuração do gráfico
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#fff' : '#333',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Gráfico do Relatório (${filter === "by-client" ? "Cliente" :
                            filter === "by-item" ? "Item" :
                            filter === "by-status" ? "Status" : "Visão Geral"})`,
        color: isDarkMode ? '#fff' : '#333',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: chartType === "pie" ? {} : { // Pie chart does not require scales
      x: {
        title: {
          display: true,
          text:
            filter === "by-client" ? "Clientes" :
            filter === "by-item" ? "Itens" :
            filter === "by-status" ? "Status" :
            "Categorias",
          color: isDarkMode ? '#fff' : '#333',
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#333',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valores',
          color: isDarkMode ? '#fff' : '#333',
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#333',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
  };

  // Renderiza o gráfico baseado no tipo selecionado
  const renderChart = () => {
    switch(chartType) {
      case "bar":
        return <Bar data={chartData} options={chartOptions} />;
      case "pie":
        return <Pie data={chartData} options={chartOptions} />;
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  return (
    <Box sx={{ 
      mt: 4,
      backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.9)' : 'transparent',
      padding: 2,
      borderRadius: '8px',
      boxShadow: theme => theme.palette.mode === 'dark' ? '0px 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
          fontWeight: "bold"
        }}
      >
        Gráfico do Relatório ({filter === "by-client" ? "Cliente" :
                            filter === "by-item" ? "Item" :
                            filter === "by-status" ? "Status" : "Visão Geral"})
      </Typography>
      {data.length > 0 ? (
        renderChart()
      ) : (
        <Typography 
          variant="body2" 
          align="center"
          sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
        >
          Nenhum dado disponível para exibição no gráfico.
        </Typography>
      )}
    </Box>
  );
};

export default ReportsChart;
