import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const OAuthCallbackPage: React.FC = () => {
  const { isAuthenticated, loading, setupRoute } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={setupRoute || '/dashboard'} replace />;
  }

  return <Navigate to="/login" replace state={{ from: location }} />;
};

export default OAuthCallbackPage;
