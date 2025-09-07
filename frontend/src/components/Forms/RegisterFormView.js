// frontend/src/components/Forms/RegisterFormView.js

import React, { useState } from "react";
import {
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  TextField,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Container,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategorySection from "../pages/sections/CategorySection";
import InventoryCheck from "./InventoryCheck";

const RegisterFormView = ({
  novaLocacao,
  handleChange,
  handleSubmit,
  addItem,
  CATEGORIES,
  estoqueDisponivel,
  handleDiasCombinadosChange,
}) => {
  const theme = useTheme();
  const [itensAdicionados, setItensAdicionados] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddItem = (category, modelo, quantidade, unidade) => {
    addItem(category, modelo, quantidade, unidade);
    setItensAdicionados((prev) => [
      ...prev,
      { category, modelo, quantidade, unidade },
    ]);
    setSnackbarOpen(true);
  };

  const handleRemoveItem = (index) => {
    setItensAdicionados((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    await handleSubmit(event);
    setConfirmDialogOpen(false);
    setItensAdicionados([]);
    setIsLoading(false);
  };

  const steps = ['Dados do Cliente', 'Datas e Valores', 'Itens do Inventário'];
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Registrar Nova Locação
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Preencha os dados abaixo para criar uma nova locação
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Box sx={{ 
          p: 3, 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa'
        }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ p: 4 }}>
          <form onSubmit={(e) => e.preventDefault()}>
            <Grid container spacing={4}>
              {/* Seção de Informações do Cliente */}
              <Grid item xs={12}>
                <Card elevation={2} sx={{ 
                  mb: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
                }}>
                  <CardHeader
                    avatar={<PersonIcon color="primary" />}
                    title="Informações do Cliente"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Nome do Cliente"
                          name="nome_cliente"
                          value={novaLocacao.nome_cliente}
                          onChange={handleChange}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Telefone do Cliente"
                          name="telefone_cliente"
                          value={novaLocacao.telefone_cliente}
                          onChange={handleChange}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Endereço do Cliente"
                          name="endereco_cliente"
                          value={novaLocacao.endereco_cliente}
                          onChange={handleChange}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Número da Nota"
                          name="numero_nota"
                          value={novaLocacao.numero_nota}
                          onChange={handleChange}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Referência"
                          name="referencia"
                          value={novaLocacao.referencia}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Seção de Datas */}
              <Grid item xs={12}>
                <Card elevation={2} sx={{ 
                  mb: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
                }}>
                  <CardHeader
                    avatar={<CalendarTodayIcon color="primary" />}
                    title="Período da Locação"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Data de Início"
                          type="date"
                          name="data_inicio"
                          value={novaLocacao.data_inicio}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Dias Combinados"
                          type="number"
                          name="dias_combinados"
                          value={novaLocacao.dias_combinados}
                          onChange={handleDiasCombinadosChange}
                          InputProps={{ inputProps: { min: 1 } }}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Data de Fim"
                          type="date"
                          name="data_fim"
                          value={novaLocacao.data_fim}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Seção de Valores */}
              <Grid item xs={12}>
                <Card elevation={2} sx={{ 
                  mb: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
                }}>
                  <CardHeader
                    avatar={<AttachMoneyIcon color="primary" />}
                    title="Valores Financeiros"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Valor Total"
                          type="number"
                          name="valor_total"
                          value={novaLocacao.valor_total}
                          onChange={handleChange}
                          InputProps={{ 
                            inputProps: { min: 0, step: "0.01" },
                            startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                          }}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Valor Pago na Entrega"
                          type="number"
                          name="valor_pago_entrega"
                          value={novaLocacao.valor_pago_entrega}
                          onChange={handleChange}
                          InputProps={{ 
                            inputProps: { min: 0, step: "0.01" },
                            startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                          }}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Valor a Receber Final"
                          type="number"
                          name="valor_receber_final"
                          value={novaLocacao.valor_receber_final}
                          InputProps={{ 
                            readOnly: true,
                            startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                          }}
                          fullWidth
                          variant="outlined"
                          sx={{
                            '& .MuiInputBase-input': {
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : '#f5f5f5',
                              fontWeight: 600
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Seção de Itens do Inventário */}
              <Grid item xs={12}>
                <Card elevation={2} sx={{ 
                  mb: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
                }}>
                  <CardHeader
                    avatar={<InventoryIcon color="primary" />}
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Itens do Inventário
                        </Typography>
                        <Badge
                          badgeContent={novaLocacao.itens.length}
                          color="primary"
                          showZero
                        />
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                      Verifique a disponibilidade dos itens antes de adicioná-los à locação.
                    </Alert>

                    <InventoryCheck
                      onItemSelect={(items) => {
                        // Converter os itens selecionados para o formato esperado pelo formulário
                        const formattedItems = items.map((item) => ({
                          modelo: item.nome_item,
                          quantidade: item.quantidade_solicitada,
                          unidade: "peças",
                        }));

                        // Atualizar a lista de itens na locação
                        novaLocacao.itens = formattedItems;
                        setItensAdicionados(formattedItems);
                      }}
                    />

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      Método tradicional de seleção:
                    </Typography>

                    <Grid container spacing={3}>
                      {Object.keys(CATEGORIES).map((category) => (
                        <Grid item xs={12} sm={6} md={4} key={category}>
                          <CategorySection
                            title={category.charAt(0).toUpperCase() + category.slice(1)}
                            category={category}
                            CATEGORIES={CATEGORIES}
                            estoqueDisponivel={estoqueDisponivel}
                            addItem={handleAddItem}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Seção de Itens Adicionados */}
              {itensAdicionados.length > 0 && (
                <Grid item xs={12}>
                  <Card elevation={2} sx={{ 
                    mb: 2, 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.02)' 
                      : '#f8f9fa',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
                  }}>
                    <CardHeader
                      title="Itens Selecionados"
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                      sx={{ pb: 1 }}
                    />
                    <CardContent>
                      <List>
                        {itensAdicionados.map((item, index) => (
                          <ListItem 
                            key={index}
                            sx={{ 
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'white',
                              borderRadius: 1,
                              mb: 1,
                              border: theme.palette.mode === 'dark' 
                                ? '1px solid rgba(255, 255, 255, 0.12)' 
                                : '1px solid #e0e0e0'
                            }}
                          >
                            <ListItemText
                              primary={`${item.modelo} - ${item.quantidade} unidades`}
                              secondary={item.category ? `Categoria: ${item.category}` : ''}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                            <IconButton 
                              onClick={() => handleRemoveItem(index)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Botão Registrar Locação */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={isLoading}
                    sx={{
                      minWidth: 200,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : "Registrar Locação"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Item adicionado com sucesso"
      />

      {/* Diálogo de Confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Locação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja realmente registrar esta locação?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmSubmit}>Confirmar</Button>
        </DialogActions>
      </Dialog>
      </Paper>
    </Container>
  );
};

export default RegisterFormView;
