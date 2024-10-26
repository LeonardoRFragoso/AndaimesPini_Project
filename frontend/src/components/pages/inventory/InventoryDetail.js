// frontend/src/components/pages/inventory/InventoryDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import axios from "axios";

const InventoryDetail = () => {
  const { id } = useParams(); // Pega o ID do item na URL
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  // Função para buscar detalhes do item no backend
  const fetchItemDetails = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/inventario/${id}`
      );
      setItem(response.data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do item:", error);
      setError("Erro ao buscar detalhes do item. Por favor, tente novamente.");
    }
  };

  // Função para salvar as alterações do item
  const handleSaveChanges = async () => {
    if (item.quantity <= 0) {
      setError("A quantidade deve ser um número positivo.");
      return;
    }

    try {
      await axios.put(`http://127.0.0.1:5000/inventario/${id}`, item);
      setIsEditing(false);
      alert("Item atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      setError("Erro ao salvar alterações. Por favor, tente novamente.");
    }
  };

  // Função para deletar o item
  const handleDeleteItem = async () => {
    if (window.confirm("Tem certeza de que deseja excluir este item?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/inventario/${id}`);
        alert("Item excluído com sucesso!");
        navigate("/inventory"); // Redireciona para a página de inventário
      } catch (error) {
        console.error("Erro ao excluir o item:", error);
        setError("Erro ao excluir o item. Por favor, tente novamente.");
      }
    }
  };

  // Manipulação de mudanças nos campos de entrada
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  if (!item) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalhes do Item: {item.nome_item}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Nome do Item"
        name="nome_item"
        value={item.nome_item}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={!isEditing}
      />
      <TextField
        label="Quantidade"
        name="quantidade"
        type="number"
        value={item.quantidade}
        onChange={handleChange}
        fullWidth
        margin="normal"
        inputProps={{ min: 1 }}
        disabled={!isEditing}
      />

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        {isEditing ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
            >
              Salvar Alterações
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteItem}
            >
              Excluir
            </Button>
          </>
        )}
        <Button variant="outlined" onClick={() => navigate("/inventory")}>
          Voltar ao Inventário
        </Button>
      </Box>
    </Box>
  );
};

export default InventoryDetail;
