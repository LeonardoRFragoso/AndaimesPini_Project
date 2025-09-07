import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, List, ListItem, ListItemIcon, ListItemText, 
  Divider, Box, Chip, Badge, Collapse, IconButton, useTheme, 
  useMediaQuery, Fade, Grow, Paper, Tooltip, CircularProgress, Button
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getCardStyle, getTitleStyle, getBorderStyle, getGradientBackground } from './DarkModeStyles';
import { NotificacoesService } from '../../api/notificacoes';
import { useSnackbar } from 'notistack';

const AlertsPanel = ({ inventory, rentals }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState({});
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificacoes, setNotificacoes] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const today = new Date();
  
  // Função para carregar notificações do backend
  const carregarNotificacoes = async () => {
    setLoading(true);
    try {
      const response = await NotificacoesService.obterTodas();
      if (response.status === 'success') {
        setNotificacoes(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      enqueueSnackbar('Erro ao carregar notificações', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Função para marcar uma notificação como lida
  const marcarComoLida = async (id) => {
    try {
      await NotificacoesService.marcarComoLida(id);
      // Atualizar a lista de notificações localmente
      setNotificacoes(prev => 
        prev.map(notif => notif.id === id ? { ...notif, lida: true } : notif)
      );
      enqueueSnackbar('Notificação marcada como lida', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      enqueueSnackbar('Erro ao marcar notificação como lida', { variant: 'error' });
    }
  };

  // Função para marcar todas as notificações como lidas
  const marcarTodasComoLidas = async () => {
    try {
      await NotificacoesService.marcarTodasComoLidas();
      // Atualizar todas as notificações localmente
      setNotificacoes(prev => prev.map(notif => ({ ...notif, lida: true })));
      enqueueSnackbar('Todas as notificações marcadas como lidas', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      enqueueSnackbar('Erro ao marcar todas as notificações como lidas', { variant: 'error' });
    }
  };

  // Função para excluir uma notificação
  const excluirNotificacao = async (id) => {
    try {
      await NotificacoesService.excluir(id);
      // Remover a notificação da lista local
      setNotificacoes(prev => prev.filter(notif => notif.id !== id));
      enqueueSnackbar('Notificação excluída com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      enqueueSnackbar('Erro ao excluir notificação', { variant: 'error' });
    }
  };
  
  useEffect(() => {
    // Carregar notificações ao montar o componente
    carregarNotificacoes();
    
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filtrar notificações por tipo
  const notificacoesEstoqueCritico = notificacoes.filter(notif => notif.tipo === 'estoque_critico');
  const notificacoesDevolucaoAtrasada = notificacoes.filter(notif => notif.tipo === 'devolucao_atrasada');
  const notificacoesSistema = notificacoes.filter(notif => notif.tipo === 'sistema');
  
  // Total de alertas
  const totalAlerts = notificacoes.length;

  const handleExpandClick = (id) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderNotificacaoItem = (notificacao) => {
    const isExpanded = expanded[notificacao.id] || false;
    let icon, color;
    
    // Determinar ícone e cor com base no tipo de notificação
    switch (notificacao.tipo) {
      case 'estoque_critico':
        icon = <ErrorIcon />;
        color = 'error';
        break;
      case 'devolucao_atrasada':
        icon = <WarningIcon />;
        color = 'warning';
        break;
      case 'sistema':
        icon = <InfoIcon />;
        color = 'info';
        break;
      default:
        icon = <NotificationsIcon />;
        color = 'primary';
    }
    
    return (
      <Grow 
        key={notificacao.id} 
        in={animate} 
        timeout={600 + (Object.keys(expanded).indexOf(notificacao.id.toString()) * 100)}
      >
        <Box>
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 2, 
              borderRadius: 2, 
              overflow: 'hidden',
              border: `1px solid ${theme.palette[color].light}`,
              bgcolor: notificacao.lida ? 
                `${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}` : 
                `${theme.palette[color].light}10`,
              transition: 'all 0.3s ease',
              opacity: notificacao.lida ? 0.7 : 1
            }}
          >
            <ListItem 
              alignItems="flex-start"
              sx={{ 
                cursor: 'pointer',
                '&:hover': { bgcolor: `${theme.palette[color].light}10` }
              }}
              onClick={() => handleExpandClick(notificacao.id.toString())}
            >
              <ListItemIcon sx={{ mt: 0.5 }}>
                <Badge 
                  variant="dot" 
                  invisible={notificacao.lida}
                  color={color}
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                >
                  {icon}
                </Badge>
              </ListItemIcon>
              <Box sx={{ width: '100%' }}>
                {/* Title section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={notificacao.lida ? 400 : 500} 
                    color={notificacao.lida ? 'text.secondary' : `${color}.main`}
                  >
                    {notificacao.titulo}
                  </Typography>
                  <Box>
                    {!notificacao.lida && (
                      <Tooltip title="Marcar como lida">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoLida(notificacao.id);
                          }}
                          sx={{ color: `${color}.main`, mr: 0.5 }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={isExpanded ? "Recolher" : "Expandir"}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpandClick(notificacao.id.toString());
                        }}
                        sx={{ color: `${color}.main` }}
                      >
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                {/* Data da notificação */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {new Date(notificacao.data_criacao).toLocaleString('pt-BR')}
                </Typography>
                
                {/* Mensagem resumida */}
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: isExpanded ? 'unset' : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {notificacao.mensagem}
                </Typography>
              </Box>
            </ListItem>
            
            <Collapse in={isExpanded} timeout="auto">
              <Box sx={{ p: 2, pt: 0, pl: 9, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Tooltip title="Excluir notificação">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => excluirNotificacao(notificacao.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        </Box>
      </Grow>
    );
  };
  
  // Agrupar notificações por tipo para exibição
  const renderNotificacaoGrupo = (notificacoes, titulo, descricao = null) => {
    if (notificacoes.length === 0) return null;
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
          {titulo} <Chip label={notificacoes.length} size="small" color="primary" sx={{ ml: 1 }} />
        </Typography>
        {descricao && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {descricao}
          </Typography>
        )}
        {notificacoes.map(notificacao => renderNotificacaoItem(notificacao))}
      </Box>
    );
  };

  return (
    <Card 
      sx={{ 
        ...getCardStyle(theme),
        mb: 3
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: -20, 
        right: -20, 
        width: 100, 
        height: 100, 
        borderRadius: '50%', 
        background: getGradientBackground(theme, 'rgba(244,67,54,0.1)'),
        zIndex: 0 
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          pb: 1.5,
          borderBottom: getBorderStyle(theme)
        }}>
          <Typography 
            variant="h5" 
            sx={getTitleStyle(theme)}
          >
            <InfoIcon /> Alertas e Notificações
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Atualizar notificações">
              <span>
                <IconButton 
                  size="small" 
                  onClick={carregarNotificacoes}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </span>
            </Tooltip>
            
            {notificacoes.filter(n => !n.lida).length > 0 && (
              <Tooltip title="Marcar todas como lidas">
                <span>
                  <IconButton 
                    size="small" 
                    onClick={marcarTodasComoLidas}
                    disabled={loading}
                  >
                    <DoneAllIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            
            <Tooltip title={`${totalAlerts} notificações no total`}>
              <Chip 
                label={totalAlerts} 
                color={totalAlerts > 0 ? "primary" : "success"}
                size="small"
                icon={totalAlerts > 0 ? <NotificationsIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                sx={{ 
                  fontWeight: 'bold',
                  '& .MuiChip-icon': { fontSize: '1rem' }
                }}
              />
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {notificacoes.length > 0 ? (
                <>
                  {renderNotificacaoGrupo(
                    notificacoesDevolucaoAtrasada,
                    "Devoluções Atrasadas",
                    "Locações que já deveriam ter sido devolvidas"
                  )}
                  
                  {renderNotificacaoGrupo(
                    notificacoesEstoqueCritico,
                    "Itens com Estoque Crítico",
                    "Itens com níveis baixos de estoque disponível"
                  )}
                  
                  {renderNotificacaoGrupo(
                    notificacoesSistema,
                    "Notificações do Sistema"
                  )}
                  
                  {/* Outras notificações que não se encaixam nas categorias acima */}
                  {renderNotificacaoGrupo(
                    notificacoes.filter(n => 
                      !['estoque_critico', 'devolucao_atrasada', 'sistema'].includes(n.tipo)
                    ),
                    "Outras Notificações"
                  )}
                </>
              ) : (
                <Fade in={animate} timeout={600}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      border: '1px solid rgba(76, 175, 80, 0.2)'
                    }}
                  >
                    <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1, opacity: 0.8 }} />
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Não há notificações no momento
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tudo está em ordem! O sistema está funcionando normalmente.
                    </Typography>
                  </Paper>
                </Fade>
              )}
            </>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default AlertsPanel;
