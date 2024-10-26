import React, { useState, useEffect } from "react";
import { TextField, Button, Grid, Typography, Alert } from "@mui/material";

const InventoryForm = ({ onSubmit, initialData }) => {
  const [itemData, setItemData] = useState({ name: "", quantity: "" });
  const [error, setError] = useState("");

  // Atualiza itemData sempre que initialData muda (ao alternar entre edição/adicionar)
  useEffect(() => {
    setItemData(initialData || { name: "", quantity: "" });
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

    // Validação: quantidade deve ser positiva
    if (itemData.quantity <= 0) {
      setError("A quantidade deve ser um número positivo.");
      return;
    }

    setError(""); // Limpar erro, se houver
    onSubmit(itemData);

    // Limpar formulário após o envio
    setItemData({ name: "", quantity: "" });
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
            name="name"
            value={itemData.name}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Quantidade"
            name="quantity"
            type="number"
            value={itemData.quantity}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />
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
