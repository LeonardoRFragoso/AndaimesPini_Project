import React, { useState, useEffect } from "react";
import axios from "axios";
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

const RegisterForm = () => {
  const [clientes, setClientes] = useState([]);
  const [itensInventario, setItensInventario] = useState([]);
  const [novaLocacao, setNovaLocacao] = useState({
    numero_nota: "",
    cliente_info: {
      nome: "",
      endereco: "",
      referencia: "",
      referencia_rapida: "",
      telefone: "",
    },
    data_inicio: "",
    dias_combinados: 1,
    data_fim: "",
    valor_total: 0,
    valor_pago_entrega: 0,
    valor_receber_final: 0,
    itens: [],
  });

  const CATEGORIES = {
    andaimes: ["1,0m", "1,5m"],
    escoras: ["2,8m", "3,0m", "3,2m", "3,5m", "3,8m", "4,0m"],
    forcados: ["Forcado pequeno", "Forcado médio", "Forcado grande"],
    pranchões: ["Madeira 1,2m", "Madeira 1,7m", "Ferro 1,5m"],
    sapatas: ["Sapata regulável", "Sapata fixa"],
    rodizios: ["Rodízio simples", "Rodízio com trava"],
    madeira: ["Madeira pequena", "Madeira média", "Madeira grande"],
    ferros: ["Ferro 2,0m", "Ferro 3,0m"],
  };

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/clientes");
        setClientes(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    const fetchInventario = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/inventario");
        setItensInventario(response.data);
      } catch (error) {
        console.error("Erro ao buscar inventário:", error);
      }
    };

    fetchClientes();
    fetchInventario();
  }, []);

  const getItemIdByName = (itemName) => {
    const item = itensInventario.find((i) => i[1] === itemName);
    return item ? item[0] : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("cliente_info.")) {
      const key = name.split(".")[1];
      setNovaLocacao((prev) => ({
        ...prev,
        cliente_info: {
          ...prev.cliente_info,
          [key]: value,
        },
      }));
    } else {
      setNovaLocacao((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Atualizar data_fim automaticamente
    if (name === "data_inicio" || name === "dias_combinados") {
      updateDataFim(novaLocacao.data_inicio, novaLocacao.dias_combinados);
    }
  };

  const updateDataFim = (dataInicio, diasCombinados) => {
    if (dataInicio && diasCombinados >= 0) {
      const inicio = new Date(dataInicio);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + parseInt(diasCombinados) - 1); // Adiciona os dias e subtrai 1
      setNovaLocacao((prev) => ({
        ...prev,
        data_fim: fim.toISOString().split("T")[0], // Formato YYYY-MM-DD
      }));
    }
  };

  const handleDiasCombinadosChange = (e) => {
    const dias = parseInt(e.target.value) || 0; // Captura o valor
    setNovaLocacao((prev) => ({
      ...prev,
      dias_combinados: dias,
    }));
    updateDataFim(novaLocacao.data_inicio, dias); // Atualiza a data final ao mudar a quantidade de dias
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (novaLocacao.itens.length === 0) {
      alert("Adicione ao menos um item ao inventário.");
      return;
    }

    const locacaoData = {
      ...novaLocacao,
      dias_combinados: parseInt(novaLocacao.dias_combinados),
      valor_total: parseFloat(novaLocacao.valor_total),
      valor_pago_entrega: parseFloat(novaLocacao.valor_pago_entrega),
      valor_receber_final: parseFloat(novaLocacao.valor_receber_final),
      itens: novaLocacao.itens.map((item) => ({
        modelo: item.modelo,
        quantidade: item.quantidade,
        unidade: item.unidade,
      })),
    };

    console.log("Dados enviados:", locacaoData);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/locacoes",
        locacaoData
      );
      if (response.status === 201) {
        alert("Locação registrada com sucesso!");
      } else {
        console.error("Erro no backend:", response.data);
        alert(`Erro ao registrar locação: ${response.data}`);
      }
    } catch (error) {
      console.error(
        "Erro ao registrar locação:",
        error.response ? error.response.data : error
      );
      alert("Erro ao registrar locação");
    }
  };

  const addItem = (itemName, quantidade, unidade = "peças") => {
    const itemId = getItemIdByName(itemName);
    if (itemId) {
      const updatedItems = novaLocacao.itens.filter(
        (item) => item.modelo !== itemName
      );
      if (quantidade > 0) {
        updatedItems.push({ modelo: itemName, quantidade, unidade });
      }
      setNovaLocacao((prev) => ({
        ...prev,
        itens: updatedItems,
      }));
    } else {
      console.error("Item não encontrado no inventário:", itemName);
    }
  };

  const renderCategoryFields = (category) => {
    return (
      <Grid item xs={12} sm={6} md={4} key={category}>
        <Card variant="outlined" style={{ marginBottom: 16 }}>
          <CardContent>
            <Typography variant="h6">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Selecione o modelo de {category}</InputLabel>
              <Select
                onChange={(e) => addItem(e.target.value, 1, "peças")}
                defaultValue=""
              >
                {CATEGORIES[category].map((modelo, index) => (
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
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Paper elevation={3} className="register-form">
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" align="center" gutterBottom>
          Registrar nova locação
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Número da Nota"
              name="numero_nota"
              value={novaLocacao.numero_nota}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Dados do Responsável
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome"
              name="cliente_info.nome"
              value={novaLocacao.cliente_info.nome}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Endereço"
              name="cliente_info.endereco"
              value={novaLocacao.cliente_info.endereco}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Referência"
              name="cliente_info.referencia"
              value={novaLocacao.cliente_info.referencia}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Referência Rápida"
              name="cliente_info.referencia_rapida"
              value={novaLocacao.cliente_info.referencia_rapida}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Telefone"
              name="cliente_info.telefone"
              value={novaLocacao.cliente_info.telefone}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Detalhes da Locação
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data de Início"
              type="date"
              name="data_inicio"
              value={novaLocacao.data_inicio}
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
              value={novaLocacao.dias_combinados}
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
              value={novaLocacao.data_fim}
              InputProps={{ readOnly: true }} // Define o campo como somente leitura
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Valores da Locação
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Valor Total"
              type="number"
              name="valor_total"
              value={novaLocacao.valor_total}
              onChange={(e) => {
                const total = parseFloat(e.target.value) || 0;
                setNovaLocacao((prev) => ({
                  ...prev,
                  valor_total: total,
                  valor_receber_final: total - prev.valor_pago_entrega, // Atualiza o valor a receber
                }));
              }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Valor Pago na Entrega"
              type="number"
              name="valor_pago_entrega"
              value={novaLocacao.valor_pago_entrega}
              onChange={(e) => {
                const pago = parseFloat(e.target.value) || 0;
                setNovaLocacao((prev) => ({
                  ...prev,
                  valor_pago_entrega: pago,
                  valor_receber_final: prev.valor_total - pago, // Atualiza o valor a receber
                }));
              }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Valor a Receber no Final"
              type="number"
              name="valor_receber_final"
              value={novaLocacao.valor_receber_final}
              onChange={(e) =>
                setNovaLocacao((prev) => ({
                  ...prev,
                  valor_receber_final: parseFloat(e.target.value) || 0, // Permite edição
                }))
              }
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Itens do Inventário
            </Typography>
          </Grid>
          {Object.keys(CATEGORIES).map((category) =>
            renderCategoryFields(category)
          )}

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

export default RegisterForm;
