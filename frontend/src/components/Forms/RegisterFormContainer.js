import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import RegisterFormView from "./RegisterFormView";

const RegisterFormContainer = () => {
  const [clientes, setClientes] = useState([]);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState({});
  const [categorias, setCategorias] = useState({});
  const [isFetched, setIsFetched] = useState(false);
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

  // Estados para prorrogação
  const [diasAdicionais, setDiasAdicionais] = useState(0);
  const [novoValorTotal, setNovoValorTotal] = useState(0);
  const [abatimento, setAbatimento] = useState(0);

  // Função para carregar clientes
  const fetchClientes = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  }, []);

  // Função para carregar o inventário e configurar categorias dinamicamente
  const fetchInventario = useCallback(async () => {
    if (isFetched) return;
    setIsFetched(true);

    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/inventario/disponiveis"
      );
      if (response.data) {
        console.log("Dados de inventário recebidos do backend:", response.data);

        const estoqueMap = response.data.reduce((acc, item) => {
          acc[item.nome_item] = item.quantidade_disponivel || 0;
          return acc;
        }, {});
        setEstoqueDisponivel(estoqueMap);

        const categoriasMap = response.data.reduce((acc, item) => {
          if (!acc[item.tipo_item]) {
            acc[item.tipo_item] = [];
          }
          acc[item.tipo_item].push(item.nome_item);
          return acc;
        }, {});
        setCategorias(categoriasMap);
      }
    } catch (error) {
      console.error("Erro ao buscar inventário:", error);
    }
  }, [isFetched]);

  useEffect(() => {
    fetchClientes();
    fetchInventario();
  }, [fetchClientes, fetchInventario]);

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
      fim.setDate(inicio.getDate() + parseInt(diasCombinados, 10) - 1);
      setNovaLocacao((prev) => ({
        ...prev,
        data_fim: fim.toISOString().split("T")[0],
      }));
    }
  };

  const handleDiasCombinadosChange = (e) => {
    const dias = parseInt(e.target.value, 10) || 0;
    setNovaLocacao((prev) => ({
      ...prev,
      dias_combinados: dias,
    }));
    updateDataFim(novaLocacao.data_inicio, dias);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!novaLocacao.data_inicio || !novaLocacao.cliente_info.nome) {
      alert("Preencha a data de início e as informações do cliente.");
      return;
    }

    if (novaLocacao.itens.length === 0) {
      alert("Adicione ao menos um item ao inventário.");
      return;
    }

    const itensInvalidos = novaLocacao.itens.some(
      (item) => !item.modelo || item.quantidade <= 0
    );

    if (itensInvalidos) {
      alert(
        "Certifique-se de que todos os itens possuem um modelo e quantidade válidos."
      );
      return;
    }

    const locacaoData = {
      ...novaLocacao,
      dias_combinados: parseInt(novaLocacao.dias_combinados, 10),
      valor_total: parseFloat(novaLocacao.valor_total),
      valor_pago_entrega: parseFloat(novaLocacao.valor_pago_entrega),
      valor_receber_final: parseFloat(novaLocacao.valor_receber_final),
      itens: novaLocacao.itens.map((item) => ({
        modelo: item.modelo,
        quantidade: parseInt(item.quantidade, 10),
        unidade: item.unidade || "peças",
      })),
    };

    console.log("Enviando dados de locação:", locacaoData);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/locacoes",
        locacaoData
      );
      if (response.status === 201) {
        alert("Locação registrada com sucesso!");

        setIsFetched(false);
        await fetchInventario();

        setNovaLocacao({
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
      }
    } catch (error) {
      console.error("Erro ao registrar locação:", error.response || error);
      if (error.response && error.response.data) {
        alert(`Erro ao registrar locação: ${error.response.data.error}`);
      } else {
        alert("Erro ao registrar locação");
      }
    }
  };

  // Função para prorrogar a locação
  const extendRental = async (locacaoId) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/locacoes/${locacaoId}/prorrogar`, // Garantido "prorrogar"
        {
          dias_adicionais: diasAdicionais,
          novo_valor_total: novoValorTotal,
          abatimento,
        }
      );
      if (response.status === 200) {
        alert("Locação prorrogada com sucesso!");
        setIsFetched(false);
        await fetchInventario();
      }
    } catch (error) {
      console.error("Erro ao prorrogar locação:", error.response || error);
      if (error.response && error.response.data) {
        alert(`Erro ao prorrogar locação: ${error.response.data.error}`);
      } else {
        alert("Erro ao prorrogar locação");
      }
    }
  };

  const addItem = (category, modelo, quantidade, unidade = "peças") => {
    if (!category || !modelo || !categorias[category]?.includes(modelo)) {
      alert("Selecione uma categoria e um modelo válidos.");
      return;
    }

    const quantidadeEstoque = estoqueDisponivel[modelo] || 0;
    if (quantidade > 0 && quantidade <= quantidadeEstoque) {
      setNovaLocacao((prev) => ({
        ...prev,
        itens: [
          ...prev.itens.filter((item) => item.modelo !== modelo),
          { modelo, quantidade, unidade },
        ],
      }));
      console.log("Item adicionado:", { modelo, quantidade, unidade });
    } else if (quantidade > quantidadeEstoque) {
      alert(
        `Quantidade solicitada para ${modelo} excede o estoque disponível (${quantidadeEstoque} unidades).`
      );
    } else {
      alert("Informe uma quantidade válida.");
    }
  };

  return (
    <RegisterFormView
      novaLocacao={novaLocacao}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      addItem={addItem}
      CATEGORIES={categorias}
      estoqueDisponivel={estoqueDisponivel}
      handleDiasCombinadosChange={handleDiasCombinadosChange}
      diasAdicionais={diasAdicionais}
      setDiasAdicionais={setDiasAdicionais}
      novoValorTotal={novoValorTotal}
      setNovoValorTotal={setNovoValorTotal}
      abatimento={abatimento}
      setAbatimento={setAbatimento}
      handleExtendRental={extendRental}
    />
  );
};

export default RegisterFormContainer;
