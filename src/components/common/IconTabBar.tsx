import React, { type ComponentType } from 'react';
import { Box, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';

export interface IconTabBarItem {
  label: string;
  icon: ComponentType;
}

interface IconTabBarProps {
  tabValue: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  tabs: readonly IconTabBarItem[];
  idPrefix: string;
  ariaLabel: string;
}

export const IconTabBar: React.FC<IconTabBarProps> = ({
  tabValue,
  onChange,
  tabs,
  idPrefix,
  ariaLabel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={tabValue}
        onChange={onChange}
        aria-label={ariaLabel}
        variant={isMobile ? 'scrollable' : 'fullWidth'}
        centered={!isMobile}
        scrollButtons={isMobile ? 'auto' : false}
        allowScrollButtonsMobile={isMobile}
      >
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
};
