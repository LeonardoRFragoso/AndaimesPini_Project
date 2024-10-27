// frontend/src/components/Forms/InventoryForm.js
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  MenuItem,
} from "@mui/material";

const InventoryForm = ({ onSubmit, initialData }) => {
  const [itemData, setItemData] = useState({
    nome_item: "",
    quantidade: "",
    tipo_item: "",
  });
  const [error, setError] = useState("");

  // Atualiza itemData sempre que initialData muda (ao alternar entre edição/adicionar)
  useEffect(() => {
    setItemData(
      initialData || { nome_item: "", quantidade: "", tipo_item: "" }
    );
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações: nome do item e tipo do item não devem estar vazios e quantidade deve ser positiva
    if (!itemData.nome_item) {
      setError("O nome do item é obrigatório.");
      return;
    }
    if (!itemData.tipo_item) {
      setError("O tipo do item é obrigatório.");
      return;
    }
    if (itemData.quantidade <= 0) {
      setError("A quantidade deve ser um número positivo.");
      return;
    }

    setError(""); // Limpar erro, se houver
    onSubmit(itemData);

    // Limpar o formulário apenas ao adicionar um novo item, não ao editar
    if (!initialData) {
      setItemData({ nome_item: "", quantidade: "", tipo_item: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Adicionar/Editar Item
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Nome do Item"
            name="nome_item"
            value={itemData.nome_item}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Quantidade"
            name="quantidade"
            type="number"
            value={itemData.quantidade}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            label="Tipo do Item"
            name="tipo_item"
            value={itemData.tipo_item}
            onChange={handleChange}
            fullWidth
            required
          >
            {/* Definir opções de tipo de item */}
            <MenuItem value="andaimes">Andaimes</MenuItem>
            <MenuItem value="escoras">Escoras</MenuItem>
            <MenuItem value="ferros">Ferros</MenuItem>
            <MenuItem value="forcados">Forcados</MenuItem>
            <MenuItem value="madeira">Madeira</MenuItem>
            <MenuItem value="pranchões">Pranchões</MenuItem>
            <MenuItem value="rodízios">Rodízios</MenuItem>
            <MenuItem value="sapatas">Sapatas</MenuItem>
          </TextField>
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Salvar
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default InventoryForm;
