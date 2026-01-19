import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Chip
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Handshake as HandshakeIcon,
  Engineering as EngineeringIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as DeliveryIcon,
  Support as SupportIcon,
  Star as StarIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useThemeMode } from '../../contexts/ThemeContext';

const LandingPage = () => {
  const { mode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const colors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    primaryDark: '#0D3D12',
    accent: '#4CAF50',
    orange: '#FF6B35',
    gold: '#FFB800',
  };

  const services = [
    {
      icon: <ConstructionIcon sx={{ fontSize: 48 }} />,
      title: 'Andaimes Tubulares',
      description: 'Andaimes de alta resistência para obras de todos os portes, garantindo segurança e praticidade.',
    },
    {
      icon: <EngineeringIcon sx={{ fontSize: 48 }} />,
      title: 'Escoras Metálicas',
      description: 'Escoras reguláveis de aço para lajes e estruturas, com diversas alturas disponíveis.',
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 48 }} />,
      title: 'Acessórios',
      description: 'Pranchões, sapatas, braçadeiras e todos os acessórios necessários para sua obra.',
    },
    {
      icon: <DeliveryIcon sx={{ fontSize: 48 }} />,
      title: 'Entrega e Retirada',
      description: 'Serviço de entrega e retirada em toda a Região dos Lagos com agilidade.',
    },
  ];

  const benefits = [
    { icon: <SpeedIcon />, text: 'Entrega Rápida' },
    { icon: <SecurityIcon />, text: 'Equipamentos Seguros' },
    { icon: <HandshakeIcon />, text: 'Preço Justo' },
    { icon: <SupportIcon />, text: 'Suporte Técnico' },
  ];

  const cities = [
    'Cabo Frio',
    'Búzios',
    'Arraial do Cabo',
    'São Pedro da Aldeia',
    'Iguaba Grande',
    'Araruama',
    'Saquarema',
    'Rio das Ostras',
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          background: mode === 'light'
            ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 50%, #000 100%)`
            : `linear-gradient(135deg, #0a0a0a 0%, ${colors.primaryDark} 100%)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          pt: { xs: 10, md: 0 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in timeout={800}>
                <Box>
                  {/* Badge */}
                  <Chip
                    icon={<LocationIcon sx={{ color: `${colors.gold} !important` }} />}
                    label="Unamar - Cabo Frio, RJ"
                    sx={{
                      mb: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontSize: '0.9rem',
                      py: 2.5,
                      px: 1,
                    }}
                  />

                  {/* Title */}
                  <Typography
                    variant={isMobile ? 'h3' : 'h1'}
                    sx={{
                      color: '#fff',
                      fontWeight: 800,
                      lineHeight: 1.1,
                      mb: 3,
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    }}
                  >
                    Andaimes Pini
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      color: colors.accent,
                      fontWeight: 600,
                      mb: 3,
                      fontSize: { xs: '1.2rem', md: '1.5rem' },
                    }}
                  >
                    Locação de Andaimes e Escoras
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 400,
                      lineHeight: 1.7,
                      mb: 4,
                      maxWidth: 550,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                  >
                    Soluções completas em locação de equipamentos para construção civil. 
                    Atendemos toda a <strong style={{ color: colors.gold }}>Região dos Lagos</strong> com 
                    qualidade, segurança e os melhores preços.
                  </Typography>

                  {/* Benefits chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
                    {benefits.map((benefit, index) => (
                      <Chip
                        key={index}
                        icon={React.cloneElement(benefit.icon, { sx: { color: `${colors.accent} !important`, fontSize: 20 } })}
                        label={benefit.text}
                        sx={{
                          backgroundColor: 'rgba(76, 175, 80, 0.15)',
                          color: '#fff',
                          border: `1px solid ${colors.accent}40`,
                          fontSize: '0.85rem',
                          py: 2,
                        }}
                      />
                    ))}
                  </Box>

                  {/* CTA Buttons */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<WhatsAppIcon />}
                      href="https://wa.me/5522999999999"
                      target="_blank"
                      sx={{
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '1rem',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 28px rgba(37, 211, 102, 0.4)',
                        },
                      }}
                    >
                      Solicitar Orçamento
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      to="/login"
                      endIcon={<ArrowIcon />}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.5)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '1rem',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#fff',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Área do Cliente
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            {/* Hero Image/Illustration */}
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Fade in timeout={1000}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 350,
                      height: 350,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.accent}30 0%, ${colors.primary}20 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        width: '120%',
                        height: '120%',
                        borderRadius: '50%',
                        border: `2px dashed ${colors.accent}40`,
                        animation: 'spin 30s linear infinite',
                      },
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  >
                    <ConstructionIcon 
                      sx={{ 
                        fontSize: 180, 
                        color: colors.accent,
                        filter: 'drop-shadow(0 10px 30px rgba(76, 175, 80, 0.3))',
                      }} 
                    />
                  </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>

        {/* Scroll indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 50,
              borderRadius: 15,
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              justifyContent: 'center',
              pt: 1,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 10,
                borderRadius: 3,
                backgroundColor: '#fff',
                animation: 'scroll 2s infinite',
                '@keyframes scroll': {
                  '0%': { opacity: 1, transform: 'translateY(0)' },
                  '100%': { opacity: 0, transform: 'translateY(20px)' },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Services Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: mode === 'light' ? '#f8faf8' : '#0a0a0a',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: colors.primary,
                fontWeight: 700,
                letterSpacing: 3,
                fontSize: '0.9rem',
              }}
            >
              NOSSOS SERVIÇOS
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: mode === 'light' ? '#1a1a2e' : '#fff',
                mt: 1,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Equipamentos de Qualidade
            </Typography>
            <Typography
              sx={{
                color: mode === 'light' ? '#666' : 'rgba(255,255,255,0.7)',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem',
              }}
            >
              Oferecemos uma linha completa de equipamentos para construção civil, 
              com manutenção constante e garantia de segurança.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={600 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 4,
                      border: mode === 'light' 
                        ? '1px solid rgba(0,0,0,0.08)' 
                        : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: mode === 'light' ? '#fff' : '#111',
                      boxShadow: mode === 'light' 
                        ? '0 4px 20px rgba(0,0,0,0.05)' 
                        : '0 4px 20px rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: mode === 'light'
                          ? `0 20px 40px rgba(27, 94, 32, 0.15)`
                          : `0 20px 40px rgba(76, 175, 80, 0.2)`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '20px',
                          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          color: '#fff',
                          boxShadow: `0 8px 24px rgba(27, 94, 32, 0.3)`,
                        }}
                      >
                        {service.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: mode === 'light' ? '#1a1a2e' : '#fff',
                        }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: mode === 'light' ? '#666' : 'rgba(255,255,255,0.7)',
                          lineHeight: 1.7,
                        }}
                      >
                        {service.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Coverage Area Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: mode === 'light'
            ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
            : 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="overline"
                sx={{
                  color: colors.accent,
                  fontWeight: 700,
                  letterSpacing: 3,
                  fontSize: '0.9rem',
                }}
              >
                ÁREA DE ATENDIMENTO
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: '#fff',
                  mt: 1,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                Região dos Lagos
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  mb: 4,
                }}
              >
                Atendemos exclusivamente a Região dos Lagos do Rio de Janeiro, 
                garantindo agilidade na entrega e suporte próximo ao cliente. 
                Nossa base está localizada em <strong>Unamar, Cabo Frio</strong>.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocationIcon sx={{ color: colors.accent, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    Endereço
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Unamar, Cabo Frio - RJ
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PhoneIcon sx={{ color: colors.accent, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    Telefone / WhatsApp
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    (22) 99999-9999
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4,
                  p: 4,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckIcon sx={{ color: colors.accent }} />
                  Cidades Atendidas
                </Typography>
                <Grid container spacing={2}>
                  {cities.map((city, index) => (
                    <Grid item xs={6} key={index}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          py: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: colors.accent,
                          }}
                        />
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          {city}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          backgroundColor: mode === 'light' ? '#fff' : '#0a0a0a',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: mode === 'light' ? '#1a1a2e' : '#fff',
              mb: 2,
              fontSize: { xs: '1.8rem', md: '2.5rem' },
            }}
          >
            Pronto para começar sua obra?
          </Typography>
          <Typography
            sx={{
              color: mode === 'light' ? '#666' : 'rgba(255,255,255,0.7)',
              fontSize: '1.1rem',
              mb: 4,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Entre em contato conosco e solicite um orçamento sem compromisso. 
            Respondemos rapidamente!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<WhatsAppIcon />}
              href="https://wa.me/5522999999999"
              target="_blank"
              sx={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.1rem',
                px: 5,
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Falar no WhatsApp
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<PhoneIcon />}
              href="tel:+5522999999999"
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                fontWeight: 600,
                fontSize: '1.1rem',
                px: 5,
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: `${colors.primary}10`,
                },
              }}
            >
              Ligar Agora
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          backgroundColor: mode === 'light' ? '#1a1a2e' : '#050505',
          borderTop: `1px solid ${mode === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 45,
                    height: 45,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ConstructionIcon sx={{ color: '#fff', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: '#fff', fontWeight: 700 }}
                  >
                    Andaimes Pini
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Locação de Andaimes e Escoras
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  textAlign: { xs: 'center', md: 'right' },
                  fontSize: '0.9rem',
                }}
              >
                © {new Date().getFullYear()} Andaimes Pini. Todos os direitos reservados.
                <br />
                Unamar - Cabo Frio, RJ | Região dos Lagos
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
