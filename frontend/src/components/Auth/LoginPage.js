import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container, 
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const theme = useTheme();
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
      
      // Redirecionar para a página inicial
      navigate('/');
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

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%', 
            borderRadius: 2,
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' 
              : '#f9f9f9',
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(0,0,0,0.05)',
            border: theme => theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.05)'
              : 'none'
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ 
              color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d', 
              fontWeight: 'bold', 
              mb: 3 
            }}
          >
            Login - Andaimes Pini
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                  '& fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
                },
                '& .MuiInputBase-input': {
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                }
              }}
            />
            
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              variant="outlined"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                  '& fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#2c552d',
                },
                '& .MuiInputBase-input': {
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#3a6e3d' : '#2c552d',
                '&:hover': {
                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#4caf50' : '#45a049',
                },
                borderRadius: 2,
                fontWeight: 'bold',
                boxShadow: theme => theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
          </form>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.6)' 
                  : 'rgba(0, 0, 0, 0.6)' 
              }}
            >
              Credenciais padrão: admin@andaimespini.com / admin123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
