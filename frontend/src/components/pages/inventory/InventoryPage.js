// src/components/pages/inventory/InventoryPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Snackbar, TextField } from "@mui/material";
import InventoryTable from "../../tables/InventoryTable";
import InventoryForm from "../../Forms/InventoryForm";
import InventoryActions from "./InventoryActions";
import axios from "axios";

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [filter, setFilter] = useState("");
  const [feedback, setFeedback] = useState({ open: false, message: "" });

  // Função para buscar itens do inventário na API
  const fetchItems = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/inventario");
      setItems(response.data);
    } catch (error) {
      console.error("Erro ao buscar itens do inventário:", error);
    }
  };

  // Carrega itens do inventário ao montar o componente
  useEffect(() => {
    fetchItems();
  }, []);

  // Abre o formulário para adicionar um novo item
  const handleAddItem = () => {
    setIsEditing(true);
    setCurrentItem(null);
  };

  // Abre o formulário com o item selecionado para edição
  const handleEditItem = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
  };

  // Função para deletar um item do inventário
  const handleDeleteItem = async (id) => {
    if (window.confirm("Tem certeza de que deseja excluir este item?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/inventario/${id}`);
        fetchItems(); // Atualiza a lista do inventário
        setFeedback({ open: true, message: "Item excluído com sucesso!" });
      } catch (error) {
        console.error("Erro ao excluir o item:", error);
      }
    }
  };

  // Salva um novo item ou atualiza um existente
  const handleSaveItem = async (item) => {
    try {
      if (item.id) {
        // Atualiza o item existente
        await axios.put(`http://127.0.0.1:5000/inventario/${item.id}`, item);
        setFeedback({ open: true, message: "Item atualizado com sucesso!" });
      } else {
        // Adiciona um novo item
        await axios.post("http://127.0.0.1:5000/inventario", item);
        setFeedback({ open: true, message: "Item adicionado com sucesso!" });
      }
      setIsEditing(false); // Fecha o formulário após salvar
      fetchItems(); // Atualiza a lista do inventário após salvar
    } catch (error) {
      console.error("Erro ao salvar o item:", error);
    }
  };

  // Fecha o Snackbar de feedback
  const handleCloseFeedback = () => {
    setFeedback({ open: false, message: "" });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Controle de Estoque
      </Typography>

      {/* Componente de Ações, como Adicionar Item */}
      <InventoryActions />

      {/* Campo de Busca */}
      <TextField
        label="Buscar item"
        variant="outlined"
        fullWidth
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Tabela de Inventário */}
      <InventoryTable
        items={items.filter((item) =>
          item.nome_item?.toLowerCase().includes(filter.toLowerCase())
        )}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        fetchItems={fetchItems}
      />

      {/* Formulário de Edição/Adição de Item */}
      {isEditing && (
        <InventoryForm
          onSubmit={handleSaveItem}
          initialData={currentItem}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Feedback de Ações */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={handleCloseFeedback}
        message={feedback.message}
      />
    </Box>
  );
};

export default InventoryPage;
