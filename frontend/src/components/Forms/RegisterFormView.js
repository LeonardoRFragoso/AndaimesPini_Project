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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, margin: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Registrar Nova Locação
      </Typography>
      <form onSubmit={(e) => e.preventDefault()}>
        <Grid container spacing={3}>
          {/* Seção de Informações do Cliente */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome do Cliente"
              name="nome_cliente"
              value={novaLocacao.nome_cliente}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Endereço do Cliente"
              name="endereco_cliente"
              value={novaLocacao.endereco_cliente}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Telefone do Cliente"
              name="telefone_cliente"
              value={novaLocacao.telefone_cliente}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Número da Nota"
              name="numero_nota"
              value={novaLocacao.numero_nota}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Referência"
              name="referencia"
              value={novaLocacao.referencia}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Referência Rápida"
              name="referencia_rapida"
              value={novaLocacao.referencia_rapida}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Seção de Datas e Valores */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Data de Início"
              type="date"
              name="data_inicio"
              value={novaLocacao.data_inicio}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Dias Combinados"
              type="number"
              name="dias_combinados"
              value={novaLocacao.dias_combinados}
              onChange={handleDiasCombinadosChange}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Data de Fim"
              type="date"
              name="data_fim"
              value={novaLocacao.data_fim}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Valor Total"
              type="number"
              name="valor_total"
              value={novaLocacao.valor_total}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Valor Pago na Entrega"
              type="number"
              name="valor_pago_entrega"
              value={novaLocacao.valor_pago_entrega}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Valor a Receber Final"
              type="number"
              name="valor_receber_final"
              value={novaLocacao.valor_receber_final}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Grid>

          {/* Seção de Itens do Inventário */}
          <Grid item xs={12}>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="itens-content"
                id="itens-header"
              >
                <Typography variant="h6">
                  <Badge
                    badgeContent={novaLocacao.itens.length}
                    color="primary"
                    showZero
                  >
                    Itens do Inventário
                  </Badge>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Verifique a disponibilidade dos itens antes de adicioná-los à
                  locação.
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

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Método tradicional de seleção:
                </Typography>

                <Grid container spacing={2}>
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
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Seção de Itens Adicionados */}
          <Grid item xs={12}>
            <Typography variant="h6">Itens Adicionados</Typography>
            {itensAdicionados.length === 0 ? (
              <Typography>Nenhum item adicionado.</Typography>
            ) : (
              <List>
                {itensAdicionados.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${item.modelo} - ${item.quantidade}`}
                      secondary={`Categoria: ${item.category}`}
                    />
                    <IconButton onClick={() => handleRemoveItem(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>

          {/* Botão Registrar Locação */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => setConfirmDialogOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Registrar Locação"}
            </Button>
          </Grid>
        </Grid>
      </form>

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
  );
};

export default RegisterFormView;
