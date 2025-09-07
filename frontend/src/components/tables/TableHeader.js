import React from "react";
import PropTypes from "prop-types";
import { TableHead, TableRow, TableCell, useTheme } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

const TableHeader = ({ orderBy, onSort }) => {
  const theme = useTheme();
  // Definição das colunas da tabela
  const columns = [
    { id: "id", label: "ID do Pedido", align: "center" },
    { id: "data_inicio", label: "Data de Início" },
    { id: "data_fim", label: "Data de Término" },
    { id: "cliente.nome", label: "Cliente" },
    { id: "valor_total", label: "Valor Total", align: "right" },
    { id: "valor_ajustado", label: "Valor Ajustado", align: "right" },
    { id: "status", label: "Status", align: "center" },
    { id: "abatimento", label: "Abatimento", align: "right" },
    { id: "data_fim_original", label: "Data de Término Original" },
    { id: "data_devolucao", label: "Data de Devolução" },
    { id: "motivo_ajuste", label: "Motivo do Ajuste" },
    { id: "data_prorrogacao", label: "Data de Prorrogação" },
    { id: "novo_valor_total", label: "Novo Valor Total", align: "right" },
  ];

  return (
    <TableHead sx={{ 
      backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.9)' : '#e0f2f1' 
    }}>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align || "left"}
            onClick={() => onSort(column.id)}
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
              textAlign: column.align || "left",
              color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
              "&:hover": { color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#00796b' },
            }}
            aria-label={`Ordenar por ${column.label}`}
          >
            {/* Exibição do rótulo e ícone de ordenação */}
            {column.label}
            {orderBy.field === column.id &&
              (orderBy.direction === "asc" ? (
                <ArrowUpward
                  fontSize="small"
                  sx={{ marginLeft: 1 }}
                  aria-label="Ordenado ascendente"
                />
              ) : (
                <ArrowDownward
                  fontSize="small"
                  sx={{ marginLeft: 1 }}
                  aria-label="Ordenado descendente"
                />
              ))}
          </TableCell>
        ))}
        {/* Célula adicional para ações */}
        <TableCell
          align="center"
          sx={{ 
            fontWeight: "bold",
            color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit'
          }}
          aria-label="Ações"
        >
          Ações
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

// Validação das propriedades recebidas
TableHeader.propTypes = {
  orderBy: PropTypes.shape({
    field: PropTypes.string, // Campo sendo ordenado
    direction: PropTypes.oneOf(["asc", "desc"]), // Direção da ordenação
  }).isRequired,
  onSort: PropTypes.func.isRequired, // Função para manipular a ordenação
};

export default TableHeader;
