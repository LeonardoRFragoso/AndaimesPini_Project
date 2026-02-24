import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { listarDanos, registrarDano, atualizarDano, excluirDano } from '../../api/danos';
import { listarLocacoes } from '../../api/locacoes';
import { listarItens } from '../../api/inventario';

const DamagesPage = () => {
  const [danos, setDanos] = useState([]);
  const [locacoes, setLocacoes] = useState([]);
  const [itens, setItens] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDano, setCurrentDano] = useState({
    id: null,
    locacao_id: '',
    item_id: '',
    quantidade_danificada: 0
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [danosData, locacoesData, itensData] = await Promise.all([
        listarDanos(),
        listarLocacoes(),
        listarItens()
      ]);
      setDanos(danosData);
      setLocacoes(locacoesData);
      setItens(itensData);
    } catch (error) {
      showAlert('Erro ao carregar dados: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 5000);
  };

  const handleOpenDialog = (dano = null) => {
    if (dano) {
      setCurrentDano(dano);
      setEditMode(true);
    } else {
      setCurrentDano({
        id: null,
        locacao_id: '',
        item_id: '',
        quantidade_danificada: 0
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentDano({
      id: null,
      locacao_id: '',
      item_id: '',
      quantidade_danificada: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDano(prev => ({
      ...prev,
      [name]: name === 'quantidade_danificada' ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!currentDano.locacao_id || !currentDano.item_id || currentDano.quantidade_danificada <= 0) {
        showAlert('Preencha todos os campos corretamente', 'error');
        return;
      }

      if (editMode) {
        await atualizarDano(currentDano.id, {
          locacao_id: currentDano.locacao_id,
          item_id: currentDano.item_id,
          quantidade_danificada: currentDano.quantidade_danificada
        });
        showAlert('Dano atualizado com sucesso!');
      } else {
        await registrarDano({
          locacao_id: currentDano.locacao_id,
          item_id: currentDano.item_id,
          quantidade_danificada: currentDano.quantidade_danificada
        });
        showAlert('Dano registrado com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      showAlert('Erro ao salvar dano: ' + error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de dano?')) {
      try {
        await excluirDano(id);
        showAlert('Dano excluído com sucesso!');
        carregarDados();
      } catch (error) {
        showAlert('Erro ao excluir dano: ' + error.message, 'error');
      }
    }
  };

  const getLocacaoNome = (locacaoId) => {
    const locacao = locacoes.find(l => l.id === locacaoId);
    return locacao ? `#${locacao.id} - ${locacao.nome_cliente}` : 'N/A';
  };

  const getItemNome = (itemId) => {
    const item = itens.find(i => i.id === itemId);
    return item ? item.nome_item : 'N/A';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Danos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Registrar Dano
        </Button>
      </Box>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Locação</strong></TableCell>
                  <TableCell><strong>Item</strong></TableCell>
                  <TableCell><strong>Quantidade Danificada</strong></TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : danos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum dano registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  danos.map((dano) => (
                    <TableRow key={dano.id}>
                      <TableCell>{dano.id}</TableCell>
                      <TableCell>{getLocacaoNome(dano.locacao_id)}</TableCell>
                      <TableCell>{getItemNome(dano.item_id)}</TableCell>
                      <TableCell>{dano.quantidade_danificada}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(dano)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(dano.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Dano' : 'Registrar Novo Dano'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Locação</InputLabel>
              <Select
                name="locacao_id"
                value={currentDano.locacao_id}
                onChange={handleInputChange}
                label="Locação"
              >
                {locacoes.map((locacao) => (
                  <MenuItem key={locacao.id} value={locacao.id}>
                    #{locacao.id} - {locacao.nome_cliente}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Item</InputLabel>
              <Select
                name="item_id"
                value={currentDano.item_id}
                onChange={handleInputChange}
                label="Item"
              >
                {itens.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.nome_item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Quantidade Danificada"
              name="quantidade_danificada"
              type="number"
              value={currentDano.quantidade_danificada}
              onChange={handleInputChange}
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Atualizar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DamagesPage;
