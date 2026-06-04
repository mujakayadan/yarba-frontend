import React, { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppQueryProvider } from './providers/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import { isDev } from './config/env';

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics }))
);

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
          <ToastProvider>
            <AuthProvider>
              <ProfileProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </ProfileProvider>
            </AuthProvider>
          </ToastProvider>
        </AppQueryProvider>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
