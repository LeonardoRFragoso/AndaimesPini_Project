import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";

// Funções utilitárias
const formatCurrency = (value) =>
  `R$ ${(value || 0).toFixed(2).replace(".", ",")}`;

const formatDate = (date, fallbackMessage = "Não disponível") => {
  const parsedDate = new Date(date);
  return !date || isNaN(parsedDate)
    ? fallbackMessage
    : parsedDate.toLocaleDateString();
};

// Subcomponente: Renderização dos itens locados
const RenderItensLocados = ({ itens }) => (
  <Table size="small" sx={{ marginTop: 2 }}>
    <TableBody>
      {itens?.length > 0 ? (
        itens.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              <strong>Item:</strong> {item.nome_item || "N/A"}
            </TableCell>
            <TableCell>
              <strong>Quantidade:</strong> {item.quantidade || "0"}
            </TableCell>
            <TableCell>
              <strong>Tipo:</strong> {item.tipo_item || "Não especificado"}
            </TableCell>
            <TableCell>
              <strong>Data de Alocação:</strong>{" "}
              {formatDate(item.data_alocacao)}
            </TableCell>
            <TableCell>
              <strong>Data de Devolução:</strong>{" "}
              {item.data_devolucao
                ? formatDate(item.data_devolucao)
                : "Não devolvido"}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5} align="center">
            Nenhum item locado.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

RenderItensLocados.propTypes = {
  itens: PropTypes.arrayOf(
    PropTypes.shape({
      nome_item: PropTypes.string,
      quantidade: PropTypes.number,
      tipo_item: PropTypes.string,
      data_alocacao: PropTypes.string,
      data_devolucao: PropTypes.string,
    })
  ),
};

// Subcomponente: Renderização dos detalhes financeiros
const RenderFinanceDetails = ({ label, value }) => (
  <Typography>
    <strong>{label}:</strong> {formatCurrency(value)}
  </Typography>
);

RenderFinanceDetails.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
};

// Componente principal
const OrderDetailsDialog = ({ open, selectedOrder, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Detalhes do Pedido #{selectedOrder?.id || "N/A"}</DialogTitle>
    <DialogContent dividers>
      {selectedOrder ? (
        <>
          {/* Informações do Cliente */}
          <Typography variant="h6">Cliente</Typography>
          <Box sx={{ marginBottom: 2 }}>
            <Typography>
              <strong>Nome:</strong>{" "}
              {selectedOrder.cliente?.nome || "Não informado"}
            </Typography>
            <Typography>
              <strong>Endereço:</strong>{" "}
              {selectedOrder.cliente?.endereco || "Não informado"}
            </Typography>
            <Typography>
              <strong>Telefone:</strong>{" "}
              {selectedOrder.cliente?.telefone || "Não informado"}
            </Typography>
          </Box>

          {/* Detalhes do Pedido */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Detalhes do Pedido
          </Typography>
          <Box sx={{ marginBottom: 2 }}>
            <Typography>
              <strong>Data de Início:</strong>{" "}
              {formatDate(selectedOrder.data_inicio)}
            </Typography>
            <Typography>
              <strong>Data de Término Original:</strong>{" "}
              {formatDate(selectedOrder.data_fim_original)}
            </Typography>
            <Typography>
              <strong>Nova Data de Término:</strong>{" "}
              {formatDate(selectedOrder.data_fim)}
            </Typography>
            <Typography>
              <strong>Status:</strong> {selectedOrder.status || "Indefinido"}
            </Typography>
          </Box>

          {/* Itens Locados */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Itens Locados
          </Typography>
          <RenderItensLocados itens={selectedOrder.itens} />

          {/* Dados Financeiros */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Dados Financeiros
          </Typography>
          <Box>
            <RenderFinanceDetails
              label="Valor Total"
              value={selectedOrder.valor_total}
            />
            <RenderFinanceDetails
              label="Valor Pago na Entrega"
              value={selectedOrder.valor_pago_entrega}
            />
            <RenderFinanceDetails
              label="Valor a Receber no Final"
              value={selectedOrder.valor_receber_final}
            />
            {selectedOrder.abatimento && (
              <RenderFinanceDetails
                label="Valor Abatimento"
                value={selectedOrder.abatimento}
              />
            )}
            {selectedOrder.novo_valor_total && (
              <RenderFinanceDetails
                label="Novo Valor Total"
                value={selectedOrder.novo_valor_total}
              />
            )}
            {(selectedOrder.novo_valor_total || selectedOrder.abatimento) && (
              <RenderFinanceDetails
                label="Valor Ajustado Final"
                value={
                  (selectedOrder.novo_valor_total ||
                    selectedOrder.valor_total ||
                    0) - (selectedOrder.abatimento || 0)
                }
              />
            )}
          </Box>
        </>
      ) : (
        <Typography>Detalhes do pedido não disponíveis.</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Fechar
      </Button>
    </DialogActions>
  </Dialog>
);

OrderDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  selectedOrder: PropTypes.shape({
    id: PropTypes.number.isRequired,
    cliente: PropTypes.shape({
      nome: PropTypes.string,
      endereco: PropTypes.string,
      telefone: PropTypes.string,
    }),
    itens: PropTypes.arrayOf(
      PropTypes.shape({
        nome_item: PropTypes.string,
        quantidade: PropTypes.number,
        tipo_item: PropTypes.string,
        data_alocacao: PropTypes.string,
        data_devolucao: PropTypes.string,
      })
    ),
    data_inicio: PropTypes.string,
    data_fim_original: PropTypes.string,
    data_fim: PropTypes.string,
    valor_total: PropTypes.number,
    valor_pago_entrega: PropTypes.number,
    valor_receber_final: PropTypes.number,
    abatimento: PropTypes.number,
    novo_valor_total: PropTypes.number,
    status: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default OrderDetailsDialog;
