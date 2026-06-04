import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { PagePrimaryButton } from './PagePrimaryButton';

interface EditPageActionBarProps {
  backLabel: string;
  onBack: () => void;
  onSave: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
  saveLabel?: string;
}

export const EditPageActionBar: React.FC<EditPageActionBarProps> = ({
  backLabel,
  onBack,
  onSave,
  saving = false,
  saveDisabled = false,
  saveLabel = 'Save Changes',
}) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      gap: 1,
      flexWrap: 'wrap',
    }}
  >
    <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
      {backLabel}
    </Button>
    <PagePrimaryButton
      startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
      onClick={onSave}
      disabled={saving || saveDisabled}
    >
      {saveLabel}
    </PagePrimaryButton>
  </Box>
);
