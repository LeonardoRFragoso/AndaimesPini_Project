// Utilitário para formatar datas
export const formatDate = (date) =>
  date && !isNaN(new Date(date)) ? new Date(date).toLocaleDateString() : "N/A";

// Utilitário para formatar valores monetários
export const formatCurrency = (value) =>
  `R$ ${(value !== undefined && value !== null ? value : 0).toFixed(2)}`;
