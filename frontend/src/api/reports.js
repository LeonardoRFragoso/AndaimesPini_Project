import api from './config';

// Endpoint base para relatórios

// Função para obter dados de visão geral com filtros de data opcionais
export const fetchOverviewReport = async ({ startDate, endDate } = {}) => {
  try {
    const response = await api.get(`/reports/overview`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de visão geral:", error);
    throw new Error("Erro ao buscar dados de visão geral. Tente novamente.");
  }
};

// Função para obter dados de relatório por cliente com filtros de data opcionais
export const fetchClientReport = async (
  clientId,
  { startDate, endDate } = {}
) => {
  try {
    const response = await api.get(`/reports/client/${clientId}`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar relatório do cliente ${clientId}:`, error);
    throw new Error("Erro ao buscar relatório do cliente. Tente novamente.");
  }
};

// Função para obter dados de relatório por item com filtros de data opcionais
export const fetchItemReport = async (itemId, { startDate, endDate } = {}) => {
  try {
    const response = await api.get(`/reports/inventory/${itemId}`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar relatório do item ${itemId}:`, error);
    throw new Error("Erro ao buscar relatório do item. Tente novamente.");
  }
};

// Função para obter dados de relatório por status com filtros de data opcionais
export const fetchStatusReport = async ({ startDate, endDate } = {}) => {
  try {
    const response = await api.get(`/reports/status`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar relatório por status:", error);
    throw new Error("Erro ao buscar relatório por status. Tente novamente.");
  }
};

// Função para buscar clientes com base no termo de pesquisa
export const fetchClients = async (searchTerm) => {
  try {
    const response = await api.get(`/reports/clients`, {
      params: { search: searchTerm },
    });
    return response.data; // Supondo que a resposta seja uma lista de clientes
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return []; // Retorna uma lista vazia em caso de erro
  }
};

// Função para buscar itens com base no termo de pesquisa
export const fetchItems = async (searchTerm) => {
  try {
    const response = await api.get(`/reports/items`, {
      params: { search: searchTerm },
    });
    return response.data; // Supondo que a resposta seja uma lista de itens
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    return []; // Retorna uma lista vazia em caso de erro
  }
};

// Função para exportar relatório de status como gráfico (imagem PNG)
export const downloadStatusChart = async () => {
  try {
    const response = await api.get(`/reports/status`, {
      params: { export_format: "chart" },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "image/png" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "status_report.png");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erro ao baixar gráfico de status:", error);
    throw new Error("Erro ao baixar gráfico de status. Tente novamente.");
  }
};

// Função para exportar relatório de status como arquivo Excel
export const downloadStatusExcel = async () => {
  try {
    const response = await api.get(`/reports/status`, {
      params: { export_format: "excel" },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "status_report.xlsx");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erro ao baixar o relatório de status em Excel:", error);
    throw new Error(
      "Erro ao baixar o relatório de status em Excel. Tente novamente."
    );
  }
};

// Função para download do relatório em CSV
export const downloadReportCSV = async (reportData, filename = "relatorio") => {
  try {
    const response = await api.post(
      `/reports/download`,
      { report_data: reportData },
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao baixar o relatório em CSV:", error);
    throw new Error("Erro ao baixar o relatório em CSV. Tente novamente.");
  }
};
