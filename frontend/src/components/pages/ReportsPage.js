import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, useTheme } from "@mui/material";
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

  return (
    <Box sx={{ 
      p: 4, 
      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : '#f5f5f5', 
      minHeight: "100vh",
      color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center"
        sx={{ 
          color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
          fontWeight: "bold"
        }}
      >
        Relatórios
      </Typography>

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
            chartType={chartType} // Adiciona o tipo de gráfico
          />
        </>
      )}
    </Box>
  );
};

export default ReportsPage;
