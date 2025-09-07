import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import ReportsFilterForm from '../../components/reports/ReportsFilterForm';
import ReportsSummaryPanel from '../../components/reports/ReportsSummaryPanel';
import ReportsDataTable from '../../components/reports/ReportsDataTable';
import ReportsExportButton from '../../components/reports/ReportsExportButton';
import ReportsChart from '../../components/reports/ReportsChart';
import {
  fetchOverviewReport,
  fetchClientReport,
  fetchItemReport,
  fetchStatusReport,
} from '../../api/reports';

const ReportsPage = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [clientData, setClientData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("overview");
  const [clientId, setClientId] = useState("");
  const [itemId, setItemId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilterChange = (newFilter) => setFilter(newFilter);
  const handleClientIdChange = (id) => setClientId(id);
  const handleItemIdChange = (id) => setItemId(id);
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let data;
      switch (filter) {
        case "overview":
          data = await fetchOverviewReport({ startDate, endDate });
          console.log("Overview data received:", data);
          setOverviewData(data);
          break;
        case "by-client":
          if (clientId) {
            data = await fetchClientReport(clientId, { startDate, endDate });
            setClientData(data.data);
          }
          break;
        case "by-item":
          if (itemId) {
            data = await fetchItemReport(itemId, { startDate, endDate });
            setItemData(data.data);
          }
          break;
        case "by-status":
          data = await fetchStatusReport({ startDate, endDate });
          setStatusData(data.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Erro ao carregar dados para o filtro ${filter}:`, error);
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
    <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom align="center">
        Relatórios
      </Typography>

      <ReportsFilterForm
        filter={filter}
        onFilterChange={handleFilterChange}
        onClientIdChange={handleClientIdChange}
        onItemIdChange={handleItemIdChange}
        onDateChange={handleDateChange}
      />

      <ReportsSummaryPanel overviewData={overviewData} />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
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
                : overviewData || []
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
                : overviewData || []
            }
            filename={`relatorio_${filter}`}
          />
          <ReportsChart
            data={
              filter === "by-client"
                ? clientData
                : filter === "by-item"
                ? itemData
                : filter === "by-status"
                ? statusData
                : overviewData || []
            }
            filter={filter}
          />
        </>
      )}
    </Box>
  );
};

export default ReportsPage;
