import React from 'react';
import { Box, Typography } from '@mui/material';

interface ViewPageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const ViewPageHeader: React.FC<ViewPageHeaderProps> = ({ title, action }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      gap: 1,
      flexWrap: 'wrap',
    }}
  >
    <Typography component="h1" variant="h5">
      {title}
    </Typography>
    {action}
  </Box>
);
