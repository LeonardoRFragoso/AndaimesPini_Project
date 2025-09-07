// PageLayout.js
import React from "react";
import { Box } from "@mui/material";

const PageLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout;
