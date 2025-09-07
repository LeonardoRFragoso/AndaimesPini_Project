import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { Check } from "@mui/icons-material";

/**
 * Botão para confirmar a devolução de um pedido
 *
 * @param {function} onClick - Função executada ao clicar no botão
 */
const ReturnButton = ({ onClick, sx, ...props }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Tooltip title="Confirmar Devolução">
      <IconButton
        color="success"
        onClick={onClick}
        aria-label="Clique para confirmar a devolução"
        size="small"
        sx={{
          backgroundColor: isDarkMode ? "rgba(76, 175, 80, 0.2)" : "rgba(76, 175, 80, 0.1)",
          borderRadius: "50%",
          width: 32,
          height: 32,
          "&:hover": {
            backgroundColor: isDarkMode ? "rgba(76, 175, 80, 0.3)" : "rgba(76, 175, 80, 0.2)",
            transform: 'scale(1.1)',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
          },
          transition: 'all 0.2s ease-in-out',
          ...sx
        }}
        {...props}
      >
        <Check fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

// Adiciona validação para as props
ReturnButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default ReturnButton;
