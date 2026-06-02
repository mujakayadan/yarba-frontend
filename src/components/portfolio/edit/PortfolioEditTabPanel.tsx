import React from 'react';
import { Box } from '@mui/material';

interface PortfolioEditTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const PortfolioEditTabPanel: React.FC<PortfolioEditTabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`portfolio-edit-tabpanel-${index}`}
    aria-labelledby={`portfolio-edit-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);
