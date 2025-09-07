import React from 'react';
import { Button, useTheme } from '@mui/material';
import { Download } from '@mui/icons-material';
import { downloadStatusExcel, downloadStatusChart } from '../../api/reports'; // Importa funções de download da API

const ReportsExportButton = ({ data, filename, exportFormat = "csv", filter }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      console.warn("Nenhum dado disponível para exportar.");
      alert("Nenhum dado disponível para exportação.");
      return;
    }

    try {
      // Obtém os cabeçalhos das colunas a partir das chaves do primeiro objeto
      const headers = Object.keys(data[0]).map((header) => `"${header}"`).join(",");
      
      // Mapeia os valores de cada linha e os formata corretamente
      const csvRows = data.map((row) => 
        Object.values(row)
          .map(value => `"${String(value).replace(/"/g, '""')}"`) // Escapa aspas duplas em valores
          .join(",")
      );

      // Junta os cabeçalhos e as linhas de dados
      const csvContent = [headers, ...csvRows].join("\n");

      // Cria o arquivo blob e link de download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.csv`;

      // Anexa, clica e remove o link para iniciar o download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Libera a URL do objeto após o download
      URL.revokeObjectURL(url);

      console.log("Exportação para CSV concluída com sucesso.");
    } catch (error) {
      console.error("Erro ao exportar dados para CSV:", error);
      alert("Ocorreu um erro ao exportar os dados. Tente novamente.");
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case "csv":
        exportToCSV();
        break;
      case "excel":
        downloadStatusExcel()
          .then(() => console.log("Exportação para Excel concluída com sucesso."))
          .catch((error) => {
            console.error("Erro ao exportar dados para Excel:", error);
            alert("Ocorreu um erro ao exportar os dados para Excel. Tente novamente.");
          });
        break;
      case "chart":
        downloadStatusChart()
          .then(() => console.log("Exportação de gráfico concluída com sucesso."))
          .catch((error) => {
            console.error("Erro ao exportar gráfico:", error);
            alert("Ocorreu um erro ao exportar o gráfico. Tente novamente.");
          });
        break;
      default:
        console.warn("Formato de exportação desconhecido.");
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={<Download />}
      onClick={handleExport}
      size="large"
      sx={{ 
        background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
        color: 'white',
        fontWeight: 600,
        fontSize: '1rem',
        px: 4,
        py: 1.5,
        borderRadius: 2,
        textTransform: 'none',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
        mb: 3,
        '&:hover': {
          background: 'linear-gradient(135deg, #1b3a1c 0%, #388e3c 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
        },
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {exportFormat === "excel" ? "Exportar Excel" : exportFormat === "chart" ? "Exportar Gráfico" : "Exportar CSV"}
    </Button>
  );
};

export default ReportsExportButton;
