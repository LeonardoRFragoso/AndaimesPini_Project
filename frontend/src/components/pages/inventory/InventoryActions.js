// frontend/src/components/pages/inventory/InventoryActions.js
import React from "react";
import { Box, Button, useTheme } from "@mui/material";
import { Add } from "@mui/icons-material";

const InventoryActions = ({ onAddItem }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAddItem}
        size="large"
        sx={{
          background: 'linear-gradient(135deg, #2c552d 0%, #4caf50 100%)',
          color: 'white',
          fontWeight: 600,
          fontSize: '1.1rem',
          padding: '12px 32px',
          borderRadius: '25px',
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          "&:hover": { 
            background: 'linear-gradient(135deg, #1b3a1c 0%, #388e3c 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        Adicionar Item
      </Button>
    </Box>
  );
};

export default InventoryActions;
