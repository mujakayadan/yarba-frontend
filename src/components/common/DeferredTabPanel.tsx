import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface DeferredTabPanelProps {
  children: React.ReactNode;
  renderedTab: number;
  tabIndex: number;
  idPrefix: string;
  isPending?: boolean;
  padding?: number | { xs?: number; sm?: number };
}

export const DeferredTabPanel: React.FC<DeferredTabPanelProps> = ({
  children,
  renderedTab,
  tabIndex,
  idPrefix,
  isPending = false,
  padding = 3,
}) => {
  if (renderedTab !== tabIndex) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-tabpanel-${tabIndex}`}
      aria-labelledby={`${idPrefix}-tab-${tabIndex}`}
      aria-busy={isPending}
    >
      <Box
        sx={{
          p: padding,
          minHeight: 80,
          opacity: isPending ? 0.6 : 1,
          transition: 'opacity 150ms',
        }}
      >
        {children}
      </Box>
    </div>
  );
};

export const TabPanelFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress size={32} />
  </Box>
);
