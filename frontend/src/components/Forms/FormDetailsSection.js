// frontend/src/components/Forms/FormDetailsSection.js

import React from "react";
import { Grid, TextField, Typography } from "@mui/material";

const FormDetailsSection = ({
  novaLocacao,
  handleChange,
  handleDiasCombinadosChange,
}) => (
  <>
    {/* Campo Número da Nota */}
    <Typography variant="h5" gutterBottom>
      Registrar nova locação
    </Typography>
    <Grid item xs={12}>
      <TextField
        label="Número da Nota"
        name="numero_nota"
        value={novaLocacao?.numero_nota || ""}
        onChange={handleChange}
        fullWidth
        required
        variant="outlined"
        style={{ marginBottom: "1rem" }}
      />
    </Grid>

    {/* Dados do Responsável */}
    <Typography variant="h5" gutterBottom>
      Dados do Responsável
    </Typography>
    <Grid container spacing={2}>
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
              field.name !== "referencia" && field.name !== "referencia_rapida"
            }
          />
        </Grid>
      ))}
    </Grid>

    {/* Detalhes da Locação */}
    <Typography variant="h5" gutterBottom style={{ marginTop: "1rem" }}>
      Detalhes da Locação
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
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
      <Grid item xs={12} sm={4}>
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
      <Grid item xs={12} sm={4}>
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
    <Typography variant="h5" gutterBottom style={{ marginTop: "1rem" }}>
      Valores da Locação
    </Typography>
    <Grid container spacing={2}>
      {[
        { label: "Valor Total", name: "valor_total" },
        { label: "Valor Pago na Entrega", name: "valor_pago_entrega" },
        { label: "Valor a Receber no Final", name: "valor_receber_final" },
      ].map((field) => (
        <Grid item xs={12} sm={4} key={field.name}>
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
  </>
);

export default FormDetailsSection;
