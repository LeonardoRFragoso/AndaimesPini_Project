import React, { createContext, useState, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Criação do contexto de tema
const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

// Hook personalizado para usar o contexto de tema
export const useThemeMode = () => useContext(ThemeContext);

// Provedor do contexto de tema
export const ThemeProvider = ({ children }) => {
  // Verificar se há uma preferência salva no localStorage
  const savedMode = localStorage.getItem('themeMode') || 'light';
  const [mode, setMode] = useState(savedMode);

  // Função para alternar entre os temas
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Definição das cores para os temas claro e escuro
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        ...(mode === 'light'
          ? {
              // Tema claro
              primary: {
                main: '#2c552d',
                light: '#45a049',
                dark: '#1e3b1f',
                contrastText: '#ffffff',
              },
              secondary: {
                main: '#607d8b',
                light: '#8eacbb',
                dark: '#34515e',
                contrastText: '#ffffff',
              },
              background: {
                default: '#f8f9fa',
                paper: '#ffffff',
              },
              text: {
                primary: '#333333',
                secondary: '#666666',
              },
            }
          : {
              // Tema escuro
              primary: {
                main: '#4caf50',
                light: '#80e27e',
                dark: '#087f23',
                contrastText: '#ffffff',
              },
              secondary: {
                main: '#78909c',
                light: '#a7c0cd',
                dark: '#4b636e',
                contrastText: '#ffffff',
              },
              background: {
                default: '#121212',
                paper: '#1e1e1e',
              },
              text: {
                primary: '#ffffff',
                secondary: '#b0bec5',
              },
              divider: 'rgba(255, 255, 255, 0.12)',
              success: {
                main: '#4caf50',
                light: '#81c784',
                dark: '#388e3c',
                contrastText: '#ffffff',
              },
              error: {
                main: '#f44336',
                light: '#e57373',
                dark: '#d32f2f',
                contrastText: '#ffffff',
              },
            }),
      },
      typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 700,
        },
        h2: {
          fontWeight: 700,
        },
        h3: {
          fontWeight: 600,
        },
        h4: {
          fontWeight: 600,
        },
        h5: {
          fontWeight: 500,
        },
        h6: {
          fontWeight: 500,
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: mode === 'light' 
                ? '0 8px 40px -12px rgba(0,0,0,0.1)'
                : '0 8px 40px -12px rgba(0,0,0,0.5)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              textTransform: 'none',
              fontWeight: 500,
            },
            containedPrimary: {
              boxShadow: mode === 'light'
                ? '0 8px 16px -4px rgba(44, 85, 45, 0.2)'
                : '0 8px 16px -4px rgba(76, 175, 80, 0.4)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
      },
    });
  }, [mode]);

  // Valor do contexto
  const contextValue = {
    mode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
