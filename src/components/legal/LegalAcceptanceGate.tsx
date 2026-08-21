import React, { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LegalAgreementFields from './LegalAgreementFields';
import { acceptCurrentLegalDocuments } from '../../services/legalService';
import { legalKeys } from '../../lib/queryKeys';
import { extractApiErrorMessage } from '../../utils/apiErrors';
import { useAuth } from '../../contexts/AuthContext';

const LegalAcceptanceGate: React.FC = () => {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const mutation = useMutation({
    mutationFn: acceptCurrentLegalDocuments,
    onSuccess: (status) => {
      queryClient.setQueryData(legalKeys.acceptance(), status);
    },
  });

  const handleAccept = () => {
    if (!confirmed) {
      setValidationError(true);
      return;
    }
    mutation.mutate();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 680, p: { xs: 3, md: 5 } }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Review Yarba’s updated policies
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            marginBottom: '16px',
          }}
        >
          We materially updated our policies to cover public portfolio sites, AI processing,
          application automation, content safety, and privacy controls. Review the linked documents
          before continuing.
        </Typography>
        {mutation.isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {extractApiErrorMessage(
              mutation.error,
              'We could not record your acknowledgement. Please try again.'
            )}
          </Alert>
        ) : null}
        <LegalAgreementFields
          checked={confirmed}
          disabled={mutation.isPending}
          error={validationError}
          onChange={(checked) => {
            setConfirmed(checked);
            if (checked) {
              setValidationError(false);
            }
          }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={handleAccept}
          disabled={mutation.isPending}
          startIcon={
            mutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined
          }
          sx={{ mt: 3 }}
        >
          Accept and continue
        </Button>
        <Button
          fullWidth
          color="inherit"
          onClick={() => void signOut()}
          disabled={mutation.isPending}
          sx={{ mt: 1 }}
        >
          Decline and sign out
        </Button>
      </Paper>
    </Box>
  );
};

export default LegalAcceptanceGate;
