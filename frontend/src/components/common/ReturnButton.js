import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@mui/material";
import { Check } from "@mui/icons-material";

/**
 * Botão para confirmar a devolução de um pedido
 *
 * @param {function} onClick - Função executada ao clicar no botão
 */
const ReturnButton = ({ onClick }) => (
  <Tooltip title="Confirmar Devolução">
    <IconButton
      color="success"
      onClick={onClick}
      aria-label="Clique para confirmar a devolução"
      sx={{
        backgroundColor: "rgba(76, 175, 80, 0.1)", // Verde claro translúcido
        "&:hover": {
          backgroundColor: "rgba(76, 175, 80, 0.2)", // Intensifica no hover
        },
      }}
    >
      <Check />
    </IconButton>
  </Tooltip>
);

// Adiciona validação para as props
ReturnButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ReturnButton;
