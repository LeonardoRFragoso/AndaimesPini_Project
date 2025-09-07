import React, { useState, useEffect, useCallback } from "react";
import RegisterFormView from "./RegisterFormView";
import { listarClientes } from "../../api/clientes";
import { listarItens } from "../../api/inventario";
import { criarLocacao } from "../../api/locacoes";

const RegisterFormContainer = () => {
  const [clientes, setClientes] = useState([]);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState({});
  const [categorias, setCategorias] = useState({});
  const [isFetched, setIsFetched] = useState(false);
  const [novaLocacao, setNovaLocacao] = useState({
    numero_nota: "",
    nome_cliente: "",
    endereco_cliente: "",
    telefone_cliente: "",
    data_inicio: "",
    dias_combinados: 1,
    data_fim: "",
    valor_total: 0,
    valor_pago_entrega: 0,
    valor_receber_final: 0,
    status: "ativo",
    itens: [],
  });

  // Função para buscar clientes
  const fetchClientes = useCallback(async () => {
    try {
      const data = await listarClientes();
      setClientes(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      alert("Erro ao buscar clientes. Tente novamente mais tarde.");
    }
  }, []);

  // Função para buscar inventário disponível
  const fetchInventario = useCallback(async () => {
    if (isFetched) return;
    setIsFetched(true);

    try {
      const data = await listarItens(true); // true para buscar apenas itens disponíveis
      if (data) {
        const estoqueMap = data.reduce((acc, item) => {
          acc[item.nome_item] = item.quantidade_disponivel || 0;
          return acc;
        }, {});
        setEstoqueDisponivel(estoqueMap);

        const categoriasMap = data.reduce((acc, item) => {
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
      alert("Erro ao buscar inventário. Tente novamente mais tarde.");
    }
  }, [isFetched]);

  // Hooks para buscar dados ao montar o componente
  useEffect(() => {
    fetchClientes();
    fetchInventario();
  }, [fetchClientes, fetchInventario]);

  // Hook para atualizar o valor_receber_final automaticamente
  useEffect(() => {
    setNovaLocacao((prev) => ({
      ...prev,
      valor_receber_final: parseFloat(
        (
          parseFloat(prev.valor_total || 0) -
          parseFloat(prev.valor_pago_entrega || 0)
        ).toFixed(2)
      ),
    }));
  }, [novaLocacao.valor_total, novaLocacao.valor_pago_entrega]);

  // Método handleChange para tratar campos planos
  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = [
      "valor_total",
      "valor_pago_entrega",
      "dias_combinados",
    ];
    setNovaLocacao((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
    }));
  };

  // Método para atualizar a data de fim com base nos dias combinados
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

  // Método para lidar com a mudança nos dias combinados
  const handleDiasCombinadosChange = (e) => {
    const dias = parseInt(e.target.value, 10) || 0;
    setNovaLocacao((prev) => ({
      ...prev,
      dias_combinados: dias,
    }));
    updateDataFim(novaLocacao.data_inicio, dias);
  };

  // Função de validação dos dados da locação
  const validarLocacaoData = () => {
    const {
      data_inicio,
      data_fim,
      valor_total,
      valor_pago_entrega,
      valor_receber_final,
      nome_cliente,
      endereco_cliente,
      telefone_cliente,
    } = novaLocacao;

    if (!data_inicio) {
      return "A data de início é obrigatória.";
    }

    if (!data_fim) {
      return "A data de fim é obrigatória.";
    }

    if (new Date(data_inicio) >= new Date(data_fim)) {
      return "A data de início deve ser anterior à data de fim.";
    }

    const valorTotal = parseFloat(valor_total || 0);
    const valorPagoEntrega = parseFloat(valor_pago_entrega || 0);
    const valorReceberFinal = parseFloat(valor_receber_final || 0);

    if (valorTotal < 0 || valorPagoEntrega < 0 || valorReceberFinal < 0) {
      return "Os valores financeiros não podem ser negativos.";
    }

    if (valorPagoEntrega > valorTotal) {
      return "O valor pago na entrega não pode exceder o valor total.";
    }

    if (!nome_cliente.trim()) {
      return "O nome do cliente é obrigatório.";
    }

    if (!endereco_cliente.trim()) {
      return "O endereço do cliente é obrigatório.";
    }

    if (!telefone_cliente.trim()) {
      return "O telefone do cliente é obrigatório.";
    }

    return null;
  };

  // Método handleSubmit ajustado para incluir os campos do cliente
  const handleSubmit = async (e) => {
    e.preventDefault();

    const erroValidacao = validarLocacaoData();
    if (erroValidacao) {
      alert(erroValidacao);
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
      numero_nota: novaLocacao.numero_nota,
      nome_cliente: novaLocacao.nome_cliente,
      endereco_cliente: novaLocacao.endereco_cliente,
      telefone_cliente: novaLocacao.telefone_cliente,
      data_inicio: novaLocacao.data_inicio,
      dias_combinados: parseInt(novaLocacao.dias_combinados, 10),
      data_fim: novaLocacao.data_fim,
      valor_total: parseFloat(novaLocacao.valor_total),
      valor_pago_entrega: parseFloat(novaLocacao.valor_pago_entrega),
      valor_receber_final: parseFloat(novaLocacao.valor_receber_final),
      status: novaLocacao.status,
      itens: novaLocacao.itens.map((item) => ({
        modelo: item.modelo,
        quantidade: parseInt(item.quantidade, 10),
        unidade: item.unidade || "peças",
      })),
    };

    try {
      const response = await criarLocacao(locacaoData);
      if (response) {
        alert("Locação registrada com sucesso!");

        setIsFetched(false);
        await fetchInventario();

        setNovaLocacao({
          numero_nota: "",
          nome_cliente: "",
          endereco_cliente: "",
          telefone_cliente: "",
          data_inicio: "",
          dias_combinados: 1,
          data_fim: "",
          valor_total: 0,
          valor_pago_entrega: 0,
          valor_receber_final: 0,
          status: "ativo",
          itens: [],
        });
      }
    } catch (error) {
      console.error("Erro ao registrar locação:", error.response || error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Erro ao registrar locação: ${error.response.data.error}`);
      } else {
        alert("Erro ao registrar locação. Tente novamente mais tarde.");
      }
    }
  };

  // Método para adicionar itens à locação
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
      clientes={clientes}
    />
  );
};

export default RegisterFormContainer;
