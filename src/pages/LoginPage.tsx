import React from 'react';
import { AppBar, Box, Toolbar } from '@mui/material';
import FirebaseAuth from '../components/auth/auth';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { headerGradient } from '../theme/tokens';

interface LoginPageProps {
  authMode?: 'login' | 'register';
}

const LoginPage: React.FC<LoginPageProps> = ({ authMode = 'login' }) => {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <AppBar
        position="sticky"
        sx={{
          backgroundImage: headerGradient(),
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 56, md: 64 },
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 1.5, sm: 2.5 },
          }}
        >
          <RouterLink
            to="/"
            aria-label="YARBA home"
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img src="/logo.svg" alt="YARBA" style={{ height: '46px', width: 'auto' }} />
          </RouterLink>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          px: {
            xs: 'max(16px, env(safe-area-inset-left, 0px))',
            sm: 3,
            md: 4,
          },
          py: { xs: 3, sm: 5, md: 6 },
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 15% 15%, rgba(94, 96, 206, 0.16), transparent 34%)'
              : 'radial-gradient(circle at 15% 15%, rgba(122, 172, 216, 0.22), transparent 34%)',
        }}
      >
        <FirebaseAuth initialMode={authMode} />
      </Box>
      <Footer />
    </Box>
  );
};

export default LoginPage;
