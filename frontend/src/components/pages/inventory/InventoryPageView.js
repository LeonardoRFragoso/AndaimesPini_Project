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
} from "@mui/material";
import { Search } from "@mui/icons-material";
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
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Controle de Estoque
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Gerencie e monitore todos os itens do seu inventário
          </Typography>
        </Box>
        
        <Box sx={{
          padding: 4,
          backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : '#f8f9fa',
        }}>
          {/* Componente de Ações, como Adicionar Item */}
          <InventoryActions onAddItem={onAddItem} />

          {/* Campo de Busca */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.8)' : '#ffffff',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
              mb: 3
            }}
          >
            <TextField
              label="Buscar item"
              variant="outlined"
              fullWidth
              value={filter}
              onChange={(e) => onFilterChange(e)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                }
              }}
            />
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

      {/* Modal de Edição/Adição de Item */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.95)' : '#fff',
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          {currentItem ? "Editar Item" : "Adicionar Item"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
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
            backgroundColor: "#4caf50",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "12px 24px",
            borderRadius: "8px",
          },
        }}
      />
    </Container>
  );
};

export default InventoryPageView;
