// src/components/Forms/RegisterFormView.js
import React from "react";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from "@mui/material";

const RegisterFormView = ({
  novaLocacao,
  handleChange,
  handleSubmit,
  addItem,
  CATEGORIES,
  handleDiasCombinadosChange,
}) => {
  const renderCategoryFields = (category) => (
    <Grid item xs={12} sm={6} md={4} key={category}>
      <Card variant="outlined" style={{ marginBottom: 16 }}>
        <CardContent>
          <Typography variant="h6">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Selecione o modelo de {category}</InputLabel>
            <Select
              onChange={(e) => addItem(category, 0, e.target.value)}
              defaultValue=""
            >
              {(CATEGORIES[category] || []).map((modelo, index) => (
                <MenuItem key={index} value={modelo}>
                  {modelo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Quantidade"
            type="number"
            onChange={(e) =>
              addItem(category, parseInt(e.target.value) || 0, "peças")
            }
            style={{ marginTop: 16 }}
          />
          {category === "andaimes" && (
            <FormControl fullWidth style={{ marginTop: 16 }}>
              <InputLabel>Unidade</InputLabel>
              <Select
                onChange={(e) => addItem(category, 1, e.target.value)}
                defaultValue="peças"
              >
                <MenuItem value="peças">Peças</MenuItem>
                <MenuItem value="metros">Metros</MenuItem>
              </Select>
            </FormControl>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Paper elevation={3} className="register-form">
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" align="center" gutterBottom>
          Registrar nova locação
        </Typography>

        <Grid container spacing={2}>
          {/* Campos de Nota e Cliente */}
          <Grid item xs={12}>
            <TextField
              label="Número da Nota"
              name="numero_nota"
              value={novaLocacao?.numero_nota || ""}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Dados do Responsável
            </Typography>
            {[
              { label: "Nome", name: "nome" },
              { label: "Endereço", name: "endereco" },
              { label: "Referência", name: "referencia" },
              { label: "Referência Rápida", name: "referencia_rapida" },
              { label: "Telefone", name: "telefone" },
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                <TextField
                  label={field.label}
                  name={`cliente_info.${field.name}`}
                  value={novaLocacao?.cliente_info?.[field.name] || ""}
                  onChange={handleChange}
                  fullWidth
                  required={
                    field.name !== "referencia" &&
                    field.name !== "referencia_rapida"
                  }
                />
              </Grid>
            ))}
          </Grid>

          {/* Detalhes da Locação */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Detalhes da Locação
            </Typography>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Início"
                type="date"
                name="data_inicio"
                value={novaLocacao?.data_inicio || ""}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantidade de Dias Combinados"
                type="number"
                name="dias_combinados"
                value={novaLocacao?.dias_combinados || ""}
                onChange={handleDiasCombinadosChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Fim"
                type="date"
                name="data_fim"
                value={novaLocacao?.data_fim || ""}
                InputProps={{ readOnly: true }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>

          {/* Valores da Locação */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Valores da Locação
            </Typography>
            {[
              { label: "Valor Total", name: "valor_total" },
              { label: "Valor Pago na Entrega", name: "valor_pago_entrega" },
              {
                label: "Valor a Receber no Final",
                name: "valor_receber_final",
              },
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                <TextField
                  label={field.label}
                  type="number"
                  name={field.name}
                  value={novaLocacao?.[field.name] || ""}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            ))}
          </Grid>

          {/* Itens do Inventário */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Itens do Inventário
            </Typography>
            <Grid container spacing={2}>
              {Object.keys(CATEGORIES || {}).map((category) =>
                renderCategoryFields(category)
              )}
            </Grid>
          </Grid>

          {/* Botão de Submit */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Registrar Locação
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default RegisterFormView;
