// frontend/src/components/common/DetailsButton.js

import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { Info } from "@mui/icons-material";

/**
 * Botão para exibir detalhes de um pedido
 *
 * @param {function} onClick - Função executada ao clicar no botão
 */
const DetailsButton = ({ onClick, sx, ...props }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Tooltip title="Ver detalhes do pedido">
      <IconButton
        color="info"
        onClick={onClick}
        aria-label="Clique para ver os detalhes do pedido"
        size="small"
        sx={{
          backgroundColor: isDarkMode ? "rgba(33, 150, 243, 0.2)" : "rgba(33, 150, 243, 0.1)",
          borderRadius: "50%",
          width: 32,
          height: 32,
          "&:hover": {
            backgroundColor: isDarkMode ? "rgba(33, 150, 243, 0.3)" : "rgba(33, 150, 243, 0.2)",
            transform: 'scale(1.1)',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
          },
          transition: 'all 0.2s ease-in-out',
          ...sx
        }}
        {...props}
      >
        <Info fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

// Adiciona validação para as props
DetailsButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default DetailsButton;
