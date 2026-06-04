import React from 'react';
import { Typography, Divider } from '@mui/material';

interface EditSectionHeaderProps {
  title: string;
  description?: string;
  first?: boolean;
}

export const EditSectionHeader: React.FC<EditSectionHeaderProps> = ({
  title,
  description,
  first = false,
}) => (
  <>
    <Typography variant="subtitle1" gutterBottom sx={{ mt: first ? 0 : 4 }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" paragraph>
        {description}
      </Typography>
    )}
    <Divider sx={{ mb: 3 }} />
  </>
);
