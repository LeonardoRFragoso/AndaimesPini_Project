// InventoryPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import InventoryTable from "../../tables/InventoryTable"; // Caminho ajustado
import InventoryForm from "../../Forms/InventoryForm"; // Caminho ajustado

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    // Fetch items do estoque
    fetchItems();
  }, []);

  const fetchItems = async () => {
    // Exemplo de resposta mockada
    const response = [
      { id: 1, name: "Andaime 1,0m", quantity: 20 },
      { id: 2, name: "Escora 3,5m", quantity: 10 },
    ];
    setItems(response);
  };

  const handleAddItem = () => {
    setIsEditing(true);
    setCurrentItem(null); // Limpa o item atual ao adicionar um novo
  };

  const handleEditItem = (item) => {
    setIsEditing(true);
    setCurrentItem(item); // Define o item a ser editado
  };

  const handleDeleteItem = (id) => {
    // Simulação de exclusão (chamada para API no projeto real)
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSaveItem = (item) => {
    // Simulação de salvar item (chamada para API no projeto real)
    if (item.id) {
      // Atualiza o item existente
      setItems(items.map((i) => (i.id === item.id ? item : i)));
    } else {
      // Adiciona novo item
      item.id = items.length + 1;
      setItems([...items, item]);
    }
    setIsEditing(false); // Fecha o formulário após salvar
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Controle de Estoque
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddItem}
        sx={{ mb: 2 }}
      >
        Adicionar Novo Item
      </Button>
      <InventoryTable
        items={items}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />
      {isEditing && (
        <InventoryForm item={currentItem} onSave={handleSaveItem} />
      )}
    </Box>
  );
};

export default InventoryPage;
