// src/components/Forms/RegisterFormContainer.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import RegisterFormView from "./RegisterFormView";

const RegisterFormContainer = () => {
  const [clientes, setClientes] = useState([]);
  const [itensInventario, setItensInventario] = useState([]);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState({});
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
        if (response.data) {
          setItensInventario(response.data);
          const estoqueMap = {};
          response.data.forEach((item) => {
            estoqueMap[item.nome_item] = item.quantidade;
          });
          setEstoqueDisponivel(estoqueMap);
        }
      } catch (error) {
        console.error("Erro ao buscar inventário:", error);
      }
    };

    fetchClientes();
    fetchInventario();
  }, []);

  useEffect(() => {
    setNovaLocacao((prev) => ({
      ...prev,
      valor_receber_final: prev.valor_total - prev.valor_pago_entrega,
    }));
  }, [novaLocacao.valor_total, novaLocacao.valor_pago_entrega]);

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
  };

  const updateDataFim = (dataInicio, diasCombinados) => {
    if (dataInicio && diasCombinados >= 0) {
      const inicio = new Date(dataInicio);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + parseInt(diasCombinados) - 1);
      setNovaLocacao((prev) => ({
        ...prev,
        data_fim: fim.toISOString().split("T")[0],
      }));
    }
  };

  const handleDiasCombinadosChange = (e) => {
    const dias = parseInt(e.target.value) || 0;
    setNovaLocacao((prev) => ({
      ...prev,
      dias_combinados: dias,
    }));
    updateDataFim(novaLocacao.data_inicio, dias);
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
      }
    } catch (error) {
      console.error("Erro ao registrar locação:", error);
      alert("Erro ao registrar locação");
    }
  };

  const addItem = (category, quantidade, unidade = "peças") => {
    // Verifica se a categoria está definida e lista de modelos está disponível
    if (!CATEGORIES[category]) {
      alert("Categoria inválida.");
      return;
    }

    // Obtém o primeiro modelo da categoria selecionada para teste
    const modeloSelecionado =
      novaLocacao.itens.find((item) => item.modelo === category) ||
      CATEGORIES[category][0]; // Default para o primeiro modelo da categoria

    if (!modeloSelecionado) {
      alert("Selecione um modelo válido.");
      return;
    }

    // Verifica se a quantidade é válida
    if (quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    if (quantidade > (estoqueDisponivel[modeloSelecionado] || 0)) {
      alert(
        `Quantidade solicitada para ${modeloSelecionado} excede o estoque disponível.`
      );
      return;
    }

    // Atualiza o item selecionado com a quantidade e unidade correta
    const updatedItems = novaLocacao.itens.filter(
      (item) => item.modelo !== modeloSelecionado
    );

    updatedItems.push({
      modelo: modeloSelecionado,
      quantidade,
      unidade,
    });

    setNovaLocacao((prev) => ({
      ...prev,
      itens: updatedItems,
    }));

    console.log("Item adicionado:", {
      modelo: modeloSelecionado,
      quantidade,
      unidade,
    });
  };

  return (
    <RegisterFormView
      novaLocacao={novaLocacao}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      addItem={addItem}
      CATEGORIES={CATEGORIES}
      handleDiasCombinadosChange={handleDiasCombinadosChange}
    />
  );
};

export default RegisterFormContainer;
