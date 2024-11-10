import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  DialogContentText,
} from "@mui/material";
import { Event, Cancel } from "@mui/icons-material";
import PropTypes from "prop-types";

const OrdersExtendDialog = ({ open, order, onClose, onExtend }) => {
  const [extendDays, setExtendDays] = useState("");
  const [novoValorTotal, setNovoValorTotal] = useState("");
  const [abatimento, setAbatimento] = useState("");
  const [errors, setErrors] = useState({}); // Estado para mensagens de erro

  useEffect(() => {
    if (open) {
      setExtendDays("");
      setNovoValorTotal("");
      setAbatimento("");
      setErrors({});
    }
  }, [open]);

  const validateFields = () => {
    const newErrors = {};
    if (!extendDays || isNaN(extendDays) || parseInt(extendDays, 10) <= 0) {
      newErrors.extendDays = "Insira um número válido de dias.";
    }
    if (
      !novoValorTotal ||
      isNaN(novoValorTotal) ||
      parseFloat(novoValorTotal) <= 0
    ) {
      newErrors.novoValorTotal = "Insira um valor total válido.";
    }
    if (abatimento && (isNaN(abatimento) || parseFloat(abatimento) < 0)) {
      newErrors.abatimento = "Insira um valor de abatimento válido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExtend = () => {
    if (!validateFields()) return;

    onExtend(order, {
      dias: parseInt(extendDays, 10),
      novoValor: parseFloat(novoValorTotal),
      abatimento: parseFloat(abatimento) || 0,
    });

    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="extend-dialog-title">
      <DialogTitle id="extend-dialog-title">Prorrogar Pedido</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Quantos dias deseja prorrogar o pedido #{order.id}?
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Dias"
          type="number"
          fullWidth
          value={extendDays}
          onChange={(e) => setExtendDays(e.target.value)}
          error={Boolean(errors.extendDays)}
          helperText={errors.extendDays}
          InputProps={{
            inputProps: { min: 1 },
          }}
          aria-label="Dias para prorrogação"
        />
        <TextField
          margin="dense"
          label="Novo Valor Total"
          type="number"
          fullWidth
          value={novoValorTotal}
          onChange={(e) => setNovoValorTotal(e.target.value)}
          error={Boolean(errors.novoValorTotal)}
          helperText={errors.novoValorTotal}
          InputProps={{
            inputProps: { min: 0 },
          }}
          aria-label="Novo valor total do pedido"
        />
        <TextField
          margin="dense"
          label="Abatimento (opcional)"
          type="number"
          fullWidth
          value={abatimento}
          onChange={(e) => setAbatimento(e.target.value)}
          error={Boolean(errors.abatimento)}
          helperText={errors.abatimento}
          InputProps={{
            inputProps: { min: 0 },
          }}
          aria-label="Abatimento opcional"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
          startIcon={<Cancel />}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
          }}
          aria-label="Cancelar prorrogação"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleExtend}
          color="primary"
          startIcon={<Event />}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
          }}
          aria-label="Confirmar prorrogação"
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OrdersExtendDialog.propTypes = {
  open: PropTypes.bool.isRequired, // Indica se o diálogo está aberto
  order: PropTypes.shape({
    id: PropTypes.number.isRequired, // ID do pedido
  }), // Detalhes do pedido atual
  onClose: PropTypes.func.isRequired, // Função para fechar o diálogo
  onExtend: PropTypes.func.isRequired, // Função para lidar com a prorrogação
};

export default OrdersExtendDialog;
