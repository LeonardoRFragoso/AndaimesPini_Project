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
      p: 3,
      bgcolor: theme => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center"
        sx={{ 
          color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
          fontWeight: 'bold',
          mb: 2
        }}
      >
        Clientes
      </Typography>
      <Typography
        variant="body1"
        align="center"
        sx={{ 
          mb: 3,
          color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
        }}
      >
        Aqui você pode gerenciar todos os clientes cadastrados.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleDialogOpen("add")}
          sx={{ 
            borderRadius: 2,
            bgcolor: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#1976d2',
            '&:hover': {
              bgcolor: theme => theme.palette.mode === 'dark' ? '#45a049' : '#1565c0'
            }
          }}
        >
          Adicionar Novo Cliente
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: theme => theme.palette.mode === 'dark' ? '0px 4px 12px rgba(0, 0, 0, 0.5)' : 3,
          borderRadius: 2,
          bgcolor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}
      >
        <Table>
          <TableHead sx={{ 
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5'
          }}>
            <TableRow>
              <TableCell sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                fontWeight: 'bold'
              }}>Nome</TableCell>
              <TableCell sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                fontWeight: 'bold'
              }}>Endereço</TableCell>
              <TableCell sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                fontWeight: 'bold'
              }}>Telefone</TableCell>
              <TableCell sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                fontWeight: 'bold'
              }}>Referência</TableCell>
              <TableCell align="center" sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
                fontWeight: 'bold'
              }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
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
                }}>{client.nome}</TableCell>
                <TableCell sx={{ 
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                }}>{client.endereco}</TableCell>
                <TableCell sx={{ 
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                }}>{client.telefone}</TableCell>
                <TableCell sx={{ 
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333'
                }}>{client.referencia}</TableCell>
                <TableCell align="center">
                  <IconButton
                    sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#1976d2',
                      '&:hover': {
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                      }
                    }}
                    onClick={() => handleDialogOpen("edit", client)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                      '&:hover': {
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(211, 47, 47, 0.1)'
                      }
                    }}
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Delete />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#2196f3' : '#0288d1',
                      '&:hover': {
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(2, 136, 209, 0.1)'
                      }
                    }}
                    onClick={() => handleOpenOrdersModal(client)}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Dialog para Adicionar/Editar Cliente */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }
        }}
      >
        <DialogTitle sx={{
          color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
          borderBottom: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          {dialogType === "add" ? "Adicionar Cliente" : "Editar Cliente"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nome"
            fullWidth
            value={currentClient.nome}
            onChange={(e) =>
              setCurrentClient({ ...currentClient, nome: e.target.value })
            }
            sx={{
              '& .MuiInputLabel-root': {
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
              },
              '& .MuiOutlinedInput-root': {
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000',
                '& fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)'
                },
                '&:hover fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Endereço"
            fullWidth
            value={currentClient.endereco}
            onChange={(e) =>
              setCurrentClient({ ...currentClient, endereco: e.target.value })
            }
            sx={{
              '& .MuiInputLabel-root': {
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
              },
              '& .MuiOutlinedInput-root': {
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000',
                '& fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)'
                },
                '&:hover fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Telefone"
            fullWidth
            value={currentClient.telefone}
            onChange={(e) =>
              setCurrentClient({ ...currentClient, telefone: e.target.value })
            }
            sx={{
              '& .MuiInputLabel-root': {
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
              },
              '& .MuiOutlinedInput-root': {
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000',
                '& fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)'
                },
                '&:hover fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)'
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Referência"
            fullWidth
            value={currentClient.referencia}
            onChange={(e) =>
              setCurrentClient({ ...currentClient, referencia: e.target.value })
            }
            sx={{
              '& .MuiInputLabel-root': {
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
              },
              '& .MuiOutlinedInput-root': {
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000',
                '& fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)'
                },
                '&:hover fieldset': {
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{
          borderTop: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.12)',
          pt: 2
        }}>
          <Button 
            onClick={handleDialogClose}
            sx={{
              color: theme => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDialogSave}
            variant="contained"
            sx={{
              bgcolor: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#1976d2',
              '&:hover': {
                bgcolor: theme => theme.palette.mode === 'dark' ? '#45a049' : '#1565c0'
              }
            }}
          >
            {dialogType === "add" ? "Adicionar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openOrdersModal}
        onClose={handleCloseOrdersModal}
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }
        }}
      >
        <DialogTitle sx={{
          color: theme => theme.palette.mode === 'dark' ? '#fff' : '#333',
          borderBottom: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.12)'
        }}>Pedidos de {selectedClient?.nome}</DialogTitle>
        <DialogContent>
          {orders.length > 0 ? (
            <TableContainer 
              component={Paper} 
              sx={{ 
                mt: 2,
                bgcolor: theme => theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
              }}
            >
              <Table>
                <TableHead sx={{
                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#333' : '#f5f5f5'
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
          borderTop: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.12)',
          pt: 2
        }}>
          <Button 
            onClick={handleCloseOrdersModal}
            variant="contained"
            sx={{
              bgcolor: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#1976d2',
              '&:hover': {
                bgcolor: theme => theme.palette.mode === 'dark' ? '#45a049' : '#1565c0'
              }
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
