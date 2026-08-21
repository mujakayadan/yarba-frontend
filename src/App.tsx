import React, { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppQueryProvider } from './providers/QueryProvider';
import { AppThemeProvider } from './contexts/AppearanceContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import { isDev } from './config/env';
import {
  PrivacyPreferencesProvider,
  usePrivacyPreferences,
} from './contexts/PrivacyPreferencesContext';

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics }))
);

const OptionalAnalytics: React.FC = () => {
  const { analyticsEnabled } = usePrivacyPreferences();
  return analyticsEnabled ? (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  ) : null;
};

const UserPrivacyPreferences: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return (
    <PrivacyPreferencesProvider key={user?.id ?? 'anonymous'} subjectId={user?.id}>
      {children}
    </PrivacyPreferencesProvider>
  );
};

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
            <UserPrivacyPreferences>
              <ProfileProvider>
                <AppThemeProvider>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                  <OptionalAnalytics />
                </AppThemeProvider>
              </ProfileProvider>
            </UserPrivacyPreferences>
          </AuthProvider>
        </ToastProvider>
      </AppQueryProvider>
    </ErrorBoundary>
  );
};

export default App;
