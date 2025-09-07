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
  useTheme,
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
const RenderItensLocados = ({ itens }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  return (
  <Table size="small" sx={{ marginTop: 2, backgroundColor: isDarkMode ? 'rgba(40, 40, 40, 0.8)' : 'inherit' }}>
    <TableBody>
      {itens?.length > 0 ? (
        itens.map((item, index) => (
          <TableRow key={index} sx={{ 
            backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.5)' : 'inherit',
            '&:nth-of-type(odd)': {
              backgroundColor: isDarkMode ? 'rgba(60, 60, 60, 0.5)' : '#f9f9f9',
            },
          }}>
            <TableCell sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Item:</strong> {item.nome_item || "N/A"}
            </TableCell>
            <TableCell sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Quantidade:</strong> {item.quantidade || "0"}
            </TableCell>
            <TableCell sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Tipo:</strong> {item.tipo_item || "Não especificado"}
            </TableCell>
            <TableCell sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Data de Alocação:</strong>{" "}
              {formatDate(item.data_alocacao)}
            </TableCell>
            <TableCell sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Data de Devolução:</strong>{" "}
              {item.data_devolucao
                ? formatDate(item.data_devolucao)
                : "Não devolvido"}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.5)' : 'inherit' }}>
          <TableCell colSpan={5} align="center" sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
            Nenhum item locado.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
  );
};

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
const RenderFinanceDetails = ({ label, value }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  return (
  <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
    <strong>{label}:</strong> {formatCurrency(value)}
  </Typography>
  );
};

RenderFinanceDetails.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
};

// Componente principal
const OrderDetailsDialog = ({ open, selectedOrder, onClose }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  return (
  <Dialog 
    open={open} 
    onClose={onClose} 
    maxWidth="md" 
    fullWidth
    PaperProps={{
      sx: {
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : '#fff',
        color: isDarkMode ? '#fff' : 'inherit',
      }
    }}
  >
    <DialogTitle sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
      Detalhes do Pedido #{selectedOrder?.id || "N/A"}
    </DialogTitle>
    <DialogContent 
      dividers 
      sx={{ 
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'inherit',
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : '#fff',
      }}
    >
      {selectedOrder ? (
        <>
          {/* Informações do Cliente */}
          <Typography variant="h6" sx={{ color: isDarkMode ? '#4caf50' : '#2c552d' }}>Cliente</Typography>
          <Box sx={{ marginBottom: 2 }}>
            <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Nome:</strong>{" "}
              {selectedOrder.cliente?.nome || "Não informado"}
            </Typography>
            <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Endereço:</strong>{" "}
              {selectedOrder.cliente?.endereco || "Não informado"}
            </Typography>
            <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Telefone:</strong>{" "}
              {selectedOrder.cliente?.telefone || "Não informado"}
            </Typography>
          </Box>

          {/* Detalhes do Pedido */}
          <Typography variant="h6" sx={{ marginTop: 2, color: isDarkMode ? '#4caf50' : '#2c552d' }}>
            Detalhes do Pedido
          </Typography>
          <Box sx={{ marginBottom: 2 }}>
            <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Data de Início:</strong>{" "}
              {formatDate(selectedOrder.data_inicio)}
            </Typography>
            <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Data de Término Original:</strong>{" "}
              {formatDate(selectedOrder.data_fim_original)}
            </Typography>
            <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Nova Data de Término:</strong>{" "}
              {formatDate(selectedOrder.data_fim)}
            </Typography>
            <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              <strong>Status:</strong> {selectedOrder.status || "Indefinido"}
            </Typography>
          </Box>

          {/* Itens Locados */}
          <Typography variant="h6" sx={{ marginTop: 2, color: isDarkMode ? '#4caf50' : '#2c552d' }}>
            Itens Locados
          </Typography>
          <RenderItensLocados itens={selectedOrder.itens} />

          {/* Dados Financeiros */}
          <Typography variant="h6" sx={{ marginTop: 2, color: isDarkMode ? '#4caf50' : '#2c552d' }}>
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
        <Typography sx={{ color: isDarkMode ? '#fff' : 'inherit' }}>Detalhes do pedido não disponíveis.</Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : '#fff' }}>
      <Button 
        onClick={onClose} 
        color="primary"
        sx={{ 
          color: isDarkMode ? '#4caf50' : 'primary',
          '&:hover': { backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : '' } 
        }}
      >
        Fechar
      </Button>
    </DialogActions>
  </Dialog>
  );
};

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
