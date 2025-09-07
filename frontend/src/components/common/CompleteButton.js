import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { Replay } from "@mui/icons-material";

/**
 * Botão para devolução antecipada de um pedido
 *
 * @param {function} onClick - Função executada ao clicar no botão
 */
const CompleteButton = ({ onClick, sx, ...props }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Tooltip title="Devolução antecipada">
      <IconButton
        color="warning"
        onClick={onClick}
        aria-label="Clique para realizar a devolução antecipada"
        size="small"
        sx={{
          backgroundColor: isDarkMode ? "rgba(255, 193, 7, 0.2)" : "rgba(255, 193, 7, 0.1)",
          borderRadius: "50%",
          width: 32,
          height: 32,
          "&:hover": {
            backgroundColor: isDarkMode ? "rgba(255, 193, 7, 0.3)" : "rgba(255, 193, 7, 0.2)",
            transform: 'scale(1.1)',
            boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)',
          },
          transition: 'all 0.2s ease-in-out',
          ...sx
        }}
        {...props}
      >
        <Replay fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

// Adiciona validação para as props
CompleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default CompleteButton;
