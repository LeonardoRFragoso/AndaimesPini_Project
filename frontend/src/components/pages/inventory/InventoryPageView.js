// src/components/pages/inventory/InventoryPageView.js
import React from "react";
import {
  Box,
  Typography,
  Snackbar,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Button,
  Container,
  Paper,
  useTheme,
  InputAdornment,
  Chip,
  Fade,
  Alert,
} from "@mui/material";
import { 
  Search, 
  Inventory2, 
  TrendingUp,
  Category,
} from "@mui/icons-material";
import InventoryTable from "../../tables/InventoryTable";
import InventoryForm from "../../Forms/InventoryForm";
import InventoryActions from "./InventoryActions";

const InventoryPageView = ({
  items,
  isLoading,
  filter,
  onFilterChange,
  sortItems,
  sortConfig,
  isEditing,
  setIsEditing,
  currentItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onSaveItem,
  feedback,
  onCloseFeedback,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
  };

  // Calcular estatísticas
  const totalItems = items.length;
  const totalQuantity = items.reduce((acc, item) => acc + (item.quantidade || 0), 0);
  const uniqueTypes = [...new Set(items.map(item => item.tipo_item))].length;
  
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
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#fff', 
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Controle de Estoque
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
            Gerencie e monitore todos os itens do seu inventário
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -5 }}>
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
        <Box sx={{
          padding: 4,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : '#fff',
        }}>
          {/* Componente de Ações, como Adicionar Item */}
          <InventoryActions onAddItem={onAddItem} />

          {/* Cards de Estatísticas */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
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
                  <Inventory2 sx={{ color: colors.primary, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary }}>
                    {totalItems}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Itens Cadastrados
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
                  <TrendingUp sx={{ color: '#2196f3', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    {totalQuantity.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Quantidade Total
                  </Typography>
                </Box>
              </Paper>
            </Fade>

            <Fade in timeout={700}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(156, 39, 176, 0.2)'}`,
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
                  backgroundColor: 'rgba(156, 39, 176, 0.2)', 
                  borderRadius: 2, 
                  p: 1.5, 
                  display: 'flex' 
                }}>
                  <Category sx={{ color: '#9c27b0', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {uniqueTypes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    Tipos de Itens
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
                Buscar no Inventário
              </Typography>
              {filter && (
                <Chip 
                  label={`"${filter}"`}
                  size="small"
                  onDelete={() => onFilterChange({ target: { value: '' } })}
                  sx={{ 
                    ml: 1,
                    backgroundColor: `${colors.primary}20`,
                    color: colors.primary,
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>
            <TextField
              placeholder="Digite o nome, tipo ou qualquer informação do item..."
              variant="outlined"
              fullWidth
              value={filter}
              onChange={(e) => onFilterChange(e)}
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
            {filter && items.length === 0 && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                Nenhum item encontrado para "{filter}". Tente outro termo de busca.
              </Alert>
            )}
          </Paper>

          {/* Indicador de Carregamento */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={60} sx={{ color: '#4caf50' }} />
            </Box>
          ) : (
            // Tabela de Inventário com ordenação e filtros
            <InventoryTable
              items={items}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              sortItems={sortItems}
              sortConfig={sortConfig}
            />
          )}
        </Box>
        </Paper>
      </Container>

      {/* Modal de Edição/Adição de Item */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.95)' : '#fff',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          color: 'white',
          fontWeight: 600
        }}>
          {currentItem ? "Editar Item" : "Adicionar Item"}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <InventoryForm onSubmit={onSaveItem} initialData={currentItem} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setIsEditing(false)} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback de Ações */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={onCloseFeedback}
        message={feedback.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor: colors.primary,
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "12px 24px",
            borderRadius: "8px",
          },
        }}
      />
    </Box>
  );
};

export default InventoryPageView;
