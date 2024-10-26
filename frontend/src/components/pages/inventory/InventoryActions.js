// frontend/src/components/pages/inventory/InventoryActions.js
import React from "react";
import { Box, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { Link } from "react-router-dom";

const InventoryActions = () => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        component={Link}
        to="/inventory/add"
        sx={{
          backgroundColor: "#2c552d",
          "&:hover": { backgroundColor: "#45a049" },
        }}
      >
        Adicionar Item
      </Button>
    </Box>
  );
};

export default InventoryActions;
