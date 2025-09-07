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
} from "@mui/material";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material"; // Ícones para ações
import { listarClientes, criarCliente, atualizarCliente, excluirCliente, obterPedidosCliente } from "../../api/clientes";

const ClientsPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]); // Armazena os pedidos do cliente selecionado
  const [openOrdersModal, setOpenOrdersModal] = useState(false); // Controle do modal de pedidos
  const [selectedClient, setSelectedClient] = useState(null); // Cliente atualmente selecionado
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add"); // "add" ou "edit"
  const [currentClient, setCurrentClient] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    referencia: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await listarClientes();
      setClients(data);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao buscar clientes.", "error");
    }
  };

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
      bgcolor: theme => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="lg">
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
            Clientes
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              opacity: 0.9,
              fontWeight: 400
            }}
          >
            Aqui você pode gerenciar todos os clientes cadastrados
          </Typography>
        </Paper>

        {/* Enhanced Add Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleDialogOpen("add")}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              padding: '12px 32px',
              borderRadius: '25px',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              "&:hover": { 
                background: 'linear-gradient(135deg, #1b3a1c 0%, #388e3c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Adicionar Novo Cliente
          </Button>
        </Box>

        {/* Enhanced Table Container */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead 
                sx={{ 
                  background: theme => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #2a2a2a 0%, #333 100%)'
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderBottom: '3px solid #4caf50'
                }}
              >
                <TableRow>
                  <TableCell sx={{ 
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 2.5
                  }}>Nome</TableCell>
                  <TableCell sx={{ 
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 2.5
                  }}>Endereço</TableCell>
                  <TableCell sx={{ 
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 2.5
                  }}>Telefone</TableCell>
                  <TableCell sx={{ 
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 2.5
                  }}>Referência</TableCell>
                  <TableCell align="center" sx={{ 
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 2.5
                  }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client, index) => (
                  <TableRow
                    key={client.id}
                    sx={{
                      "&:nth-of-type(odd)": { 
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(76, 175, 80, 0.02)'
                      },
                      "&:hover": { 
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.08)',
                        transform: 'translateY(-1px)',
                        boxShadow: theme => theme.palette.mode === 'dark' 
                          ? '0 4px 12px rgba(76, 175, 80, 0.2)'
                          : '0 4px 12px rgba(76, 175, 80, 0.15)',
                      },
                      borderBottom: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell sx={{ 
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
                      fontWeight: 500,
                      py: 2
                    }}>{client.nome}</TableCell>
                    <TableCell sx={{ 
                      color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#546e7a',
                      py: 2
                    }}>{client.endereco}</TableCell>
                    <TableCell sx={{ 
                      color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#546e7a',
                      py: 2
                    }}>{client.telefone}</TableCell>
                    <TableCell sx={{ 
                      color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#546e7a',
                      py: 2
                    }}>{client.referencia}</TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: '#2196f3',
                            color: 'white',
                            width: 36,
                            height: 36,
                            '&:hover': {
                              bgcolor: '#1976d2',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => handleDialogOpen("edit", client)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: '#f44336',
                            color: 'white',
                            width: 36,
                            height: 36,
                            '&:hover': {
                              bgcolor: '#d32f2f',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: '#4caf50',
                            color: 'white',
                            width: 36,
                            height: 36,
                            '&:hover': {
                              bgcolor: '#388e3c',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => handleOpenOrdersModal(client)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
