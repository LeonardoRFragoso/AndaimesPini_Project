import React, { useState } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";

const RegisterFormView = ({
  novaLocacao,
  handleChange,
  handleSubmit,
  addItem,
  CATEGORIES,
  estoqueDisponivel,
  fetchEstoque,
  handleDiasCombinadosChange,
}) => {
  const [itemState, setItemState] = useState({});
  const [itensAdicionados, setItensAdicionados] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleModelChange = (category, modelo) => {
    setItemState((prev) => ({
      ...prev,
      [category]: { ...prev[category], modelo },
    }));
  };

  const handleQuantityChange = (category, quantidade) => {
    setItemState((prev) => ({
      ...prev,
      [category]: { ...prev[category], quantidade: parseInt(quantidade) || 0 },
    }));
  };

  const handleUnitChange = (category, unidade) => {
    setItemState((prev) => ({
      ...prev,
      [category]: { ...prev[category], unidade },
    }));
  };

  const handleAddItem = (category) => {
    const { modelo, quantidade, unidade } = itemState[category] || {};

    if (!modelo || quantidade <= 0) {
      alert("Selecione um modelo e informe uma quantidade válida.");
      return;
    }

    const quantidadeEstoque = estoqueDisponivel[modelo] || 0;
    if (quantidade > quantidadeEstoque) {
      alert(
        `Quantidade solicitada para ${modelo} excede o estoque disponível (${quantidadeEstoque} unidades).`
      );
      return;
    }

    addItem(category, modelo, quantidade, unidade || "peças");
    setItensAdicionados((prev) => [
      ...prev,
      { category, modelo, quantidade, unidade: unidade || "peças" },
    ]);

    setItemState((prev) => ({
      ...prev,
      [category]: { modelo: "", quantidade: 0, unidade: "peças" },
    }));
    setSnackbarOpen(true);
  };

  const handleRemoveItem = (index) => {
    setItensAdicionados((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setItemState({});
    setItensAdicionados([]);
    handleChange({ target: { name: "numero_nota", value: "" } });
    handleChange({ target: { name: "cliente_info", value: {} } });
    handleChange({ target: { name: "data_inicio", value: "" } });
    handleChange({ target: { name: "dias_combinados", value: 1 } });
    handleChange({ target: { name: "data_fim", value: "" } });
    handleChange({ target: { name: "valor_total", value: 0 } });
    handleChange({ target: { name: "valor_pago_entrega", value: 0 } });
    handleChange({ target: { name: "valor_receber_final", value: 0 } });
  };

  const handleConfirmSubmit = async (event) => {
    event.preventDefault();
    await handleSubmit(event); // Confirmar o registro
    setConfirmDialogOpen(false);
    resetForm(); // Limpar os campos do formulário
    fetchEstoque(); // Atualizar o estoque após o registro
  };

  const renderCategoryFields = (category) => (
    <Grid item xs={12} sm={6} md={4} key={category}>
      <Card variant="outlined" style={{ marginBottom: 16 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Typography>
          <FormControl fullWidth style={{ marginBottom: 8 }}>
            <InputLabel>Selecione o modelo de {category}</InputLabel>
            <Select
              value={itemState[category]?.modelo || ""}
              onChange={(e) => handleModelChange(category, e.target.value)}
            >
              {(CATEGORIES[category] || []).map((modelo, index) => (
                <MenuItem key={index} value={modelo}>
                  {modelo} - {estoqueDisponivel[modelo] || 0} disponíveis
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Quantidade"
            type="number"
            value={itemState[category]?.quantidade || ""}
            onChange={(e) => handleQuantityChange(category, e.target.value)}
            style={{ marginTop: 16 }}
          />
          {category === "andaimes" && (
            <FormControl fullWidth style={{ marginTop: 16 }}>
              <InputLabel>Unidade</InputLabel>
              <Select
                value={itemState[category]?.unidade || "peças"}
                onChange={(e) => handleUnitChange(category, e.target.value)}
              >
                <MenuItem value="peças">Peças</MenuItem>
                <MenuItem value="metros">Metros</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: 16 }}
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => handleAddItem(category)}
          >
            Adicionar {category}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Paper elevation={3} className="register-form" sx={{ padding: 3 }}>
      <form onSubmit={(e) => e.preventDefault()}>
        <Typography variant="h4" align="center" gutterBottom>
          Registrar nova locação
        </Typography>

        <Grid container spacing={2}>
          {/* Campos de Nota e Cliente */}
          <Grid item xs={12}>
            <TextField
              label="Número da Nota"
              name="numero_nota"
              value={novaLocacao?.numero_nota || ""}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Dados do Responsável
            </Typography>
            {[
              { label: "Nome", name: "nome" },
              { label: "Endereço", name: "endereco" },
              { label: "Referência", name: "referencia" },
              { label: "Referência Rápida", name: "referencia_rapida" },
              { label: "Telefone", name: "telefone" },
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                <TextField
                  label={field.label}
                  name={`cliente_info.${field.name}`}
                  value={novaLocacao?.cliente_info?.[field.name] || ""}
                  onChange={handleChange}
                  fullWidth
                  required={
                    field.name !== "referencia" &&
                    field.name !== "referencia_rapida"
                  }
                />
              </Grid>
            ))}
          </Grid>

          {/* Detalhes da Locação */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Detalhes da Locação
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Data de Início"
                  type="date"
                  name="data_inicio"
                  value={novaLocacao?.data_inicio || ""}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quantidade de Dias Combinados"
                  type="number"
                  name="dias_combinados"
                  value={novaLocacao?.dias_combinados || ""}
                  onChange={handleDiasCombinadosChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Data de Fim"
                  type="date"
                  name="data_fim"
                  value={novaLocacao?.data_fim || ""}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Valores da Locação */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Valores da Locação
            </Typography>
            {[
              { label: "Valor Total", name: "valor_total" },
              { label: "Valor Pago na Entrega", name: "valor_pago_entrega" },
              {
                label: "Valor a Receber no Final",
                name: "valor_receber_final",
              },
            ].map((field) => (
              <Grid item xs={12} sm={4} key={field.name}>
                <TextField
                  label={field.label}
                  type="number"
                  name={field.name}
                  value={novaLocacao?.[field.name] || ""}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            ))}
          </Grid>

          {/* Itens do Inventário */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Itens do Inventário
            </Typography>
            <Grid container spacing={2}>
              {Object.keys(CATEGORIES || {}).map((category) =>
                renderCategoryFields(category)
              )}
            </Grid>
          </Grid>

          {/* Lista de Itens Adicionados */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Itens Adicionados
            </Typography>
            <List>
              {itensAdicionados.map((item, index) => (
                <div key={index}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
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
          </Grid>

          {/* Botão de Submit */}
          <Grid item xs={12}>
            <Button
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setConfirmDialogOpen(true)}
            >
              Registrar Locação
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar de confirmação */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Item adicionado com sucesso"
      />

      {/* Diálogo de confirmação */}
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
