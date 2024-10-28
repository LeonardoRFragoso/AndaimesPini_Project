import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Info } from "@mui/icons-material";

const DetailsButton = ({ onClick }) => (
  <Tooltip title="Ver Detalhes">
    <IconButton color="info" onClick={onClick}>
      <Info />
    </IconButton>
  </Tooltip>
);

export default DetailsButton;
