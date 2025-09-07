import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  useTheme,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  WarningAmber as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PageLayout from '../layouts/PageLayout';
import { listarLocacoesAtrasadas, confirmarDevolucao, atualizarStatus } from '../../api/locacoes';

const OverdueOrdersPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    orderId: null,
    action: null
  });

  const fetchOverdueOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listarLocacoesAtrasadas();
      setOrders(response);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar locações atrasadas:', err);
      setError('Erro ao carregar locações atrasadas. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueOrders();
  }, []);

  const handleConfirmReturn = async (orderId) => {
    try {
      await confirmarDevolucao(orderId);
      enqueueSnackbar('Devolução confirmada com sucesso!', { variant: 'success' });
      fetchOverdueOrders(); // Recarregar a lista
    } catch (err) {
      console.error('Erro ao confirmar devolução:', err);
      enqueueSnackbar('Erro ao confirmar devolução. Tente novamente.', { variant: 'error' });
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await atualizarStatus(orderId, newStatus);
      enqueueSnackbar(`Status atualizado para ${newStatus} com sucesso!`, { variant: 'success' });
      fetchOverdueOrders(); // Recarregar a lista
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      enqueueSnackbar('Erro ao atualizar status. Tente novamente.', { variant: 'error' });
    }
  };

  const openConfirmDialog = (orderId, title, message, action) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      orderId,
      action
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };

  const confirmAction = () => {
    if (confirmDialog.action === 'return') {
      handleConfirmReturn(confirmDialog.orderId);
    } else if (confirmDialog.action === 'cancel') {
      handleUpdateStatus(confirmDialog.orderId, 'cancelado');
    }
    closeConfirmDialog();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'warning';
      case 'concluido':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleWhatsApp = (phone) => {
    if (!phone) return;
    
    // Remover caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verificar se o número tem o formato correto
    if (cleanPhone.length < 10) {
      enqueueSnackbar('Número de telefone inválido', { variant: 'error' });
      return;
    }
    
    // Adicionar código do país se não estiver presente
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    // Abrir WhatsApp com mensagem predefinida
    const message = encodeURIComponent(
      'Olá! Entramos em contato referente à sua locação de andaimes que está com devolução atrasada. Por favor, entre em contato conosco para regularizar a situação.'
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleCall = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            mb: 3,
            background: theme => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)',
            border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon color="warning" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                Locações com Devolução Atrasada
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchOverdueOrders}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Gerencie as locações que estão com devolução atrasada e tome as ações necessárias.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              Não há locações com devolução atrasada no momento.
            </Alert>
          ) : (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
                    border: '1px solid rgba(255, 152, 0, 0.2)',
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {orders.length}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Locações atrasadas
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {formatCurrency(orders.reduce((sum, order) => sum + (order.valor_receber_final || 0), 0))}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Valor total a receber
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {Math.max(...orders.map(order => order.dias_atraso || 0))}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Dias de atraso (máximo)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Data Fim</TableCell>
                      <TableCell>Dias Atrasados</TableCell>
                      <TableCell>Valor a Receber</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {order.cliente.nome}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Tooltip title="Ligar">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleCall(order.cliente.telefone)}
                                >
                                  <PhoneIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="WhatsApp">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleWhatsApp(order.cliente.telefone)}
                                  sx={{ ml: 0.5 }}
                                >
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {order.cliente.telefone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(order.data_fim)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${order.dias_atraso} dias`} 
                            color={order.dias_atraso > 30 ? "error" : order.dias_atraso > 15 ? "warning" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(order.valor_receber_final)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(order.status)} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Confirmar Devolução">
                              <IconButton 
                                color="success"
                                onClick={() => openConfirmDialog(
                                  order.id,
                                  'Confirmar Devolução',
                                  `Deseja confirmar a devolução da locação de ${order.cliente.nome}?`,
                                  'return'
                                )}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancelar Locação">
                              <IconButton 
                                color="error"
                                onClick={() => openConfirmDialog(
                                  order.id,
                                  'Cancelar Locação',
                                  `Deseja cancelar a locação de ${order.cliente.nome}?`,
                                  'cancel'
                                )}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      </Box>
      
      {/* Dialog de confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="inherit">Cancelar</Button>
          <Button onClick={confirmAction} color="primary" variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default OverdueOrdersPage;
