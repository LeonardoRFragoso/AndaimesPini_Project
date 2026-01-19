import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  useTheme,
  Container,
  Chip,
  Fade,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  Person,
  LocationOn,
  Phone,
  Bookmark,
  Search,
  People,
  TrendingUp,
  Settings,
} from "@mui/icons-material";
import { listarClientes, criarCliente, atualizarCliente, excluirCliente, obterPedidosCliente } from "../../api/clientes";

const ClientsPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [openOrdersModal, setOpenOrdersModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add");
  const [currentClient, setCurrentClient] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    referencia: "",
  });

  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await listarClientes();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao buscar clientes.", "error");
    }
  };

  // Filtro de busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter((client) =>
        Object.values(client).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  // Estatísticas
  const totalClients = clients.length;
  const uniqueCities = [...new Set(clients.map(c => c.endereco?.split(',')[0]?.trim()).filter(Boolean))].length;

  const fetchClientOrders = async (clientId) => {
    try {
      const data = await obterPedidosCliente(clientId);
      setOrders(data);
      setOpenOrdersModal(true);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao buscar pedidos do cliente.", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleDialogOpen = (type, client = null) => {
    setDialogType(type);
    if (client) {
      setCurrentClient(client);
    } else {
      setCurrentClient({
        nome: "",
        endereco: "",
        telefone: "",
        referencia: "",
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogSave = async () => {
    if (dialogType === "add") {
      await handleAddClient();
    } else {
      await handleEditClient(currentClient.id);
    }
    handleDialogClose();
  };

  const handleAddClient = async () => {
    try {
      await criarCliente(currentClient);
      fetchClients();
      showSnackbar("Cliente adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao adicionar cliente.", "error");
    }
  };

  const handleEditClient = async (id) => {
    try {
      await atualizarCliente(id, currentClient);
      fetchClients();
      showSnackbar("Cliente editado com sucesso!");
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao editar cliente.", "error");
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este cliente?")) return;
    try {
      await excluirCliente(id);
      fetchClients();
      showSnackbar("Cliente removido com sucesso!");
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao remover cliente.", "error");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenOrdersModal = (client) => {
    setSelectedClient(client);
    fetchClientOrders(client.id);
  };

  const handleCloseOrdersModal = () => {
    setOpenOrdersModal(false);
    setOrders([]);
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#fff', 
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Clientes
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
            Aqui você pode gerenciar todos os clientes cadastrados
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -5 }}>

        {/* Card Container */}
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
          {/* Enhanced Add Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleDialogOpen("add")}
              size="large"
              sx={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '12px 32px',
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: `0 4px 12px ${colors.primary}40`,
                "&:hover": { 
                  background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 20px ${colors.primary}50`,
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Adicionar Novo Cliente
            </Button>
          </Box>

          {/* Cards de Estatísticas */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 3, 
            mb: 4 
          }}>
            <Fade in timeout={300}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(46, 125, 50, 0.3)' : 'rgba(46, 125, 50, 0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode 
                      ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 24px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Box sx={{ 
                  backgroundColor: `${colors.primary}20`, 
                  borderRadius: 2, 
                  p: 1.5, 
                  display: 'flex' 
                }}>
                  <People sx={{ color: colors.primary, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary }}>
                    {totalClients}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Clientes Cadastrados
                  </Typography>
                </Box>
              </Paper>
            </Fade>

            <Fade in timeout={500}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode 
                      ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 24px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Box sx={{ 
                  backgroundColor: 'rgba(33, 150, 243, 0.2)', 
                  borderRadius: 2, 
                  p: 1.5, 
                  display: 'flex' 
                }}>
                  <LocationOn sx={{ color: '#2196f3', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    {uniqueCities}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Regiões Atendidas
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          </Box>

          {/* Campo de Busca Melhorado */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              backgroundColor: isDarkMode ? 'rgba(40, 40, 40, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: isDarkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ 
                backgroundColor: `${colors.primary}20`, 
                borderRadius: 2, 
                p: 1, 
                display: 'flex' 
              }}>
                <Search sx={{ color: colors.primary }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Buscar Cliente
              </Typography>
              {searchTerm && (
                <Chip 
                  label={`"${searchTerm}"`}
                  size="small"
                  onDelete={() => setSearchTerm('')}
                  sx={{ 
                    ml: 1,
                    backgroundColor: `${colors.primary}20`,
                    color: colors.primary,
                    fontWeight: 500,
                  }}
                />
              )}
              {searchTerm && (
                <Chip 
                  label={`${filteredClients.length} encontrado(s)`}
                  size="small"
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>
            <TextField
              placeholder="Digite o nome, telefone, endereço ou referência..."
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#fafafa',
                  },
                  '&.Mui-focused': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#fff',
                    boxShadow: `0 0 0 2px ${colors.primaryLight}40`,
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: isDarkMode ? '#fff' : 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                },
              }}
            />
          </Paper>

          {/* Table Container */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fafbfc',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
          >
          <TableContainer>
            <Table>
              <TableHead 
                sx={{ 
                  background: isDarkMode 
                    ? `linear-gradient(135deg, ${colors.primary}40 0%, ${colors.primaryLight}30 100%)`
                    : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primaryLight}10 100%)`,
                  borderBottom: isDarkMode 
                    ? `2px solid ${colors.primaryLight}60` 
                    : `2px solid ${colors.primary}`,
                }}
              >
                <TableRow>
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 2,
                    borderBottom: 'none',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                      Nome
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 2,
                    borderBottom: 'none',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                      Endereço
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 2,
                    borderBottom: 'none',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                      Telefone
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 2,
                    borderBottom: 'none',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bookmark fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                      Referência
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 2,
                    borderBottom: 'none',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                      <Settings fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                      Ações
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client, index) => (
                    <Fade in timeout={200 + index * 50} key={client.id}>
                      <TableRow
                        sx={{
                          "&:nth-of-type(odd)": { 
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
                          },
                          "&:hover": { 
                            backgroundColor: isDarkMode 
                              ? 'rgba(46, 125, 50, 0.08)' 
                              : 'rgba(46, 125, 50, 0.04)',
                            transform: 'translateY(-1px)',
                            boxShadow: isDarkMode 
                              ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                              : '0 4px 12px rgba(0, 0, 0, 0.08)',
                          },
                          borderBottom: isDarkMode 
                            ? '1px solid rgba(255, 255, 255, 0.06)' 
                            : '1px solid rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <TableCell sx={{ 
                          color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
                          fontWeight: 600,
                          py: 2,
                          px: 2,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              backgroundColor: `${colors.primary}15`,
                              borderRadius: 1.5,
                              p: 0.75,
                              display: 'flex',
                            }}>
                              <Person fontSize="small" sx={{ color: colors.primary, fontSize: 16 }} />
                            </Box>
                            {client.nome || (
                              <Typography sx={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                                Não informado
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ 
                          color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                          py: 2,
                          px: 2,
                        }}>
                          {client.endereco || (
                            <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                              Não informado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ 
                          color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                          py: 2,
                          px: 2,
                          fontFamily: 'monospace',
                          fontWeight: 500,
                        }}>
                          {client.telefone || (
                            <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                              Não informado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ 
                          color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                          py: 2,
                          px: 2,
                        }}>
                          {client.referencia ? (
                            <Chip 
                              label={client.referencia}
                              size="small"
                              sx={{ 
                                backgroundColor: isDarkMode ? 'rgba(156, 39, 176, 0.15)' : 'rgba(156, 39, 176, 0.1)',
                                color: isDarkMode ? '#ce93d8' : '#7b1fa2',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                border: `1px solid ${isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(156, 39, 176, 0.2)'}`,
                              }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontStyle: 'italic' }}>
                              Não informado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Editar cliente" arrow>
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.1)',
                                  borderRadius: 2,
                                  width: 36,
                                  height: 36,
                                  border: `1px solid ${isDarkMode ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'}`,
                                  '&:hover': {
                                    backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.25)' : 'rgba(33, 150, 243, 0.15)',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                                onClick={() => handleDialogOpen("edit", client)}
                              >
                                <Edit fontSize="small" sx={{ color: '#2196f3' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir cliente" arrow>
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)',
                                  borderRadius: 2,
                                  width: 36,
                                  height: 36,
                                  border: `1px solid ${isDarkMode ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)'}`,
                                  '&:hover': {
                                    backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.25)' : 'rgba(244, 67, 54, 0.15)',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.25)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                                onClick={() => handleDeleteClient(client.id)}
                              >
                                <Delete fontSize="small" sx={{ color: '#f44336' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Ver pedidos" arrow>
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: isDarkMode ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                                  borderRadius: 2,
                                  width: 36,
                                  height: 36,
                                  border: `1px solid ${isDarkMode ? 'rgba(46, 125, 50, 0.3)' : 'rgba(46, 125, 50, 0.2)'}`,
                                  '&:hover': {
                                    backgroundColor: isDarkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.15)',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                                onClick={() => handleOpenOrdersModal(client)}
                              >
                                <Visibility fontSize="small" sx={{ color: colors.primary }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={5} 
                      align="center"
                      sx={{ 
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0,0,0,0.5)',
                        py: 6,
                        fontStyle: 'italic',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <People sx={{ fontSize: 48, color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }} />
                        <Typography>
                          {searchTerm ? `Nenhum cliente encontrado para "${searchTerm}"` : 'Nenhum cliente cadastrado'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          </Paper>
        </Paper>
      </Container>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            '& .MuiAlert-icon': {
              fontSize: '1.2rem'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Enhanced Dialog for Add/Edit Client */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            borderRadius: 3,
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 24px 48px rgba(0, 0, 0, 0.4)'
              : '0 24px 48px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {dialogType === "add" ? "Adicionar Cliente" : "Editar Cliente"}
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            margin="normal"
            label="Nome"
            fullWidth
            value={currentClient.nome}
            onChange={(e) =>
              setCurrentClient({ ...currentClient, nome: e.target.value })
            }
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <TextField
            margin="normal"
            label="Endereço"
            fullWidth
            value={currentClient.endereco}
            onChange={(e) =>
              setCurrentClient({ ...currentClient, endereco: e.target.value })
            }
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <TextField
            margin="normal"
            label="Telefone"
            fullWidth
            value={currentClient.telefone}
            onChange={(e) =>
              setCurrentClient({ ...currentClient, telefone: e.target.value })
            }
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <TextField
            margin="normal"
            label="Referência"
            fullWidth
            value={currentClient.referencia}
            onChange={(e) =>
              setCurrentClient({ ...currentClient, referencia: e.target.value })
            }
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{
          p: 3,
          gap: 2,
          justifyContent: 'center'
        }}>
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                borderColor: '#d32f2f',
                bgcolor: 'rgba(244, 67, 54, 0.04)'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDialogSave}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #1b3a1c 0%, #388e3c 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {dialogType === "add" ? "Adicionar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Orders Modal */}
      <Dialog
        open={openOrdersModal}
        onClose={handleCloseOrdersModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            borderRadius: 3,
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 24px 48px rgba(0, 0, 0, 0.4)'
              : '0 24px 48px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Pedidos de {selectedClient?.nome}
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {orders.length > 0 ? (
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2,
                bgcolor: theme => theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                boxShadow: theme => theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.2)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Table>
                <TableHead sx={{
                  background: theme => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #333 0%, #404040 100%)'
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderBottom: '2px solid #4caf50'
                }}>
                  <TableRow>
                    <TableCell sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 'bold'
                    }}>Data de Início</TableCell>
                    <TableCell sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 'bold'
                    }}>Data de Término</TableCell>
                    <TableCell sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 'bold'
                    }}>Valor Total</TableCell>
                    <TableCell sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 'bold'
                    }}>Status</TableCell>
                    <TableCell sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 'bold'
                    }}>Nome do Item</TableCell>
                    <TableCell sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 'bold'
                    }}>Tipo do Item</TableCell>
                    <TableCell sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 'bold'
                    }}>Quantidade Locada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order.id}
                      sx={{
                        "&:nth-of-type(odd)": { 
                          backgroundColor: theme => theme.palette.mode === 'dark' ? '#2a2a2a' : '#f9f9f9'
                        },
                        "&:hover": { 
                          backgroundColor: theme => theme.palette.mode === 'dark' ? '#333' : '#e0f7fa'
                        },
                        borderBottom: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.12)'
                      }}
                    >
                      <TableCell sx={{
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                      }}>
                        {new Date(order.data_inicio).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                      }}>
                        {new Date(order.data_fim).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                      }}>R$ {order.valor_total.toFixed(2)}</TableCell>
                      <TableCell sx={{
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                      }}>{order.status}</TableCell>
                      <TableCell sx={{
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                      }}>{order.nome_item}</TableCell>
                      <TableCell sx={{
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                      }}>{order.tipo_item}</TableCell>
                      <TableCell sx={{
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                      }}>{order.quantidade_locada}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography 
              variant="body2" 
              sx={{
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                textAlign: 'center',
                py: 3
              }}
            >
              Nenhum pedido encontrado para este cliente.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{
          p: 3,
          justifyContent: 'center'
        }}>
          <Button 
            onClick={handleCloseOrdersModal}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #1b3a1c 0%, #388e3c 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsPage;
