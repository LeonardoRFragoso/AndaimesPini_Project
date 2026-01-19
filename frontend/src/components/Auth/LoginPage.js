import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon,
  Lock as LockIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const { login: authLogin } = useAuth();
  
  // Cleanup function to prevent state updates after unmounting
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, senha);
      
      // Verificar a estrutura da resposta e extrair token e dados do usuário
      console.log('Resposta do login:', response);
      
      // Verificar se o token está disponível diretamente ou dentro de um objeto data
      const token = response.token || (response.data && response.data.token);
      const usuario = response.usuario || (response.data && response.data.usuario);
      
      if (!token) {
        throw new Error('Token não encontrado na resposta');
      }
      
      // Usar a função de login do contexto para atualizar o estado imediatamente
      authLogin(usuario, token);
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      // Só atualiza o estado se o componente ainda estiver montado
      if (isMounted.current) {
        setError(
          err.response?.data?.error || err.message || 
          'Erro ao fazer login. Verifique suas credenciais e tente novamente.'
        );
      }
    } finally {
      // Só atualiza o estado se o componente ainda estiver montado
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Cores do tema
  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
    accent: '#4CAF50',
    gradientStart: '#1B5E20',
    gradientEnd: '#0D3D12',
    textLight: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.7)',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: isDark 
          ? 'linear-gradient(135deg, #121212 0%, #1a1a2e 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      }}
    >
      {/* Painel Esquerdo - Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.5,
          },
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* Logo/Ícone */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <ConstructionIcon sx={{ fontSize: 60, color: colors.textLight }} />
            </Box>
            
            <Typography
              variant="h3"
              sx={{
                color: colors.textLight,
                fontWeight: 700,
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Andaimes Pini
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: colors.textMuted,
                fontWeight: 400,
                maxWidth: 400,
                lineHeight: 1.6,
              }}
            >
              Sistema de Gestão de Locações
            </Typography>

            <Divider 
              sx={{ 
                my: 4, 
                borderColor: 'rgba(255,255,255,0.2)',
                width: '60%',
                mx: 'auto'
              }} 
            />

            {/* Features */}
            <Box sx={{ mt: 4 }}>
              {[
                'Controle completo de inventário',
                'Gestão de clientes e locações',
                'Relatórios detalhados'
              ].map((feature, index) => (
                <Fade in timeout={1000 + index * 200} key={index}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: colors.accent,
                        mr: 2,
                      }}
                    />
                    <Typography
                      sx={{
                        color: colors.textMuted,
                        fontSize: '1rem',
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Painel Direito - Formulário */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Fade in timeout={600}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 420,
            }}
          >
            {/* Header Mobile */}
            <Box 
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 8px 24px rgba(27, 94, 32, 0.3)',
                }}
              >
                <ConstructionIcon sx={{ fontSize: 40, color: '#fff' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  color: isDark ? '#fff' : colors.primary,
                  fontWeight: 700,
                }}
              >
                Andaimes Pini
              </Typography>
            </Box>

            {/* Título do Login */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  color: isDark ? '#fff' : '#1a1a2e',
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Bem-vindo de volta
              </Typography>
              <Typography
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.6)' : '#666',
                  fontSize: '1rem',
                }}
              >
                Entre com suas credenciais para acessar o sistema
              </Typography>
            </Box>

            {/* Alerta de Erro */}
            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      alignItems: 'center',
                    },
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}
            
            {/* Formulário */}
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#999' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    transition: 'all 0.2s ease',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : colors.primaryLight,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: isDark ? 'rgba(255,255,255,0.6)' : '#666',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: isDark ? '#fff' : '#1a1a2e',
                    py: 1.75,
                  },
                }}
              />
              
              <TextField
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#999' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{
                          color: isDark ? 'rgba(255,255,255,0.5)' : '#999',
                          '&:hover': {
                            color: colors.primary,
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    transition: 'all 0.2s ease',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : colors.primaryLight,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: isDark ? 'rgba(255,255,255,0.6)' : '#666',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: isDark ? '#fff' : '#1a1a2e',
                    py: 1.75,
                  },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.75,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 24px rgba(27, 94, 32, 0.35)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(27, 94, 32, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
            
            {/* Credenciais de Demo */}
            <Box 
              sx={{ 
                mt: 4, 
                p: 2.5,
                borderRadius: 2,
                backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : 'rgba(27, 94, 32, 0.05)',
                border: `1px solid ${isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(27, 94, 32, 0.1)'}`,
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isDark ? 'rgba(255,255,255,0.7)' : '#666',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              >
                <strong style={{ color: isDark ? colors.accent : colors.primary }}>
                  Credenciais de demonstração:
                </strong>
                <br />
                admin@andaimespini.com / admin123
              </Typography>
            </Box>

            {/* Footer */}
            <Typography
              sx={{
                mt: 4,
                textAlign: 'center',
                color: isDark ? 'rgba(255,255,255,0.4)' : '#999',
                fontSize: '0.75rem',
              }}
            >
              © 2024 Andaimes Pini. Todos os direitos reservados.
            </Typography>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default LoginPage;
