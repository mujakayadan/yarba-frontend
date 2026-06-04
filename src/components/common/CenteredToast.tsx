import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useToast } from '../../contexts/ToastContext';

export const CenteredToast: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Toast Position Demo</Typography>

      <Button
        variant="contained"
        color="success"
        onClick={() =>
          showSuccess('Success! This notification is centered at the bottom of the screen.')
        }
      >
        Show Success Toast (Bottom)
      </Button>

      <Button
        variant="contained"
        color="error"
        onClick={() =>
          showError('Error! This notification is centered at the bottom of the screen.')
        }
      >
        Show Error Toast (Bottom)
      </Button>

      <Button
        variant="contained"
        color="info"
        onClick={() => showInfo('This notification is centered at the bottom of the screen.')}
      >
        Show Info Toast (Bottom)
      </Button>
    </Box>
  );
};

export default CenteredToast;
