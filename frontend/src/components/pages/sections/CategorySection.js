// frontend/src/components/pages/sections/CategorySection.js

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const CategorySection = ({
  title,
  category,
  CATEGORIES = {},
  estoqueDisponivel = {},
  addItem,
}) => {
  const [itemState, setItemState] = useState({
    modelo: "",
    quantidade: 0,
    unidade: "peças",
  });

  const handleModelChange = (modelo) => {
    setItemState((prev) => ({ ...prev, modelo }));
  };

  const handleQuantityChange = (quantidade) => {
    setItemState((prev) => ({
      ...prev,
      quantidade: parseInt(quantidade) || 0,
    }));
  };

  const handleUnitChange = (unidade) => {
    setItemState((prev) => ({ ...prev, unidade }));
  };

  const handleAddItem = () => {
    const { modelo, quantidade, unidade } = itemState;
    if (modelo && quantidade > 0) {
      addItem(category, modelo, quantidade, unidade);
      setItemState({ modelo: "", quantidade: 0, unidade: "peças" });
    } else {
      alert("Selecione um modelo e informe uma quantidade válida.");
    }
  };

  return (
    <Card variant="outlined" sx={{ width: "100%", mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>

        {/* Select para Modelo */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Modelo</InputLabel>
          <Select
            value={itemState.modelo}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            {(CATEGORIES[category] || []).map((modelo) => (
              <MenuItem key={modelo} value={modelo}>
                {modelo} - {estoqueDisponivel[modelo] || 0} disponíveis
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Input para Quantidade */}
        <TextField
          label="Quantidade"
          type="number"
          fullWidth
          margin="normal"
          value={itemState.quantidade}
          onChange={(e) => handleQuantityChange(e.target.value)}
        />

        {/* Select para Unidade (exibido apenas para andaimes) */}
        {category === "andaimes" && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Unidade</InputLabel>
            <Select
              value={itemState.unidade}
              onChange={(e) => handleUnitChange(e.target.value)}
            >
              <MenuItem value="peças">Peças</MenuItem>
              <MenuItem value="metros">Metros</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Botão para adicionar item */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddItem}
          sx={{ mt: 2 }}
        >
          Adicionar {title}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CategorySection;
