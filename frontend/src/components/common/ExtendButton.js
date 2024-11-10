import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@mui/material";
import { Event } from "@mui/icons-material";

/**
 * Botão para prorrogar a locação
 *
 * @param {function} onClick - Função executada ao clicar no botão
 */
const ExtendButton = ({ onClick }) => (
  <Tooltip title="Prorrogar Locação">
    <IconButton
      color="primary"
      onClick={onClick}
      aria-label="Clique para prorrogar a locação"
      sx={{
        backgroundColor: "rgba(76, 175, 80, 0.1)", // Verde claro translúcido
        "&:hover": {
          backgroundColor: "rgba(76, 175, 80, 0.2)", // Intensifica no hover
        },
      }}
    >
      <Event />
    </IconButton>
  </Tooltip>
);

// Adiciona validação para as props
ExtendButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ExtendButton;
