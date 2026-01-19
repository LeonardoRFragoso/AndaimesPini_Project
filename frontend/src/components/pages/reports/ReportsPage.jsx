import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Container, Paper, useTheme, Fade, Chip } from '@mui/material';
import { Assessment, FilterList, BarChart } from '@mui/icons-material';
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
  const isDarkMode = theme.palette.mode === 'dark';

  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
  };

  const filterLabels = {
    'overview': 'Visão Geral',
    'by-client': 'Por Cliente',
    'by-item': 'Por Item',
    'by-status': 'Por Status',
  };

  return (
    <Box sx={{ 
      bgcolor: isDarkMode ? '#0a0a0a' : '#f5f7fa',
      minHeight: '100vh',
      pb: 4
    }}>
      {/* Modern Gradient Header */}
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
        {/* Enhanced Filter Section */}
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
            mb: 4,
          }}
        >
          <Box sx={{
            padding: 3,
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : '#fff',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ 
                backgroundColor: `${colors.primary}20`, 
                borderRadius: 2, 
                p: 1, 
                display: 'flex' 
              }}>
                <FilterList sx={{ color: colors.primary }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filtros
              </Typography>
              <Chip 
                label={filterLabels[filter] || filter}
                size="small"
                sx={{ 
                  ml: 1,
                  backgroundColor: `${colors.primary}20`,
                  color: colors.primary,
                  fontWeight: 500,
                }}
              />
              {(startDate || endDate) && (
                <Chip 
                  label={`${startDate || '...'} → ${endDate || '...'}`}
                  size="small"
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>
            <ReportsFilterForm
              filter={filter}
              onFilterChange={handleFilterChange}
              onClientIdChange={handleClientIdChange}
              onItemIdChange={handleItemIdChange}
              onDateChange={handleDateChange}
            />
          </Box>
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
            <Fade in timeout={500}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 4,
                  borderRadius: 4,
                  bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : '#fff',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isDarkMode
                    ? '0 4px 20px rgba(0,0,0,0.3)'
                    : '0 4px 20px rgba(0,0,0,0.08)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Box sx={{ 
                    backgroundColor: `${colors.primary}20`, 
                    borderRadius: 2, 
                    p: 1, 
                    display: 'flex' 
                  }}>
                    <BarChart sx={{ color: colors.primary }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Gráfico do Relatório ({filterLabels[filter]})
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
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
                </Box>
                
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
            </Fade>
          </>
        )}
      </Container>
    </Box>
  );
};

export default ReportsPage;
