import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

const ClientsForm = ({ onSave }) => {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [referencia, setReferencia] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validação simples
    if (!nome || !telefone) {
      alert("Nome e telefone são obrigatórios!");
      return;
    }

    const novoCliente = { nome, endereco, telefone, referencia };

    // Chamada para adicionar cliente via API
    const response = await fetch("/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novoCliente),
    });

    if (response.ok) {
      onSave(); // Atualiza a lista de clientes
      setNome("");
      setEndereco("");
      setTelefone("");
      setReferencia("");
    } else {
      alert("Erro ao adicionar cliente");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">Adicionar Cliente</Typography>
      <TextField
        label="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <TextField
        label="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
      />
      <TextField
        label="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        required
      />
      <TextField
        label="Referência"
        value={referencia}
        onChange={(e) => setReferencia(e.target.value)}
      />
      <Button type="submit">Salvar</Button>
    </Box>
  );
};

export default ClientsForm;
