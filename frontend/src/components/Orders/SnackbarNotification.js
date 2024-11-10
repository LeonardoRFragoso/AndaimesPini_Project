import React from "react";
import PropTypes from "prop-types";
import { Snackbar, IconButton } from "@mui/material";
import { CheckCircle, Error, Warning, Info, Close } from "@mui/icons-material";

const SnackbarNotification = ({
  open,
  message,
  type = "info", // Tipo padrão
  onClose,
  autoHideDuration = 5000,
}) => {
  // Define a cor de fundo com base no tipo de mensagem
  const backgroundColor =
    {
      success: "#4caf50", // Verde
      error: "#f44336", // Vermelho
      warning: "#ff9800", // Laranja
      info: "#2196f3", // Azul
    }[type] || "#333"; // Cor padrão (preto)

  // Define o ícone de acordo com o tipo de mensagem
  const icon = {
    success: <CheckCircle sx={{ color: "#fff", fontSize: "1.5rem" }} />,
    error: <Error sx={{ color: "#fff", fontSize: "1.5rem" }} />,
    warning: <Warning sx={{ color: "#fff", fontSize: "1.5rem" }} />,
    info: <Info sx={{ color: "#fff", fontSize: "1.5rem" }} />,
  }[type];

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      message={
        <span style={{ display: "flex", alignItems: "center" }}>
          {icon} {/* Ícone */}
          <span style={{ marginLeft: 8, wordBreak: "break-word" }}>
            {message}
          </span>
        </span>
      }
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      ContentProps={{
        sx: {
          backgroundColor, // Define a cor de fundo dinamicamente
          color: "#fff", // Cor do texto
          fontSize: "1rem", // Tamanho do texto
          fontWeight: "bold", // Negrito para destaque
          padding: "10px", // Espaçamento interno
          borderRadius: "8px", // Bordas arredondadas
          textAlign: "center", // Centraliza o texto
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", // Adiciona uma sombra suave
          transition: "all 0.3s ease-in-out", // Transição suave
        },
      }}
      action={
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "#fff",
            "&:hover": {
              color: "#000",
            },
          }}
        >
          <Close />
        </IconButton>
      }
      aria-label={`Snackbar de ${type}`} // Acessibilidade
    />
  );
};

// Validações de propriedades recebidas
SnackbarNotification.propTypes = {
  open: PropTypes.bool.isRequired, // Indica se o Snackbar está visível
  message: PropTypes.string.isRequired, // Mensagem exibida
  type: PropTypes.oneOf(["success", "error", "warning", "info"]), // Tipos permitidos
  onClose: PropTypes.func.isRequired, // Função chamada ao fechar o Snackbar
  autoHideDuration: PropTypes.number, // Duração para esconder automaticamente
};

// Valores padrão para propriedades opcionais
SnackbarNotification.defaultProps = {
  autoHideDuration: 5000, // Tempo padrão: 5 segundos
  type: "info", // Tipo padrão: "info"
};

export default SnackbarNotification;
