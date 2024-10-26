// InventoryForm.js
import React, { useState } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";

const InventoryForm = ({ onSubmit, initialData }) => {
  const [itemData, setItemData] = useState(
    initialData || { name: "", quantity: "" }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(itemData);
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
          />
        </Grid>
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
