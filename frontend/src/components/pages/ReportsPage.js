import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, useTheme, Container, Paper } from "@mui/material";
import ReportsFilterForm from "../../components/reports/ReportsFilterForm";
import ReportsSummaryPanel from "../../components/reports/ReportsSummaryPanel";
import ReportsDataTable from "../../components/reports/ReportsDataTable";
import ReportsExportButton from "../../components/reports/ReportsExportButton";
import ReportsChart from "../../components/reports/ReportsChart";
import {
  fetchOverviewReport,
  fetchClientReport,
  fetchItemReport,
  fetchStatusReport,
} from "../../api/reports";

const ReportsPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [overviewData, setOverviewData] = useState({});
  const [clientData, setClientData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("overview");
  const [clientId, setClientId] = useState("");
  const [itemId, setItemId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("csv"); // Novo estado para formato de exportação
  const [chartType, setChartType] = useState("bar"); // Novo estado para tipo de gráfico
  const [error, setError] = useState(null);

  const handleFilterChange = (newFilter) => setFilter(newFilter);
  const handleClientIdChange = (id) => setClientId(id);
  const handleItemIdChange = (id) => setItemId(id);
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };
  const handleExportFormatChange = (format) => setExportFormat(format); // Manipulador para formato de exportação
  const handleChartTypeChange = (type) => setChartType(type); // Manipulador para tipo de gráfico

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      switch (filter) {
        case "overview":
          data = await fetchOverviewReport({ startDate, endDate });
          if (data && data.error) {
            throw new Error(data.error);
          }
          console.log("Overview data:", data);
          console.log("Setting overviewData to:", data || {});
          setOverviewData(data || {});
          break;

        case "by-client":
          if (clientId) {
            data = await fetchClientReport(clientId, { startDate, endDate });
            if (data && data.error) {
              throw new Error(data.error);
            }
            console.log("Client data:", data);
            setClientData(data || []);
          } else {
            setClientData([]);
          }
          break;

        case "by-item":
          if (itemId) {
            data = await fetchItemReport(itemId, { startDate, endDate });
            if (data && data.error) {
              throw new Error(data.error);
            }
            console.log("Item data:", data);
            setItemData(data || []);
          } else {
            setItemData([]);
          }
          break;

        case "by-status":
          data = await fetchStatusReport({ startDate, endDate });
          if (data && data.error) {
            throw new Error(data.error);
          }
          console.log("Status data:", data);
          setStatusData(data || []);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Erro ao carregar dados para o filtro ${filter}:`, error);
      setError(
        `Erro ao carregar dados para o filtro ${filter}: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      (filter === "by-client" && clientId) ||
      (filter === "by-item" && itemId) ||
      filter === "overview" ||
      filter === "by-status"
    ) {
      loadData();
    }
  }, [filter, clientId, itemId, startDate, endDate]);

  const colors = {
    primary: '#1B5E20',
    primaryDark: '#0D3D12',
  };

  return (
    <Box sx={{ 
      bgcolor: isDarkMode ? '#0a0a0a' : '#f5f7fa',
      minHeight: '100vh',
      pb: 4
    }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          pt: 3,
          pb: 8,
          px: { xs: 2, md: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#fff', 
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Relatórios
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
            Visualize relatórios detalhados sobre locações e desempenho
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -5 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            border: isDarkMode 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDarkMode
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.08)',
            bgcolor: isDarkMode ? '#1a1a2e' : '#fff',
            p: 4,
          }}
        >
          <ReportsFilterForm
        filter={filter}
        onFilterChange={handleFilterChange}
        onClientIdChange={handleClientIdChange}
        onItemIdChange={handleItemIdChange}
        onDateChange={handleDateChange}
        onExportFormatChange={handleExportFormatChange} // Passa o manipulador para formato de exportação
      />

      <ReportsSummaryPanel overviewData={overviewData} />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" mt={4}>
          {error}
        </Typography>
      ) : (
        <>
          <ReportsDataTable
            data={
              filter === "by-client"
                ? clientData
                : filter === "by-item"
                ? itemData
                : filter === "by-status"
                ? statusData
                : []
            }
            filter={filter}
          />
          <ReportsExportButton
            data={
              filter === "by-client"
                ? clientData
                : filter === "by-item"
                ? itemData
                : filter === "by-status"
                ? statusData
                : []
            }
            filename={`relatorio_${filter}`}
            exportFormat={exportFormat} // Adiciona o formato de exportação
            filter={filter} // Passa o filtro para exportação condicional
          />
          <ReportsChart
            data={
              filter === "by-client"
                ? clientData
                : filter === "by-item"
                ? itemData
                : filter === "by-status"
                ? statusData
                : []
            }
            filter={filter}
            chartType={chartType}
          />
        </>
      )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ReportsPage;
