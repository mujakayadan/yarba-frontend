import { alpha, type Theme } from '@mui/material/styles';
import type { NavVariant } from '../../theme/appearance';
import { drawerGradient } from '../../theme/tokens';

export const getDrawerNavItemSx = (navVariant: NavVariant) => {
  if (navVariant === 'gradient') {
    return {
      minHeight: 48,
      justifyContent: 'initial' as const,
      px: 2.5,
      py: 1,
      ml: 1,
      mr: 1,
      borderRadius: 2,
      transition: 'background-color 0.2s ease-in-out',
      '&.Mui-selected': {
        backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.25) !important',
        },
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
      },
    };
  }

  return {
    minHeight: 48,
    justifyContent: 'initial' as const,
    px: 2.5,
    py: 1,
    ml: 1,
    mr: 1,
    borderRadius: 2,
    transition: 'background-color 0.2s ease-in-out',
    '&.Mui-selected': {
      backgroundColor: (t: Theme) => alpha(t.palette.primary.main, 0.12),
      '&:hover': {
        backgroundColor: (t: Theme) => alpha(t.palette.primary.main, 0.18),
      },
    },
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  };
};

export const getDrawerNavIconSx = (navVariant: NavVariant, selected: boolean) => {
  if (navVariant === 'gradient') {
    return {
      minWidth: 0,
      justifyContent: 'center',
      color: selected ? '#E05B49' : 'rgba(255, 255, 255, 0.8)',
      transition: 'none',
      fontSize: '1.5rem',
      '& .MuiSvgIcon-root': { fontSize: '1.5rem' },
    };
  }

  return {
    minWidth: 0,
    justifyContent: 'center',
    color: selected ? 'accent.main' : 'text.secondary',
    transition: 'color 0.2s ease-in-out',
    fontSize: '1.5rem',
    '& .MuiSvgIcon-root': { fontSize: '1.5rem' },
  };
};

export const getDrawerNavLabelSx = (navVariant: NavVariant) => {
  if (navVariant === 'gradient') {
    return {
      opacity: 1,
      display: 'block',
      color: 'common.white',
      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
      '& span': { transition: 'none !important' },
      maxWidth: '100%',
    };
  }

  return {
    opacity: 1,
    display: 'block',
    color: 'text.primary',
    '& span': { transition: 'none !important' },
    maxWidth: '100%',
  };
};

export const getDrawerPaperSx = (navVariant: NavVariant) => {
  if (navVariant === 'gradient') {
    return {
      backgroundColor: '#ffffff',
      backgroundImage: drawerGradient(),
      borderRight: 0,
      boxShadow:
        '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)',
    };
  }

  return {
    bgcolor: 'background.paper',
    backgroundImage: 'none',
    borderRight: 1,
    borderColor: 'divider',
    boxShadow: 'none',
  };
};

export const getDrawerDividerSx = (navVariant: NavVariant) =>
  navVariant === 'gradient' ? { backgroundColor: 'rgba(255, 255, 255, 0.3)', my: 1 } : { my: 1 };
