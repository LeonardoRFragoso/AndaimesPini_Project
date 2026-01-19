import React from 'react';
import { Box, Container, Typography, Avatar, Chip, IconButton } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useThemeMode } from '../../contexts/ThemeContext';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  action,
  onRefresh,
  refreshing = false,
  compact = false 
}) => {
  const { mode } = useThemeMode();

  const colors = {
    primary: '#1B5E20',
    primaryDark: '#0D3D12',
  };

  return (
    <Box
      sx={{
        background: mode === 'light'
          ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
          : 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
        pt: compact ? 2 : 3,
        pb: compact ? 6 : 8,
        px: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 0, md: compact ? 3 : 0 },
        mx: compact ? { xs: 0, md: 2 } : 0,
        mt: compact ? 2 : 0,
      }}
    >
      {/* Pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {icon && (
              <Avatar
                sx={{
                  width: compact ? 48 : 56,
                  height: compact ? 48 : 56,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {React.cloneElement(icon, { sx: { fontSize: compact ? 26 : 32, color: '#fff' } })}
              </Avatar>
            )}
            <Box>
              <Typography
                variant={compact ? "h5" : "h4"}
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: { xs: compact ? '1.25rem' : '1.5rem', md: compact ? '1.5rem' : '2rem' },
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {onRefresh && (
              <IconButton
                onClick={onRefresh}
                disabled={refreshing}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <RefreshIcon 
                  sx={{ 
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } }
                  }} 
                />
              </IconButton>
            )}
            {action}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PageHeader;
