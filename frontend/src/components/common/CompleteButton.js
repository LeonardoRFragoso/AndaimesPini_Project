import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Replay } from "@mui/icons-material";

const CompleteButton = ({ onClick }) => (
  <Tooltip title="Devolução antecipada">
    <IconButton color="warning" onClick={onClick}>
      <Replay />
    </IconButton>
  </Tooltip>
);

export default CompleteButton;
