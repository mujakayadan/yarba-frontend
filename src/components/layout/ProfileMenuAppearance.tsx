import React from 'react';
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Check as CheckIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppearance } from '../../contexts/AppearanceContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useUpdateAppearanceMode } from '../../hooks/useUpdateAppearanceMode';
import { APPEARANCE_MODE_LABELS, type AppearanceMode } from '../../theme/appearance';
import { tabSearchParam } from '../../utils/tabUrl';

const APPEARANCE_MODES: AppearanceMode[] = ['default', 'light', 'dark'];

const PREFERENCES_EDIT_TAB = 1;

interface ProfileMenuAppearanceProps {
  onClose: () => void;
}

export const ProfileMenuAppearance: React.FC<ProfileMenuAppearanceProps> = ({ onClose }) => {
  const { appearance } = useAppearance();
  const { data: profile } = useUserProfile();
  const updateAppearance = useUpdateAppearanceMode();

  const handleSelect = (mode: AppearanceMode) => {
    if (!profile || mode === appearance || updateAppearance.isPending) {
      return;
    }
    updateAppearance.mutate({ profile, theme_mode: mode });
    onClose();
  };

  return (
    <>
      <Divider />
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Typography variant="overline" sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
          Appearance
        </Typography>
      </Box>
      {APPEARANCE_MODES.map((mode) => (
        <MenuItem
          key={mode}
          selected={appearance === mode}
          disabled={!profile || updateAppearance.isPending}
          onClick={() => handleSelect(mode)}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {updateAppearance.isPending && appearance === mode ? (
              <CircularProgress size={18} color="inherit" />
            ) : appearance === mode ? (
              <CheckIcon fontSize="small" />
            ) : (
              <PaletteIcon fontSize="small" sx={{ opacity: 0.5 }} />
            )}
          </ListItemIcon>
          <ListItemText primary={APPEARANCE_MODE_LABELS[mode]} />
        </MenuItem>
      ))}
      <MenuItem
        component={RouterLink}
        to={`/profile/edit${tabSearchParam(PREFERENCES_EDIT_TAB)}`}
        onClick={onClose}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="All preferences…" secondary="Profile settings" />
      </MenuItem>
    </>
  );
};
