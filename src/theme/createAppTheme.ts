import { createTheme, type PaletteMode } from '@mui/material/styles';
import { brandColors } from './tokens';

const sharedTypography = {
  fontFamily: '"Söhne Breit", "Söhne", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  h1: { fontWeight: 600, fontSize: '2.5rem' },
  h2: { fontWeight: 600, fontSize: '2rem' },
  h3: { fontWeight: 600, fontSize: '1.75rem' },
  h4: { fontWeight: 600, fontSize: '1.5rem' },
  h5: { fontWeight: 600, fontSize: '1.25rem' },
  h6: { fontWeight: 600, fontSize: '1rem' },
  subtitle1: { fontWeight: 500, fontSize: '1rem' },
  subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
  body1: { fontWeight: 400, fontSize: '1rem' },
  body2: { fontWeight: 400, fontSize: '0.875rem' },
  button: { fontWeight: 600, fontSize: '0.875rem', textTransform: 'none' as const },
};

const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: brandColors.primaryMain,
    light: brandColors.primaryLight,
    dark: brandColors.primaryDark,
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: brandColors.secondaryMain,
    light: brandColors.secondaryLight,
    dark: brandColors.secondaryDark,
    contrastText: '#FFFFFF',
  },
  accent: {
    main: brandColors.accentMain,
    light: brandColors.accentLight,
    dark: brandColors.accentDark,
    contrastText: '#FFFFFF',
  },
  background: {
    default: brandColors.backgroundDefault,
    paper: brandColors.backgroundPaper,
  },
  text: {
    primary: brandColors.textPrimary,
    secondary: brandColors.textSecondary,
  },
  error: { main: brandColors.errorMain },
  warning: { main: brandColors.warningMain },
  info: { main: brandColors.infoMain },
  success: { main: brandColors.successMain },
  divider: 'rgba(0, 0, 0, 0.06)',
};

const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: brandColors.primaryLight,
    light: '#6B9BD4',
    dark: brandColors.primaryMain,
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: brandColors.secondaryLight,
    light: '#9B98EB',
    dark: brandColors.secondaryMain,
    contrastText: '#FFFFFF',
  },
  accent: {
    main: brandColors.accentLight,
    light: '#F0998C',
    dark: brandColors.accentMain,
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#1A202C',
    paper: '#2D3748',
  },
  text: {
    primary: '#F7FAFC',
    secondary: '#A0AEC0',
  },
  error: { main: '#FC8181' },
  warning: { main: '#F6AD55' },
  info: { main: '#4FD1C5' },
  success: { main: '#68D391' },
  divider: 'rgba(255, 255, 255, 0.12)',
};

const baseShadows = createTheme().shadows;

export const createAppTheme = (mode: PaletteMode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: isDark ? darkPalette : lightPalette,
    typography: sharedTypography,
    shape: { borderRadius: 12 },
    shadows: baseShadows,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 20px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0px 6px 12px rgba(63, 114, 175, ${isDark ? 0.35 : 0.2})`,
            },
          },
          contained: {
            boxShadow: `0px 3px 6px rgba(63, 114, 175, ${isDark ? 0.35 : 0.2})`,
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: 0,
            paddingRight: 0,
            maxWidth: '100% !important',
          },
        },
      },
      MuiSnackbar: {
        defaultProps: {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark
              ? '0px 6px 16px rgba(0, 0, 0, 0.4)'
              : '0px 6px 16px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0px 12px 24px rgba(0, 0, 0, 0.5)'
                : '0px 12px 24px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 16 },
          elevation1: {
            boxShadow: isDark
              ? '0px 3px 6px rgba(0, 0, 0, 0.4)'
              : '0px 3px 6px rgba(0, 0, 0, 0.08)',
          },
          elevation2: {
            boxShadow: isDark
              ? '0px 6px 12px rgba(0, 0, 0, 0.45)'
              : '0px 6px 12px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.08)',
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            color: '#FFFFFF',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: '56px',
            '@media (min-width: 600px)': { minHeight: '56px' },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(76, 132, 207, 0.2)' : 'rgba(63, 114, 175, 0.1)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(76, 132, 207, 0.28)' : 'rgba(63, 114, 175, 0.15)',
              },
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(76, 132, 207, 0.12)' : 'rgba(63, 114, 175, 0.05)',
              transform: 'translateX(4px)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'scale(1.1)' },
          },
        },
      },
    },
  });
};
