import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Replay } from "@mui/icons-material";

const CompleteButton = ({ onClick }) => (
  <Tooltip title="Completar Antecipado">
    <IconButton color="warning" onClick={onClick}>
      <Replay />
    </IconButton>
  </Tooltip>
);

export default CompleteButton;
