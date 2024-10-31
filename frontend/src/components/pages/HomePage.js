// frontend/src/pages/HomePage.js

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import {
  AddCircle,
  Visibility,
  Inventory,
  Assessment,
  PersonAdd,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

const HomePage = () => {
  return (
    <PageLayout>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", color: "#2c552d", mb: 3 }}
      >
        Bem-vindo ao Sistema de Gestão de Locações
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* Card Template */}
        {[
          {
            title: "Registrar Locação",
            description:
              "Clique aqui para registrar uma nova locação de materiais.",
            icon: <AddCircle sx={{ fontSize: 50 }} />,
            link: "/register",
            buttonText: "Registrar",
          },
          {
            title: "Visualizar Pedidos",
            description:
              "Clique aqui para visualizar todos os pedidos realizados.",
            icon: <Visibility sx={{ fontSize: 50 }} />,
            link: "/orders",
            buttonText: "Visualizar",
          },
          {
            title: "Controle de Estoque",
            description: "Gerencie os itens disponíveis para locação.",
            icon: <Inventory sx={{ fontSize: 50 }} />,
            link: "/inventory",
            buttonText: "Acessar",
          },
          {
            title: "Relatórios",
            description: "Visualize relatórios detalhados sobre locações.",
            icon: <Assessment sx={{ fontSize: 50 }} />,
            link: "/reports",
            buttonText: "Visualizar",
          },
          {
            title: "Gerenciar Clientes",
            description: "Adicione, edite ou visualize os clientes.",
            icon: <PersonAdd sx={{ fontSize: 50 }} />,
            link: "/clients",
            buttonText: "Acessar",
          },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                textAlign: "center",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.07)",
                  boxShadow: "0px 8px 20px rgba(44, 85, 45, 0.3)",
                },
                borderRadius: 4,
                padding: 3,
                mx: "auto",
                maxWidth: 320,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    color: "#2c552d",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    backgroundColor: "#f5f5f5",
                    mb: 2,
                    transition: "background-color 0.3s, transform 0.3s",
                    "&:hover": {
                      backgroundColor: "#e0f2f1",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  variant="h5"
                  component="div"
                  gutterBottom
                  sx={{ fontWeight: "600", color: "#2c552d" }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: "0.9rem" }}
                >
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <Button
                  variant="contained"
                  component={Link}
                  to={item.link}
                  sx={{
                    background:
                      "linear-gradient(135deg, #2c552d 30%, #45a049 90%)",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    px: 4,
                    py: 1,
                    fontSize: "0.9rem",
                    transition:
                      "transform 0.3s ease, background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#45a049",
                      transform: "scale(1.05)",
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                  }}
                >
                  {item.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageLayout>
  );
};

export default HomePage;
