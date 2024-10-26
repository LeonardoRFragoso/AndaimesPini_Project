// Button.js
import React from "react";
import { Button as MuiButton } from "@mui/material";

// O componente Button utiliza o Button do Material-UI com props customizáveis
const Button = ({
  label,
  onClick,
  variant = "contained", // Estilo do botão (contained, outlined, text)
  color = "primary", // Cor do botão (primary, secondary, etc.)
  size = "medium", // Tamanho do botão (small, medium, large)
  sx = {}, // Estilos adicionais via sx
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      sx={{
        fontWeight: "bold",
        textTransform: "uppercase",
        padding: "10px 20px",
        borderRadius: "8px",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.03)",
        },
        ...sx, // Permite adicionar estilos customizados ao usar o componente
      }}
      {...props} // Qualquer outra prop adicional, como disabled
    >
      {label}
    </MuiButton>
  );
};

export default Button;
