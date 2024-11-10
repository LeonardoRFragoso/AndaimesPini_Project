// frontend/src/components/common/DetailsButton.js

import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@mui/material";
import { Info } from "@mui/icons-material";

/**
 * Botão para exibir detalhes de um pedido
 *
 * @param {function} onClick - Função executada ao clicar no botão
 */
const DetailsButton = ({ onClick }) => (
  <Tooltip title="Ver detalhes do pedido">
    <IconButton
      color="info"
      onClick={onClick}
      aria-label="Clique para ver os detalhes do pedido"
      sx={{
        backgroundColor: "rgba(33, 150, 243, 0.1)", // Azul claro translúcido
        "&:hover": {
          backgroundColor: "rgba(33, 150, 243, 0.2)", // Intensifica no hover
        },
      }}
    >
      <Info />
    </IconButton>
  </Tooltip>
);

// Adiciona validação para as props
DetailsButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default DetailsButton;
