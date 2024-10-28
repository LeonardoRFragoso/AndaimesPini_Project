import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Check } from "@mui/icons-material";

const ReturnButton = ({ onClick }) => (
  <Tooltip title="Confirmar Devolução">
    <IconButton color="success" onClick={onClick}>
      <Check />
    </IconButton>
  </Tooltip>
);

export default ReturnButton;
