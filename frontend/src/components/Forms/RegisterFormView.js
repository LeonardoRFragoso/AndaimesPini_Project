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
} from "@mui/material";

const RegisterFormView = ({
  novaLocacao,
  handleChange,
  handleSubmit,
  addItem,
  CATEGORIES,
  estoqueDisponivel, // Recebe o estoque disponível do componente pai
  handleDiasCombinadosChange,
}) => {
  // Estado local para armazenar o modelo, quantidade e unidade antes de adicionar ao inventário
  const [itemState, setItemState] = useState({});
  const [itensAdicionados, setItensAdicionados] = useState([]); // Estado para itens adicionados

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

    // Validação de modelo e quantidade
    if (!modelo || quantidade <= 0) {
      alert("Selecione um modelo e informe uma quantidade válida.");
      return;
    }

    // Verificação do estoque disponível
    const quantidadeEstoque = estoqueDisponivel[modelo] || 0;
    if (quantidade > quantidadeEstoque) {
      alert(
        `Quantidade solicitada para ${modelo} excede o estoque disponível (${quantidadeEstoque} unidades).`
      );
      return;
    }

    // Adiciona o item usando a função `addItem` passada como prop
    addItem(category, modelo, quantidade, unidade || "peças");

    // Adiciona o item à lista de itens adicionados
    setItensAdicionados((prev) => [
      ...prev,
      { category, modelo, quantidade, unidade: unidade || "peças" },
    ]);

    // Limpa o estado do item após a adição bem-sucedida
    setItemState((prev) => ({
      ...prev,
      [category]: { modelo: "", quantidade: 0, unidade: "peças" },
    }));
  };

  const renderCategoryFields = (category) => (
    <Grid item xs={12} sm={6} md={4} key={category}>
      <Card variant="outlined" style={{ marginBottom: 16 }}>
        <CardContent>
          <Typography variant="h6">
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
                  {modelo}
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
          {/* Adiciona seleção de unidade para andaimes */}
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
            onClick={() => handleAddItem(category)}
          >
            Adicionar {category}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Paper elevation={3} className="register-form">
      <form onSubmit={handleSubmit}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6} key={field.name}>
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
                  <ListItem>
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
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Registrar Locação
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default RegisterFormView;
