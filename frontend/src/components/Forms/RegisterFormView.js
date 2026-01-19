// frontend/src/components/Forms/RegisterFormView.js

import React, { useState, useMemo } from "react";
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
  InputAdornment,
  Fade,
  Slide,
  Grow,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import EventIcon from "@mui/icons-material/Event";
import TimerIcon from "@mui/icons-material/Timer";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
  const [activeStep, setActiveStep] = useState(0);
  const [touched, setTouched] = useState({});

  const steps = ['Dados do Cliente', 'Datas e Valores', 'Itens do Inventário'];

  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
  };

  // Validação em tempo real
  const validations = useMemo(() => ({
    nome_cliente: novaLocacao.nome_cliente?.trim().length >= 3,
    telefone_cliente: novaLocacao.telefone_cliente?.trim().length >= 8,
    endereco_cliente: novaLocacao.endereco_cliente?.trim().length >= 5,
    numero_nota: novaLocacao.numero_nota?.trim().length >= 1,
    data_inicio: !!novaLocacao.data_inicio,
    dias_combinados: novaLocacao.dias_combinados > 0,
    data_fim: !!novaLocacao.data_fim,
    valor_total: novaLocacao.valor_total > 0,
    valor_pago_entrega: novaLocacao.valor_pago_entrega >= 0,
  }), [novaLocacao]);

  // Verificar se a etapa está completa
  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return validations.nome_cliente && 
               validations.telefone_cliente && 
               validations.endereco_cliente && 
               validations.numero_nota;
      case 1:
        return validations.data_inicio && 
               validations.dias_combinados && 
               validations.data_fim && 
               validations.valor_total;
      case 2:
        return novaLocacao.itens?.length > 0 || itensAdicionados.length > 0;
      default:
        return false;
    }
  };

  // Verificar se pode avançar para próxima etapa
  const canProceed = isStepComplete(activeStep);

  // Handler para marcar campo como tocado
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Verificar se campo tem erro
  const hasError = (field) => touched[field] && !validations[field];

  // Navegação do stepper
  const handleNext = () => {
    if (activeStep < steps.length - 1 && canProceed) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

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

  // Estilos melhorados para inputs
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : '#fff',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : '#fafafa',
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : '#fff',
        boxShadow: `0 0 0 2px ${colors.primaryLight}40`,
      },
    },
    '& .MuiOutlinedInput-input': {
      color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.7)' 
        : 'rgba(0, 0, 0, 0.6)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.23)' 
        : 'rgba(0, 0, 0, 0.23)',
    },
  };

  const errorInputStyles = {
    ...inputStyles,
    '& .MuiOutlinedInput-root': {
      ...inputStyles['& .MuiOutlinedInput-root'],
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
      },
    },
  };

  const successInputStyles = {
    ...inputStyles,
    '& .MuiOutlinedInput-root': {
      ...inputStyles['& .MuiOutlinedInput-root'],
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary,
      },
    },
  };

  // Função para obter estilos baseado na validação
  const getFieldStyles = (field) => {
    if (!touched[field]) return inputStyles;
    return validations[field] ? successInputStyles : errorInputStyles;
  };

  // Componente de ícone de validação
  const ValidationIcon = ({ field }) => {
    if (!touched[field]) return null;
    return validations[field] ? (
      <CheckCircleIcon sx={{ color: colors.primary, fontSize: 20 }} />
    ) : (
      <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: theme.palette.mode === 'light' ? '#f5f7fa' : '#0a0a0a',
      pb: 4,
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
            Registrar Nova Locação
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
            Preencha os dados abaixo para criar uma nova locação
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -5 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            border: theme.palette.mode === 'light' 
              ? '1px solid rgba(0,0,0,0.08)' 
              : '1px solid rgba(255,255,255,0.1)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 4px 20px rgba(0,0,0,0.08)'
              : '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Progress Stepper */}
          <Box sx={{ 
            p: 3, 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#fafbfc',
            borderBottom: theme.palette.mode === 'light' 
              ? '1px solid rgba(0,0,0,0.06)' 
              : '1px solid rgba(255,255,255,0.06)',
          }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{
                '& .MuiStepLabel-root .Mui-completed': {
                  color: colors.primary,
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: colors.primary,
                },
                '& .MuiStepIcon-root': {
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: colors.primary,
                },
                '& .MuiStepIcon-root.Mui-active': {
                  color: colors.primary,
                },
                '& .MuiStepConnector-line': {
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(0, 0, 0, 0.2)',
                },
                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                  borderColor: colors.primary,
                },
              }}
            >
              {steps.map((label, index) => (
                <Step 
                  key={label} 
                  completed={isStepComplete(index)}
                  onClick={() => setActiveStep(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <StepLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                      {label}
                      {isStepComplete(index) && (
                        <Chip 
                          label="✓" 
                          size="small" 
                          sx={{ 
                            ml: 0.5, 
                            height: 18, 
                            fontSize: '0.7rem',
                            backgroundColor: colors.primary,
                            color: '#fff',
                          }} 
                        />
                      )}
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

        <Box sx={{ p: 4 }}>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 0: Informações do Cliente */}
            <Fade in={activeStep === 0} timeout={400} unmountOnExit>
              <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                <Card elevation={2} sx={{ 
                  mb: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  },
                }}>
                  <CardHeader
                    avatar={
                      <Box sx={{ 
                        backgroundColor: `${colors.primary}20`, 
                        borderRadius: 2, 
                        p: 1, 
                        display: 'flex' 
                      }}>
                        <PersonIcon sx={{ color: colors.primary }} />
                      </Box>
                    }
                    title="Informações do Cliente"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    action={
                      <Chip 
                        label={isStepComplete(0) ? "Completo" : "Pendente"} 
                        size="small"
                        sx={{ 
                          backgroundColor: isStepComplete(0) ? `${colors.primary}20` : 'rgba(255, 152, 0, 0.2)',
                          color: isStepComplete(0) ? colors.primary : '#ff9800',
                          fontWeight: 500,
                        }}
                      />
                    }
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
                          onBlur={() => handleBlur('nome_cliente')}
                          error={hasError('nome_cliente')}
                          helperText={hasError('nome_cliente') ? 'Nome deve ter no mínimo 3 caracteres' : ''}
                          fullWidth
                          required
                          variant="outlined"
                          placeholder="Digite o nome completo"
                          sx={getFieldStyles('nome_cliente')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ValidationIcon field="nome_cliente" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Telefone do Cliente"
                          name="telefone_cliente"
                          value={novaLocacao.telefone_cliente}
                          onChange={handleChange}
                          onBlur={() => handleBlur('telefone_cliente')}
                          error={hasError('telefone_cliente')}
                          helperText={hasError('telefone_cliente') ? 'Telefone deve ter no mínimo 8 dígitos' : ''}
                          fullWidth
                          required
                          variant="outlined"
                          placeholder="(00) 00000-0000"
                          sx={getFieldStyles('telefone_cliente')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ValidationIcon field="telefone_cliente" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Endereço do Cliente"
                          name="endereco_cliente"
                          value={novaLocacao.endereco_cliente}
                          onChange={handleChange}
                          onBlur={() => handleBlur('endereco_cliente')}
                          error={hasError('endereco_cliente')}
                          helperText={hasError('endereco_cliente') ? 'Endereço deve ter no mínimo 5 caracteres' : ''}
                          fullWidth
                          required
                          variant="outlined"
                          placeholder="Rua, número, bairro, cidade"
                          sx={getFieldStyles('endereco_cliente')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ValidationIcon field="endereco_cliente" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Número da Nota"
                          name="numero_nota"
                          value={novaLocacao.numero_nota}
                          onChange={handleChange}
                          onBlur={() => handleBlur('numero_nota')}
                          error={hasError('numero_nota')}
                          helperText={hasError('numero_nota') ? 'Número da nota é obrigatório' : ''}
                          fullWidth
                          required
                          variant="outlined"
                          placeholder="Ex: 12345"
                          sx={getFieldStyles('numero_nota')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ReceiptIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ValidationIcon field="numero_nota" />
                              </InputAdornment>
                            ),
                          }}
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
                          sx={inputStyles}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BookmarkIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Botões de navegação Step 0 */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!canProceed}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      backgroundColor: colors.primary,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: colors.primaryDark,
                      },
                      '&:disabled': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    Próximo
                  </Button>
                </Box>
              </Box>
            </Fade>

            {/* Step 1: Datas e Valores */}
            <Fade in={activeStep === 1} timeout={400} unmountOnExit>
              <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                {/* Seção de Datas */}
                <Card elevation={2} sx={{ 
                  mb: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  },
                }}>
                  <CardHeader
                    avatar={
                      <Box sx={{ 
                        backgroundColor: `${colors.primary}20`, 
                        borderRadius: 2, 
                        p: 1, 
                        display: 'flex' 
                      }}>
                        <CalendarTodayIcon sx={{ color: colors.primary }} />
                      </Box>
                    }
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
                          onBlur={() => handleBlur('data_inicio')}
                          error={hasError('data_inicio')}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          required
                          variant="outlined"
                          sx={getFieldStyles('data_inicio')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EventIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ValidationIcon field="data_inicio" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Dias Combinados"
                          type="number"
                          name="dias_combinados"
                          value={novaLocacao.dias_combinados}
                          onChange={handleDiasCombinadosChange}
                          onBlur={() => handleBlur('dias_combinados')}
                          error={hasError('dias_combinados')}
                          helperText={hasError('dias_combinados') ? 'Informe pelo menos 1 dia' : ''}
                          fullWidth
                          required
                          variant="outlined"
                          placeholder="Ex: 30"
                          sx={getFieldStyles('dias_combinados')}
                          InputProps={{ 
                            inputProps: { min: 1 },
                            startAdornment: (
                              <InputAdornment position="start">
                                <TimerIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ValidationIcon field="dias_combinados" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Data de Fim"
                          type="date"
                          name="data_fim"
                          value={novaLocacao.data_fim}
                          onChange={handleChange}
                          onBlur={() => handleBlur('data_fim')}
                          error={hasError('data_fim')}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          required
                          variant="outlined"
                          sx={getFieldStyles('data_fim')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EventAvailableIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ValidationIcon field="data_fim" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Seção de Valores */}
                <Card elevation={2} sx={{ 
                  mb: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  },
                }}>
                  <CardHeader
                    avatar={
                      <Box sx={{ 
                        backgroundColor: `${colors.primary}20`, 
                        borderRadius: 2, 
                        p: 1, 
                        display: 'flex' 
                      }}>
                        <AttachMoneyIcon sx={{ color: colors.primary }} />
                      </Box>
                    }
                    title="Valores Financeiros"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    action={
                      <Chip 
                        label={`Saldo: R$ ${(novaLocacao.valor_receber_final || 0).toFixed(2)}`} 
                        size="small"
                        sx={{ 
                          backgroundColor: `${colors.primary}20`,
                          color: colors.primary,
                          fontWeight: 600,
                        }}
                      />
                    }
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
                          onBlur={() => handleBlur('valor_total')}
                          error={hasError('valor_total')}
                          helperText={hasError('valor_total') ? 'Valor total é obrigatório' : ''}
                          fullWidth
                          required
                          variant="outlined"
                          placeholder="0.00"
                          sx={getFieldStyles('valor_total')}
                          InputProps={{ 
                            inputProps: { min: 0, step: "0.01" },
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoneyIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                                <Typography sx={{ ml: 0.5, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'inherit' }}>R$</Typography>
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ValidationIcon field="valor_total" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Valor Pago na Entrega"
                          type="number"
                          name="valor_pago_entrega"
                          value={novaLocacao.valor_pago_entrega}
                          onChange={handleChange}
                          onBlur={() => handleBlur('valor_pago_entrega')}
                          fullWidth
                          required
                          variant="outlined"
                          placeholder="0.00"
                          sx={inputStyles}
                          InputProps={{ 
                            inputProps: { min: 0, step: "0.01" },
                            startAdornment: (
                              <InputAdornment position="start">
                                <PaymentIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
                                <Typography sx={{ ml: 0.5, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'inherit' }}>R$</Typography>
                              </InputAdornment>
                            ),
                          }}
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
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccountBalanceWalletIcon sx={{ color: colors.primary }} />
                                <Typography sx={{ ml: 0.5, color: colors.primary, fontWeight: 600 }}>R$</Typography>
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                          variant="outlined"
                          sx={{
                            ...inputStyles,
                            '& .MuiInputBase-input': {
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(27, 94, 32, 0.1)' 
                                : 'rgba(27, 94, 32, 0.05)',
                              fontWeight: 700,
                              color: colors.primary,
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Botões de navegação Step 1 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderColor: colors.primary,
                      color: colors.primary,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: colors.primaryDark,
                        backgroundColor: `${colors.primary}10`,
                      },
                    }}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!canProceed}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      backgroundColor: colors.primary,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: colors.primaryDark,
                      },
                      '&:disabled': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    Próximo
                  </Button>
                </Box>
              </Box>
            </Fade>

            {/* Step 2: Itens do Inventário */}
            <Fade in={activeStep === 2} timeout={400} unmountOnExit>
              <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
                <Card elevation={2} sx={{ 
                  mb: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  },
                }}>
                  <CardHeader
                    avatar={
                      <Box sx={{ 
                        backgroundColor: `${colors.primary}20`, 
                        borderRadius: 2, 
                        p: 1, 
                        display: 'flex' 
                      }}>
                        <InventoryIcon sx={{ color: colors.primary }} />
                      </Box>
                    }
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Itens do Inventário
                        </Typography>
                        <Badge
                          badgeContent={novaLocacao.itens?.length || itensAdicionados.length}
                          color="primary"
                          showZero
                        />
                      </Box>
                    }
                    action={
                      <Chip 
                        label={isStepComplete(2) ? "Itens selecionados" : "Selecione itens"} 
                        size="small"
                        sx={{ 
                          backgroundColor: isStepComplete(2) ? `${colors.primary}20` : 'rgba(255, 152, 0, 0.2)',
                          color: isStepComplete(2) ? colors.primary : '#ff9800',
                          fontWeight: 500,
                        }}
                      />
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                      Verifique a disponibilidade dos itens antes de adicioná-los à locação.
                    </Alert>

                    <InventoryCheck
                      onItemSelect={(items) => {
                        const formattedItems = items.map((item) => ({
                          modelo: item.nome_item,
                          quantidade: item.quantidade_solicitada,
                          unidade: "peças",
                        }));
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

                {/* Seção de Itens Adicionados */}
                {itensAdicionados.length > 0 && (
                  <Card elevation={2} sx={{ 
                    mb: 3, 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.02)' 
                      : '#f8f9fa',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    <CardHeader
                      avatar={
                        <Box sx={{ 
                          backgroundColor: `${colors.primary}20`, 
                          borderRadius: 2, 
                          p: 1, 
                          display: 'flex' 
                        }}>
                          <CheckCircleIcon sx={{ color: colors.primary }} />
                        </Box>
                      }
                      title="Itens Selecionados"
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                      action={
                        <Chip 
                          label={`${itensAdicionados.length} item(s)`} 
                          size="small"
                          sx={{ 
                            backgroundColor: `${colors.primary}20`,
                            color: colors.primary,
                            fontWeight: 500,
                          }}
                        />
                      }
                      sx={{ pb: 1 }}
                    />
                    <CardContent>
                      <List sx={{ p: 0 }}>
                        {itensAdicionados.map((item, index) => (
                          <Grow in key={index} timeout={300 + index * 100}>
                            <ListItem 
                              sx={{ 
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.05)' 
                                  : 'white',
                                borderRadius: 2,
                                mb: 1,
                                border: theme.palette.mode === 'dark' 
                                  ? '1px solid rgba(255, 255, 255, 0.12)' 
                                  : '1px solid #e0e0e0',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.08)' 
                                    : '#f5f5f5',
                                  transform: 'translateX(4px)',
                                },
                              }}
                            >
                              <ListItemText
                                primary={`${item.modelo} - ${item.quantidade} unidades`}
                                secondary={item.category ? `Categoria: ${item.category}` : ''}
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                              <Tooltip title="Remover item">
                                <IconButton 
                                  onClick={() => handleRemoveItem(index)}
                                  color="error"
                                  size="small"
                                  sx={{
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'scale(1.1)',
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </ListItem>
                          </Grow>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}

                {/* Botões de navegação Step 2 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderColor: colors.primary,
                      color: colors.primary,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: colors.primaryDark,
                        backgroundColor: `${colors.primary}10`,
                      },
                    }}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={isLoading || !isStepComplete(0) || !isStepComplete(1)}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    sx={{
                      backgroundColor: colors.primary,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: 3,
                      '&:hover': {
                        backgroundColor: colors.primaryDark,
                        boxShadow: 6,
                      },
                      '&:disabled': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    {isLoading ? "Registrando..." : "Registrar Locação"}
                  </Button>
                </Box>
              </Box>
            </Fade>
          </form>
        </Box>

        </Paper>
      </Container>

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
    </Box>
  );
};

export default RegisterFormView;
