import { useMediaQuery, useTheme } from '@mui/material';
import { compactDialogPaperSx } from '../../theme/mobileUi';

export const useCompactDialogProps = () => {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('sm'));

  return {
    fullWidth: true as const,
    fullScreen: compact,
    slotProps: compact
      ? {
          paper: { sx: compactDialogPaperSx },
        }
      : undefined,
  };
};
