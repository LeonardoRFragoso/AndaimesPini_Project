import React from 'react';
import { Box, Typography } from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';

const ReportsChart = ({ data, filter, chartType = "bar" }) => {
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
          ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] : 
          'rgba(75, 192, 192, 0.2)',
        borderColor: chartType === "pie" ? 
          ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] :
          'rgba(75, 192, 192, 1)',
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
      },
      title: {
        display: true,
        text: `Gráfico do Relatório (${filter === "by-client" ? "Cliente" :
                            filter === "by-item" ? "Item" :
                            filter === "by-status" ? "Status" : "Visão Geral"})`,
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
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valores',
        },
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
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Gráfico do Relatório ({filter === "by-client" ? "Cliente" :
                            filter === "by-item" ? "Item" :
                            filter === "by-status" ? "Status" : "Visão Geral"})
      </Typography>
      {data.length > 0 ? (
        renderChart()
      ) : (
        <Typography variant="body2" color="textSecondary" align="center">
          Nenhum dado disponível para exibição no gráfico.
        </Typography>
      )}
    </Box>
  );
};

export default ReportsChart;
