// frontend/src/components/common/DetailsButton.js

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Info } from "@mui/icons-material";

/**
 * Botão para exibir detalhes de um pedido
 *
 * @param {function} onClick - Função executada ao clicar no botão
 */
const DetailsButton = ({ onClick }) => (
  <Tooltip title="Ver Detalhes do Pedido">
    <IconButton
      color="info"
      onClick={onClick}
      aria-label="Ver detalhes do pedido"
    >
      <Info />
    </IconButton>
  </Tooltip>
);

export default DetailsButton;
