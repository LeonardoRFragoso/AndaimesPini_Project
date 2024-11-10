import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@mui/material";
import { Replay } from "@mui/icons-material";

/**
 * Botão para devolução antecipada de um pedido
 *
 * @param {function} onClick - Função executada ao clicar no botão
 */
const CompleteButton = ({ onClick }) => (
  <Tooltip title="Devolução antecipada">
    <IconButton
      color="warning"
      onClick={onClick}
      aria-label="Clique para realizar a devolução antecipada"
      sx={{
        backgroundColor: "rgba(255, 193, 7, 0.1)", // Amarelo claro translúcido
        "&:hover": {
          backgroundColor: "rgba(255, 193, 7, 0.2)", // Intensifica no hover
        },
      }}
    >
      <Replay />
    </IconButton>
  </Tooltip>
);

// Adiciona validação para as props
CompleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default CompleteButton;
