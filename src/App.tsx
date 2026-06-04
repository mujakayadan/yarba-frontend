import React, { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppQueryProvider } from './providers/QueryProvider';
import { AppThemeProvider } from './contexts/AppearanceContext';
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
      <AppQueryProvider>
        <ToastProvider>
          <AuthProvider>
            <ProfileProvider>
              <AppThemeProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
                <Suspense fallback={null}>
                  <Analytics />
                </Suspense>
              </AppThemeProvider>
            </ProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </AppQueryProvider>
    </ErrorBoundary>
  );
};

export default App;
