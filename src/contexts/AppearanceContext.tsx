import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme } from '../theme/createAppTheme';
import {
  type AppearanceMode,
  type NavVariant,
  getNavVariant,
  getPaletteMode,
  resolveAppearanceMode,
} from '../theme/appearance';
import { useUserProfile } from '../hooks/useUserProfile';

interface AppearanceContextValue {
  appearance: AppearanceMode;
  navVariant: NavVariant;
}

const AppearanceContext = createContext<AppearanceContextValue>({
  appearance: 'default',
  navVariant: 'gradient',
});

export const useAppearance = (): AppearanceContextValue => useContext(AppearanceContext);

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const { data: profile } = useUserProfile();
  const appearance = resolveAppearanceMode(profile?.system_preferences?.features);
  const navVariant = getNavVariant(appearance);
  const paletteMode = getPaletteMode(appearance);

  const theme = useMemo(() => createAppTheme(paletteMode), [paletteMode]);

  const contextValue = useMemo(() => ({ appearance, navVariant }), [appearance, navVariant]);

  return (
    <AppearanceContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppearanceContext.Provider>
  );
};
