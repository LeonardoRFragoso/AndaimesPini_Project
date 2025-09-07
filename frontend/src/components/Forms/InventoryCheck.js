import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Autocomplete
} from '@mui/material';
import { listarItens } from '../../api/inventario';

const InventoryCheck = ({ onItemSelect }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await listarItens(true); // Apenas itens disponíveis
        setInventory(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar inventário:', error);
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);

  const handleAddItem = () => {
    if (!selectedItem || quantity <= 0 || quantity > selectedItem.quantidade_disponivel) return;
    
    const newItem = {
      ...selectedItem,
      quantidade_solicitada: quantity
    };
    
    setSelectedItems([...selectedItems, newItem]);
    setSelectedItem(null);
    setQuantity(1);
    
    if (onItemSelect) {
      onItemSelect([...selectedItems, newItem]);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
    
    if (onItemSelect) {
      onItemSelect(updatedItems);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Verificação de Disponibilidade
      </Typography>
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Autocomplete
          options={inventory}
          getOptionLabel={(option) => `${option.nome_item} (${option.quantidade_disponivel} disponíveis)`}
          value={selectedItem}
          onChange={(event, newValue) => setSelectedItem(newValue)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Selecione um item" 
              variant="outlined" 
              fullWidth 
            />
          )}
          sx={{ flexGrow: 1, mr: 2 }}
        />
        
        <TextField
          label="Quantidade"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          inputProps={{ min: 1, max: selectedItem?.quantidade_disponivel || 1 }}
          sx={{ width: 120, mr: 2 }}
        />
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleAddItem}
          disabled={!selectedItem || quantity <= 0 || quantity > selectedItem.quantidade_disponivel}
        >
          Adicionar
        </Button>
      </Box>
      
      {selectedItems.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="center">Disponível</TableCell>
                <TableCell align="center">Quantidade</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.nome_item}</TableCell>
                  <TableCell>{item.tipo_item}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${item.quantidade_disponivel} unid.`}
                      color={item.quantidade_disponivel < 10 ? "warning" : "success"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{item.quantidade_solicitada}</TableCell>
                  <TableCell align="center">
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InventoryCheck;
