import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Typography, Alert, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import LegalAcceptanceGate from '../legal/LegalAcceptanceGate';
import { getLegalAcceptanceStatus } from '../../services/legalService';
import { legalKeys } from '../../lib/queryKeys';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, isOfflineMode, setupRoute } = useAuth();
  const location = useLocation();
  const isLegalAccessExempt = location.pathname === '/settings/data-privacy';
  const legalAcceptance = useQuery({
    queryKey: legalKeys.acceptance(),
    queryFn: getLegalAcceptanceStatus,
    enabled: isAuthenticated && !isOfflineMode && !isLegalAccessExempt,
    staleTime: 5 * 60 * 1000,
  });

  // If the app is still loading auth state, show spinner
  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Handle offline mode more gracefully - if offline, show a message instead of redirecting
  if (isOfflineMode) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          p: 3,
        }}
      >
        <Alert severity="warning" sx={{ mb: 2, width: '100%', maxWidth: 500 }}>
          You appear to be offline. Some features may be limited.
        </Alert>

        {!isAuthenticated ? (
          <>
            <Typography variant="h6" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1">
              This page requires authentication, but we can't connect to our servers. Please check
              your internet connection and try again.
            </Typography>
            <Box mt={2}>
              <Navigate to="/login" state={{ from: location, offline: true }} replace />
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Connection required
            </Typography>
            <Typography variant="body1">
              Reconnect before opening protected Yarba data. This lets us verify your account and
              current policy status.
            </Typography>
          </>
        )}
      </Box>
    );
  }

  // Normal case - if not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLegalAccessExempt) {
    return <>{children}</>;
  }

  // If authenticated, check for pending setup step before rendering children
  if (setupRoute && location.pathname !== setupRoute) {
    return <Navigate to={setupRoute} replace />;
  }

  if (legalAcceptance.isPending) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress aria-label="Checking policy acknowledgement" />
      </Box>
    );
  }

  if (legalAcceptance.isError) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', p: 3, mt: 8 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void legalAcceptance.refetch()}>
              Retry
            </Button>
          }
        >
          We could not verify your policy acknowledgement. Retry to continue securely.
        </Alert>
      </Box>
    );
  }

  if (legalAcceptance.data.requires_acceptance) {
    return <LegalAcceptanceGate />;
  }

  // If authenticated and not loading, and no pending setup step, render the children components
  return <>{children}</>;
};
