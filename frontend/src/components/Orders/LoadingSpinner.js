import React from "react";
import PropTypes from "prop-types";
import { CircularProgress, Box, Typography } from "@mui/material";

const LoadingSpinner = ({
  message = "Carregando...",
  size = 40,
  color = "primary",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 3,
        gap: 1, // Espaçamento entre o spinner e a mensagem
      }}
      aria-label="Carregando conteúdo" // Acessibilidade
    >
      <CircularProgress size={size} color={color} />
      <Typography
        variant="body2"
        sx={{
          marginTop: 1,
          color: "#666", // Cor padrão para texto
          fontWeight: "bold",
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

// Validação de props
LoadingSpinner.propTypes = {
  message: PropTypes.string, // Mensagem opcional de carregamento
  size: PropTypes.number, // Tamanho do spinner (padrão 40)
  color: PropTypes.string, // Cor do spinner (padrão 'primary')
};

export default LoadingSpinner;
