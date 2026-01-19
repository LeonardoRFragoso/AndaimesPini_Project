import React, { useState } from 'react';
import { Box, TextField, Select, MenuItem, Button, Autocomplete, useTheme } from '@mui/material';
import { fetchClients, fetchItems } from '../../api/reports'; // Funções para buscar clientes e itens

const ReportsFilterForm = ({ filter, onFilterChange, onClientIdChange, onItemIdChange, onDateChange, onExportFormatChange }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
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
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      '& .MuiInputBase-root': {
        color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
      },
      '& .MuiInputLabel-root': {
        color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
      },
      '& .MuiSelect-icon': {
        color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
      },
    }}>
      <Select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        displayEmpty
        sx={{ 
          minWidth: 200,
          borderRadius: 2,
          backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.8)' : '#fff',
          '& .MuiSelect-select': {
            color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.5)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4caf50',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4caf50',
          }
        }}
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
        sx={{
          minWidth: 200,
          '& .MuiInputLabel-root': {
            whiteSpace: 'nowrap',
            overflow: 'visible',
            fontSize: '0.875rem',
            fontWeight: 500,
            backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : '#fff',
            px: 0.5,
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : '#fff',
            borderRadius: 2,
            '& fieldset': {
              borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.5)',
              '& legend': {
                maxWidth: 'unset',
              },
            },
            '&:hover fieldset': {
              borderColor: '#4caf50',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4caf50',
            }
          },
          '& input': {
            color: isDarkMode ? '#fff' : 'inherit',
          }
        }}
      />
      
      <TextField
        label="Data Fim"
        type="date"
        value={endDate}
        onChange={(e) => handleDateChange('end', e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{
          minWidth: 200,
          '& .MuiInputLabel-root': {
            whiteSpace: 'nowrap',
            overflow: 'visible',
            fontSize: '0.875rem',
            fontWeight: 500,
            backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : '#fff',
            px: 0.5,
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : '#fff',
            borderRadius: 2,
            '& fieldset': {
              borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.5)',
              '& legend': {
                maxWidth: 'unset',
              },
            },
            '&:hover fieldset': {
              borderColor: '#4caf50',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4caf50',
            }
          },
          '& input': {
            color: isDarkMode ? '#fff' : 'inherit',
          }
        }}
      />

      {filter === "by-client" && (
        <Autocomplete
          options={clientOptions}
          getOptionLabel={(option) => option.name || ""}
          onInputChange={(event, value) => handleClientSearch(value)}
          onChange={(event, newValue) => setSelectedClient(newValue)}
          renderInput={(params) => <TextField 
            {...params} 
            label="Nome do Cliente" 
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.8)' : '#fff',
              },
              '& input': {
                color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
              }
            }}
          />}
          sx={{
            '& .MuiAutocomplete-paper': {
              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.95)' : '#fff',
              color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
            }
          }}
        />
      )}

      {filter === "by-item" && (
        <Autocomplete
          options={itemOptions}
          getOptionLabel={(option) => option.name || ""}
          onInputChange={(event, value) => handleItemSearch(value)}
          onChange={(event, newValue) => setSelectedItem(newValue)}
          renderInput={(params) => <TextField 
            {...params} 
            label="Nome ou Tipo do Item" 
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.8)' : '#fff',
              },
              '& input': {
                color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
              }
            }}
          />}
          sx={{
            '& .MuiAutocomplete-paper': {
              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.95)' : '#fff',
              color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
            }
          }}
        />
      )}

      {filter === "by-status" && (
        <Select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          displayEmpty
          sx={{ 
            minWidth: 180,
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.8)' : '#fff',
            '& .MuiSelect-select': {
              color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
            },
          }}
        >
          <MenuItem value="csv">Exportar CSV</MenuItem>
          <MenuItem value="excel">Exportar Excel</MenuItem>
          <MenuItem value="chart">Exportar Gráfico</MenuItem>
        </Select>
      )}

      <Button
        variant="contained"
        onClick={applyFilters}
        size="large"
        sx={{ 
          background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
          color: 'white',
          fontWeight: 600,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1b3a1c 0%, #388e3c 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        Aplicar Filtros
      </Button>
    </Box>
  );
};

export default ReportsFilterForm;
