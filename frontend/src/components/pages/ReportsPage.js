import React, { useState, useEffect } from "react";
import {
  fetchOverviewReport,
  fetchClientReport,
  fetchStatusReport,
} from "../../api/reports";
import {
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Box,
  CircularProgress,
  Grid,
  IconButton,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { format } from "date-fns";

const ReportsPage = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [clientData, setClientData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("overview");
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        setLoading(true);
        const data = await fetchOverviewReport();
        setOverviewData(data);
      } catch (error) {
        console.error("Erro ao carregar dados de visão geral:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOverviewData();
  }, []);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setClientData([]);
    setStatusData([]);
  };

  const loadClientReport = async () => {
    if (!clientId) {
      alert("Por favor, insira um ID de cliente.");
      return;
    }
    try {
      setLoading(true);
      const data = await fetchClientReport(clientId, startDate, endDate);
      setClientData(data);
    } catch (error) {
      console.error("Erro ao carregar relatório do cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatusReport = async () => {
    try {
      setLoading(true);
      const data = await fetchStatusReport(startDate, endDate);
      setStatusData(data);
    } catch (error) {
      console.error("Erro ao carregar relatório por status:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csvData = data.map((row) => Object.values(row).join(",")).join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Relatórios
      </Typography>

      {/* Seletor de filtros */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Select
          value={filter}
          onChange={handleFilterChange}
          displayEmpty
          sx={{ minWidth: "200px" }}
        >
          <MenuItem value="overview">Visão Geral</MenuItem>
          <MenuItem value="by-client">Por Cliente</MenuItem>
          <MenuItem value="by-status">Por Status</MenuItem>
        </Select>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Data Início"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data Fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Conteúdo do relatório de visão geral */}
          {filter === "overview" && overviewData && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Resumo Geral</Typography>
              <p>Total de Locações: {overviewData.total_locacoes}</p>
              <p>Receita Total: R$ {overviewData.receita_total.toFixed(2)}</p>
            </Box>
          )}

          {/* Conteúdo do relatório por cliente */}
          {filter === "by-client" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Relatório por Cliente
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TextField
                  label="ID do Cliente"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  type="number"
                  variant="outlined"
                  size="small"
                />
                <Button variant="contained" onClick={loadClientReport}>
                  Carregar Relatório
                </Button>
              </Box>
              {clientData.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data de Início</TableCell>
                        <TableCell>Data de Fim</TableCell>
                        <TableCell>Valor Total</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {format(new Date(row.data_inicio), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(row.data_fim), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>R$ {row.valor_total.toFixed(2)}</TableCell>
                          <TableCell>{row.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() =>
                      exportToCSV(clientData, `relatorio_cliente_${clientId}`)
                    }
                    sx={{ mt: 2 }}
                  >
                    Exportar CSV
                  </Button>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Conteúdo do relatório por status */}
          {filter === "by-status" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Relatório por Status
              </Typography>
              <Button
                variant="contained"
                onClick={loadStatusReport}
                sx={{ mb: 2 }}
              >
                Carregar Relatório
              </Button>
              {statusData.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Total Locações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statusData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.status}</TableCell>
                          <TableCell>{row.total_locacoes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => exportToCSV(statusData, "relatorio_status")}
                    sx={{ mt: 2 }}
                  >
                    Exportar CSV
                  </Button>
                </TableContainer>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ReportsPage;
