// Navbar.js
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ListIcon from "@mui/icons-material/List";
import WarehouseIcon from "@mui/icons-material/Warehouse"; // Ícone para o estoque
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#2c552d" }}>
      <Toolbar>
        {/* Título da navbar */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: "bold" }}
        >
          Gestão de Locações
        </Typography>

        {/* Botões de navegação */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            component={Link}
            to="/" // Link para a página inicial
            sx={{ textTransform: "uppercase" }}
          >
            Início
          </Button>
          <Button
            color="inherit"
            startIcon={<AddCircleIcon />}
            component={Link}
            to="/register" // Link para registrar locação
            sx={{ textTransform: "uppercase" }}
          >
            Registrar Locação
          </Button>
          <Button
            color="inherit"
            startIcon={<ListIcon />}
            component={Link}
            to="/orders" // Link para visualizar pedidos
            sx={{ textTransform: "uppercase" }}
          >
            Visualizar Pedidos
          </Button>
          <Button
            color="inherit"
            startIcon={<WarehouseIcon />}
            component={Link}
            to="/inventory" // Link para a página de controle de estoque
            sx={{ textTransform: "uppercase" }}
          >
            Estoque
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
