// src/api/config.js
// Configuração centralizada para todas as chamadas de API

// URL base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Timeout padrão para requisições (em milissegundos)
const DEFAULT_TIMEOUT = 10000;

// Função para obter o token de autenticação do localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Função para configurar os headers padrão para requisições autenticadas
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Função para fazer requisições à API
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Configurações padrão
  const defaultOptions = {
    headers: getAuthHeaders(),
    timeout: DEFAULT_TIMEOUT,
  };
  
  // Mesclar opções padrão com as opções fornecidas
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Verificar se a resposta é um JSON válido
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      // Se for um erro de autenticação, redirecionar para login
      if (response.status === 401) {
        // Limpar token e redirecionar para login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Lançar erro com detalhes da resposta
      throw {
        status: response.status,
        statusText: response.statusText,
        data,
      };
    }
    
    return data;
  } catch (error) {
    // Tratar erros de rede ou timeout
    if (!error.status) {
      console.error('Erro de rede:', error);
      throw {
        status: 0,
        statusText: 'Erro de conexão',
        data: { error: 'Não foi possível conectar ao servidor. Verifique sua conexão.' },
      };
    }
    
    // Repassar erros da API
    throw error;
  }
};

// Métodos HTTP comuns
const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data),
    ...options 
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data),
    ...options 
  }),
  patch: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    method: 'PATCH', 
    body: JSON.stringify(data),
    ...options 
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { method: 'DELETE', ...options }),
};

export default api;
