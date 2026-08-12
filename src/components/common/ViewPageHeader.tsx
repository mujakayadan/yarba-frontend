import React from 'react';
import { Box, Typography } from '@mui/material';

interface ViewPageHeaderProps {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export const ViewPageHeader: React.FC<ViewPageHeaderProps> = ({
  title,
  description,
  action,
  secondaryAction,
}) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      mb: 3,
      gap: 2,
      flexWrap: 'wrap',
    }}
  >
    <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
      <Typography component="h1" variant="h5">
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
          {description}
        </Typography>
      )}
    </Box>
    {(secondaryAction || action) && (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {secondaryAction}
        {action}
      </Box>
    )}
  </Box>
);
