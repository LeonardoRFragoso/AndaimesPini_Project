// HomePage.js
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
        sx={{ fontWeight: "bold", color: "#2c552d", mb: 1 }}
      >
        Bem-vindo ao Sistema de Gestão de Locações
      </Typography>
      <Typography
        variant="body1"
        paragraph
        align="center"
        sx={{ fontSize: "1.1rem", color: "#555", mb: 4 }}
      >
        Selecione uma opção no menu para começar.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* Card para Registrar Locação */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              textAlign: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0px 8px 16px rgba(44, 85, 45, 0.3)",
              },
            }}
          >
            <CardContent>
              <AddCircle
                sx={{
                  fontSize: 50,
                  color: "#2c552d",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
              <Typography variant="h5" component="div" gutterBottom>
                Registrar Locação
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Clique aqui para registrar uma nova locação de materiais.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                sx={{
                  background:
                    "linear-gradient(135deg, #2c552d 30%, #45a049 90%)",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  px: 3,
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                Registrar
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card para Visualizar Pedidos */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              textAlign: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0px 8px 16px rgba(44, 85, 45, 0.3)",
              },
            }}
          >
            <CardContent>
              <Visibility
                sx={{
                  fontSize: 50,
                  color: "#2c552d",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
              <Typography variant="h5" component="div" gutterBottom>
                Visualizar Pedidos
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Clique aqui para visualizar todos os pedidos realizados.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                component={Link}
                to="/orders"
                sx={{
                  background:
                    "linear-gradient(135deg, #2c552d 30%, #45a049 90%)",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  px: 3,
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                Visualizar
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card para Controle de Estoque */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              textAlign: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0px 8px 16px rgba(44, 85, 45, 0.3)",
              },
            }}
          >
            <CardContent>
              <Inventory
                sx={{
                  fontSize: 50,
                  color: "#2c552d",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
              <Typography variant="h5" component="div" gutterBottom>
                Controle de Estoque
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Gerencie os itens disponíveis para locação.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                component={Link}
                to="/inventory"
                sx={{
                  background:
                    "linear-gradient(135deg, #2c552d 30%, #45a049 90%)",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  px: 3,
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                Acessar
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card para Relatórios */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              textAlign: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0px 8px 16px rgba(44, 85, 45, 0.3)",
              },
            }}
          >
            <CardContent>
              <Assessment
                sx={{
                  fontSize: 50,
                  color: "#2c552d",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
              <Typography variant="h5" component="div" gutterBottom>
                Relatórios
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Visualize relatórios detalhados sobre locações.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                component={Link}
                to="/reports"
                sx={{
                  background:
                    "linear-gradient(135deg, #2c552d 30%, #45a049 90%)",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  px: 3,
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                Visualizar
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card para Gerenciar Clientes */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              textAlign: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0px 8px 16px rgba(44, 85, 45, 0.3)",
              },
            }}
          >
            <CardContent>
              <PersonAdd
                sx={{
                  fontSize: 50,
                  color: "#2c552d",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
              <Typography variant="h5" component="div" gutterBottom>
                Gerenciar Clientes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Adicione, edite ou visualize os clientes.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                component={Link}
                to="/clients"
                sx={{
                  background:
                    "linear-gradient(135deg, #2c552d 30%, #45a049 90%)",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  px: 3,
                  "&:hover": { backgroundColor: "#45a049" },
                }}
              >
                Acessar
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default HomePage;
