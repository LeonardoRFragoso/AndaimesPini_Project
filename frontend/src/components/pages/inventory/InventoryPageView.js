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
} from "@mui/material";
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
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Controle de Estoque
      </Typography>

      {/* Componente de Ações, como Adicionar Item */}
      <InventoryActions onAddItem={onAddItem} />

      {/* Campo de Busca */}
      <TextField
        label="Buscar item"
        variant="outlined"
        fullWidth
        value={filter}
        onChange={(e) => onFilterChange(e)}
        sx={{ mb: 2 }}
      />

      {/* Indicador de Carregamento */}
      {isLoading ? (
        <CircularProgress />
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

      {/* Modal de Edição/Adição de Item */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentItem ? "Editar Item" : "Adicionar Item"}
        </DialogTitle>
        <DialogContent>
          <InventoryForm onSubmit={onSaveItem} initialData={currentItem} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)} color="secondary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback de Ações */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={onCloseFeedback}
        message={feedback.message}
      />
    </Box>
  );
};

export default InventoryPageView;
