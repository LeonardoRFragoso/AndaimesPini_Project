// Input.js
import React from "react";
import { TextField } from "@mui/material";

const Input = ({
  label,
  value,
  onChange,
  type = "text", // Tipo de input: text, password, email, etc.
  placeholder = "",
  fullWidth = true, // Define se o input ocupa toda a largura disponível
  variant = "outlined", // Estilo do input: outlined, filled, standard
  size = "medium", // Tamanho do input: small, medium
  error = false,
  helperText = "",
  ...props
}) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      error={error}
      helperText={helperText}
      sx={{
        marginBottom: "16px", // Espaçamento inferior para inputs empilhados
      }}
      {...props} // Outras props adicionais
    />
  );
};

export default Input;
