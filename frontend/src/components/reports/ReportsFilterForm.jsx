import React, { useState } from 'react';
import { Box, TextField, Select, MenuItem, Button, Autocomplete } from '@mui/material';
import { fetchClients, fetchItems } from '../../api/reports'; // Funções para buscar clientes e itens

const ReportsFilterForm = ({ filter, onFilterChange, onClientIdChange, onItemIdChange, onDateChange, onExportFormatChange }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientOptions, setClientOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [exportFormat, setExportFormat] = useState("csv");

  const handleDateChange = (field, value) => {
    if (field === 'start') {
      setStartDate(value);
    } else if (field === 'end') {
      setEndDate(value);
    }
  };

  const applyFilters = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert("A data de início não pode ser maior que a data de fim.");
      return;
    }

    // Aplica os filtros usando os IDs obtidos dos autocompletes
    onDateChange(startDate, endDate);
    onClientIdChange(selectedClient ? selectedClient.id : null);
    onItemIdChange(selectedItem ? selectedItem.id : null);
    onExportFormatChange(exportFormat);
  };

  // Função para buscar clientes conforme o usuário digita
  const handleClientSearch = async (inputValue) => {
    if (inputValue) {
      const clients = await fetchClients(inputValue); // Endpoint para busca de clientes
      setClientOptions(clients);
    }
  };

  // Função para buscar itens conforme o usuário digita
  const handleItemSearch = async (inputValue) => {
    if (inputValue) {
      const items = await fetchItems(inputValue); // Endpoint para busca de itens
      setItemOptions(items);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        displayEmpty
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="overview">Visão Geral</MenuItem>
        <MenuItem value="by-client">Por Cliente</MenuItem>
        <MenuItem value="by-item">Por Item</MenuItem>
        <MenuItem value="by-status">Por Status</MenuItem>
      </Select>

      <TextField
        label="Data Início"
        type="date"
        value={startDate}
        onChange={(e) => handleDateChange('start', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      
      <TextField
        label="Data Fim"
        type="date"
        value={endDate}
        onChange={(e) => handleDateChange('end', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      {filter === "by-client" && (
        <Autocomplete
          options={clientOptions}
          getOptionLabel={(option) => option.name || ""}
          onInputChange={(event, value) => handleClientSearch(value)}
          onChange={(event, newValue) => setSelectedClient(newValue)}
          renderInput={(params) => <TextField {...params} label="Nome do Cliente" />}
        />
      )}

      {filter === "by-item" && (
        <Autocomplete
          options={itemOptions}
          getOptionLabel={(option) => option.name || ""}
          onInputChange={(event, value) => handleItemSearch(value)}
          onChange={(event, newValue) => setSelectedItem(newValue)}
          renderInput={(params) => <TextField {...params} label="Nome ou Tipo do Item" />}
        />
      )}

      {filter === "by-status" && (
        <Select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="csv">Exportar CSV</MenuItem>
          <MenuItem value="excel">Exportar Excel</MenuItem>
          <MenuItem value="chart">Exportar Gráfico</MenuItem>
        </Select>
      )}

      <Button
        variant="contained"
        onClick={applyFilters}
        sx={{ alignSelf: 'center' }}
      >
        Aplicar Filtros
      </Button>
    </Box>
  );
};

export default ReportsFilterForm;
