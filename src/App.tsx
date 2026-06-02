import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Analytics } from '@vercel/analytics/react';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { AppQueryProvider } from './providers/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import { isDev } from './config/env';

const App: React.FC = () => {
  React.useEffect(() => {
    if (isDev) {
      console.log('Yarba frontend running in development mode');
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppQueryProvider>
          <AuthProvider>
            <ProfileProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ProfileProvider>
          </AuthProvider>
        </AppQueryProvider>
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
