// src/components/pages/inventory/InventoryPageContainer.js
import React, { useState, useEffect } from "react";
import InventoryPageView from "./InventoryPageView";
import { listarItens, criarItem, atualizarItem, excluirItem } from "../../../api/inventario";

const InventoryPageContainer = () => {
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [filter, setFilter] = useState("");
  const [feedback, setFeedback] = useState({ open: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  });

  // Função para buscar itens do inventário na API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await listarItens();
      setItems(data); // Atualiza o estado com os dados retornados
    } catch (error) {
      console.error("Erro ao buscar itens do inventário:", error);
      setFeedback({
        open: true,
        message: "Erro ao buscar itens do inventário.",
      });
    }
    setLoading(false);
  };

  // Carrega itens do inventário ao montar o componente
  useEffect(() => {
    fetchItems();
  }, []);

  // Função de ordenação
  const sortItems = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedItems = [...items].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    setItems(sortedItems);
  };

  // Função de filtro para busca
  const filteredItems = items.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(filter.toLowerCase())
    )
  );

  // Função para manipular a busca
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Funções para edição, exclusão e salvamento de itens
  const handleAddItem = () => {
    setIsEditing(true);
    setCurrentItem(null); // Para adicionar novo item
  };

  const handleEditItem = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Tem certeza de que deseja excluir este item?")) {
      try {
        await excluirItem(id);
        fetchItems(); // Atualiza a lista do inventário
        setFeedback({ open: true, message: "Item excluído com sucesso!" });
      } catch (error) {
        console.error("Erro ao excluir o item:", error);
        setFeedback({ open: true, message: "Erro ao excluir o item." });
      }
    }
  };

  const handleSaveItem = async (item) => {
    try {
      if (currentItem) {
        // Atualiza o item existente
        await atualizarItem(currentItem.id, item);
        setFeedback({ open: true, message: "Item atualizado com sucesso!" });
      } else {
        // Adiciona um novo item
        await criarItem(item);
        setFeedback({ open: true, message: "Item adicionado com sucesso!" });
      }
      setIsEditing(false);
      fetchItems();
    } catch (error) {
      console.error("Erro ao salvar o item:", error);
      setFeedback({ open: true, message: "Erro ao salvar o item." });
    }
  };

  // Fecha o Snackbar de feedback
  const handleCloseFeedback = () => {
    setFeedback({ open: false, message: "" });
  };

  return (
    <InventoryPageView
      items={filteredItems}
      isLoading={loading}
      onAddItem={handleAddItem}
      onEditItem={handleEditItem}
      onDeleteItem={handleDeleteItem}
      onSaveItem={handleSaveItem}
      sortItems={sortItems}
      sortConfig={sortConfig}
      filter={filter}
      onFilterChange={handleFilterChange}
      feedback={feedback}
      onCloseFeedback={handleCloseFeedback}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      currentItem={currentItem}
    />
  );
};

export default InventoryPageContainer;
