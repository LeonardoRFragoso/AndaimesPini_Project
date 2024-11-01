// frontend/src/components/Forms/RegisterFormView.js

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FormDetailsSection from "./FormDetailsSection";
import CategorySection from "../pages/sections/CategorySection";

const RegisterFormView = ({
  novaLocacao,
  handleChange,
  handleSubmit,
  addItem,
  CATEGORIES,
  estoqueDisponivel,
  fetchInventario, // Certifique-se de que esta função atualiza o estoque do backend
  handleDiasCombinadosChange,
}) => {
  const [itensAdicionados, setItensAdicionados] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Chama a função para atualizar o estoque sempre que o componente é montado
    fetchInventario();
  }, [fetchInventario]);

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
    setIsLoading(true); // Início do feedback de carregamento
    await handleSubmit(event);
    setConfirmDialogOpen(false);
    setItensAdicionados([]);
    await fetchInventario(); // Atualiza o estoque após a submissão
    setIsLoading(false); // Fim do feedback de carregamento
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, margin: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Registrar nova locação
      </Typography>
      <form onSubmit={(e) => e.preventDefault()}>
        <Grid container spacing={3}>
          {/* Seção de Detalhes do Formulário */}
          <Grid item xs={12} mb={2}>
            <FormDetailsSection
              novaLocacao={novaLocacao}
              handleChange={handleChange}
              handleDiasCombinadosChange={handleDiasCombinadosChange}
            />
            <Box display="flex" gap={1} alignItems="center" mt={2}>
              <Typography variant="subtitle1">Valor Total</Typography>
              <Tooltip title="Informe o valor total da locação" arrow>
                <HelpOutlineIcon
                  fontSize="small"
                  color="action"
                  sx={{ ml: 0.5 }}
                />
              </Tooltip>
            </Box>
          </Grid>

          {/* Seção de Itens Prioritários com Accordion */}
          <Grid item xs={12} mb={2}>
            <Accordion defaultExpanded sx={{ boxShadow: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ color: "#1976d2" }}>
                  Itens do Inventário - Mais Alugados
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {["escoras", "andaimes"].map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <CategorySection
                        title={category}
                        category={category}
                        CATEGORIES={CATEGORIES}
                        estoqueDisponivel={estoqueDisponivel}
                        addItem={handleAddItem}
                        highlight
                        buttonStyle={{
                          backgroundColor: "#E3F2FD",
                          "&:hover": { backgroundColor: "#BBDEFB" },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Seção de Outros Itens com Accordion */}
          <Grid item xs={12} mb={2}>
            <Accordion sx={{ boxShadow: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5">Outros Itens do Inventário</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.keys(CATEGORIES).map(
                    (category) =>
                      !["escoras", "andaimes"].includes(category) && (
                        <Grid item xs={12} sm={6} md={4} key={category}>
                          <CategorySection
                            title={category}
                            category={category}
                            CATEGORIES={CATEGORIES}
                            estoqueDisponivel={estoqueDisponivel}
                            addItem={handleAddItem}
                            buttonStyle={{
                              backgroundColor: "#E3F2FD",
                              "&:hover": { backgroundColor: "#BBDEFB" },
                            }}
                          />
                        </Grid>
                      )
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Seção de Itens Adicionados com contador e feedback de lista */}
          <Grid item xs={12} mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Badge badgeContent={itensAdicionados.length} color="primary">
                <Typography variant="h6" gutterBottom>
                  Itens Adicionados{" "}
                  {itensAdicionados.length > 0
                    ? `(${itensAdicionados.length} itens)`
                    : "(Nenhum item adicionado)"}
                </Typography>
              </Badge>
            </Box>
            {itensAdicionados.length > 0 && (
              <List>
                {itensAdicionados.map((item, index) => (
                  <div key={index}>
                    <ListItem
                      secondaryAction={
                        <Tooltip title="Remover item" arrow>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemText
                        primary={`${item.modelo} - ${item.quantidade} ${item.unidade}`}
                        secondary={`Categoria: ${item.category}`}
                      />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            )}
          </Grid>

          {/* Botão Registrar Locação com Feedback de Carregamento */}
          <Grid item xs={12}>
            <Button
              type="button"
              variant="contained"
              color="success"
              fullWidth
              onClick={() => setConfirmDialogOpen(true)}
              sx={{ mt: 2, borderRadius: 3, padding: 1.5 }}
              disabled={isLoading} // Desativa o botão durante o carregamento
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" /> // Indicador de carregamento
              ) : (
                "Registrar Locação"
              )}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar para feedback */}
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
        <DialogTitle>Confirmar Registro de Locação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja realmente registrar esta locação com os itens informados?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmSubmit} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RegisterFormView;
