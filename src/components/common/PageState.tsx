import React from 'react';
import { Box, Paper, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface PageLoadingStateProps {
  label?: string;
}

export const PageLoadingState: React.FC<PageLoadingStateProps> = ({ label = 'Loading page…' }) => (
  <Box
    role="status"
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      my: 4,
    }}
  >
    <CircularProgress />
    <Typography color="text.secondary">{label}</Typography>
  </Box>
);

interface PageErrorStateProps {
  title?: string;
  message: string;
  backLabel?: string;
  onBack?: () => void;
}

export const PageErrorState: React.FC<PageErrorStateProps> = ({
  title,
  message,
  backLabel,
  onBack,
}) => (
  <Box sx={{ p: 3 }}>
    <Paper elevation={3} sx={{ p: 4 }}>
      {title && (
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      )}
      <Alert severity="error" sx={{ mb: onBack ? 3 : 0 }}>
        {message}
      </Alert>
      {onBack && backLabel && (
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          {backLabel}
        </Button>
      )}
    </Paper>
  </Box>
);
