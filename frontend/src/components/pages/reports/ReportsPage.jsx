import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Container, Paper, useTheme } from '@mui/material';
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

  const theme = useTheme();

  return (
    <Box sx={{ 
      bgcolor: theme => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="xl">
        {/* Modern Gradient Header */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
            borderRadius: 3,
            p: 4,
            mb: 4,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Relatórios
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              opacity: 0.9,
              fontWeight: 400
            }}
          >
            Análise completa dos dados de locação
          </Typography>
        </Paper>

        {/* Enhanced Filter Section */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <ReportsFilterForm
            filter={filter}
            onFilterChange={handleFilterChange}
            onClientIdChange={handleClientIdChange}
            onItemIdChange={handleItemIdChange}
            onDateChange={handleDateChange}
          />
        </Paper>

        <ReportsSummaryPanel overviewData={overviewData} />

        {loading ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center"
            sx={{ 
              mt: 8,
              mb: 8,
              minHeight: '200px'
            }}
          >
            <CircularProgress 
              size={60}
              sx={{ 
                color: '#4caf50'
              }}
            />
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
            
            {/* Enhanced Export and Chart Section */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mt: 4,
                borderRadius: 3,
                bgcolor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                textAlign: 'center'
              }}
            >
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
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default ReportsPage;
