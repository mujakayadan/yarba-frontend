import React from 'react';
import { Box } from '@mui/material';
import FirebaseAuth from '../components/auth/auth';
import Footer from '../components/layout/Footer';
import BrandedAuthAppBar from '../components/layout/BrandedAuthAppBar';
import { SAFE_AREA } from '../theme/safeArea';

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
      <BrandedAuthAppBar />

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
            xs: `max(16px, ${SAFE_AREA.left})`,
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
