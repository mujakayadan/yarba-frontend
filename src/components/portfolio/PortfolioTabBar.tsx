import React, { type ComponentType } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

export interface PortfolioTabBarItem {
  label: string;
  icon: ComponentType;
}

interface PortfolioTabBarProps {
  tabValue: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  tabs: readonly PortfolioTabBarItem[];
  idPrefix: string;
  ariaLabel: string;
}

export const PortfolioTabBar: React.FC<PortfolioTabBarProps> = ({
  tabValue,
  onChange,
  tabs,
  idPrefix,
  ariaLabel,
}) => (
  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
    <Tabs value={tabValue} onChange={onChange} aria-label={ariaLabel} variant="fullWidth" centered>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        return (
          <Tab
            key={tab.label}
            icon={<Icon />}
            label={tab.label}
            id={`${idPrefix}-tab-${index}`}
            aria-controls={`${idPrefix}-tabpanel-${index}`}
          />
        );
      })}
    </Tabs>
  </Box>
);
