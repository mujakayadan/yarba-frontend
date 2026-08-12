import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  compact = false,
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: compact ? 3 : { xs: 3, sm: 5 },
      textAlign: 'center',
      borderStyle: 'dashed',
    }}
  >
    {icon && (
      <Box aria-hidden="true" sx={{ color: 'text.secondary', mb: 1 }}>
        {icon}
      </Box>
    )}
    <Typography component="h2" variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
      {description}
    </Typography>
    {(primaryAction || secondaryAction) && (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          flexWrap: 'wrap',
          mt: 3,
        }}
      >
        {primaryAction}
        {secondaryAction}
      </Box>
    )}
  </Paper>
);
