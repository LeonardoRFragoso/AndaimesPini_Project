// index.js
import React from "react";
import ReactDOM from "react-dom";
import "./index.css"; // Importa o CSS global
import App from "./App"; // Importa o componente principal da aplicação

// Renderiza o componente App dentro do elemento com ID "root" no HTML
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
