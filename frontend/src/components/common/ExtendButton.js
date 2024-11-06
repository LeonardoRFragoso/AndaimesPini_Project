import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Event } from "@mui/icons-material";

const ExtendButton = ({ onClick }) => (
  <Tooltip title="Prorrogar Locação">
    <IconButton color="primary" onClick={onClick}>
      <Event />
    </IconButton>
  </Tooltip>
);

export default ExtendButton;
