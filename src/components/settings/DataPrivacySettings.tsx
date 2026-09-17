import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Download, DeleteForever, Undo } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelAccountDeletion,
  getAccountDeletionStatus,
  getAccountExportStatus,
  requestAccountDeletion,
  requestAccountExport,
} from '../../services/accountService';
import { accountKeys } from '../../lib/queryKeys';
import { usePrivacyPreferences } from '../../contexts/PrivacyPreferencesContext';
import { extractApiErrorMessage } from '../../utils/apiErrors';
import { useAuth } from '../../contexts/AuthContext';
import { env } from '../../config/env';
import { LEGAL_NAV_ITEMS } from '../../content/legalDocuments';
import { openUrl } from '../../utils/openUrl';
import { SAFE_AREA } from '../../theme/safeArea';

const SETTINGS_LEGAL_LINKS = LEGAL_NAV_ITEMS.filter(
  (item) =>
    item.key === 'terms' ||
    item.key === 'privacy' ||
    item.key === 'acceptable-use' ||
    item.key === 'ai-data-use'
);

const ACTION_BUTTON_SX = { minHeight: 44 };

const formatDate = (value?: string): string =>
  value ? new Date(value).toLocaleString() : 'Not available';

const DataPrivacySettings: React.FC = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('sm'));
  const { analyticsEnabled, setAnalyticsEnabled } = usePrivacyPreferences();
  const { user, signOut } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [deletionValidationError, setDeletionValidationError] = useState<string | null>(null);
  const completedDeletionHandled = useRef(false);

  const exportStatus = useQuery({
    queryKey: accountKeys.export(),
    queryFn: getAccountExportStatus,
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' || query.state.data?.status === 'processing'
        ? 5000
        : false,
  });
  const deletionStatus = useQuery({
    queryKey: accountKeys.deletion(),
    queryFn: getAccountDeletionStatus,
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' || query.state.data?.status === 'processing'
        ? 5000
        : false,
  });

  const exportMutation = useMutation({
    mutationFn: requestAccountExport,
    onSuccess: (status) => queryClient.setQueryData(accountKeys.export(), status),
  });
  const deleteMutation = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: (status) => {
      queryClient.setQueryData(accountKeys.deletion(), status);
      setDeleteDialogOpen(false);
      setConfirmation('');
      setCurrentPassword('');
    },
  });
  const cancelMutation = useMutation({
    mutationFn: cancelAccountDeletion,
    onSuccess: (status) => queryClient.setQueryData(accountKeys.deletion(), status),
  });

  useEffect(() => {
    if (deletionStatus.data?.status === 'completed' && !completedDeletionHandled.current) {
      completedDeletionHandled.current = true;
      void signOut();
    }
  }, [deletionStatus.data?.status, signOut]);

  const requiresPassword = env.nativeAuth && user?.auth_provider === 'password';
  const handleDeletionRequest = () => {
    setDeletionValidationError(null);
    if (confirmation !== 'DELETE') {
      setDeletionValidationError('Type DELETE exactly to confirm this request.');
      return;
    }
    if (requiresPassword && !currentPassword) {
      setDeletionValidationError('Enter your current password to verify this request.');
      return;
    }
    deleteMutation.mutate({
      confirmation: 'DELETE',
      current_password: currentPassword || undefined,
    });
  };

  const activeDeletion =
    deletionStatus.data?.status === 'pending' || deletionStatus.data?.status === 'processing';

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6">Optional analytics</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            marginBottom: '16px',
          }}
        >
          Help Yarba understand page and feature usage through Vercel Analytics. Authentication,
          security, and necessary session storage remain active regardless of this choice.
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
          }
          label="Allow optional product analytics"
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Optional analytics stay off unless you enable them here. Native builds never load Vercel
          Analytics.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6">Download your data</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            marginBottom: '16px',
          }}
        >
          Request a portable archive of account, profile, portfolio, document, application, website,
          and stored chat information. Raw passwords, credentials, and token secrets are never
          included.
        </Typography>
        {exportStatus.isError || exportMutation.isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {extractApiErrorMessage(
              exportMutation.error ?? exportStatus.error,
              'We could not retrieve your export status.'
            )}
          </Alert>
        ) : null}
        {exportStatus.data?.status === 'ready' && exportStatus.data.download_url ? (
          <Stack
            spacing={1}
            sx={{
              alignItems: 'flex-start',
            }}
          >
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                if (exportStatus.data?.download_url) {
                  void openUrl(exportStatus.data.download_url);
                }
              }}
              sx={ACTION_BUTTON_SX}
            >
              Download archive
            </Button>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
              }}
            >
              Available until {formatDate(exportStatus.data.expires_at)}
            </Typography>
          </Stack>
        ) : (
          <Button
            variant="outlined"
            onClick={() => exportMutation.mutate()}
            disabled={
              exportMutation.isPending ||
              exportStatus.data?.status === 'pending' ||
              exportStatus.data?.status === 'processing'
            }
            sx={ACTION_BUTTON_SX}
            startIcon={
              exportMutation.isPending ||
              exportStatus.data?.status === 'pending' ||
              exportStatus.data?.status === 'processing' ? (
                <CircularProgress size={18} />
              ) : (
                <Download />
              )
            }
          >
            {exportStatus.data?.status === 'pending' || exportStatus.data?.status === 'processing'
              ? 'Preparing archive…'
              : 'Request data export'}
          </Button>
        )}
      </Paper>

      <Paper id="account-deletion" variant="outlined" sx={{ p: 3, borderColor: 'error.main' }}>
        <Typography
          variant="h6"
          sx={{
            color: 'error.main',
          }}
        >
          Delete account
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            marginBottom: '16px',
          }}
        >
          Account deletion removes your public website, documents, profile, application data, stored
          conversations, tokens, and associated files after the displayed grace period. Records
          under a valid legal hold may be retained or pseudonymized.
        </Typography>
        {deletionStatus.isError || deleteMutation.isError || cancelMutation.isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {extractApiErrorMessage(
              deleteMutation.error ?? cancelMutation.error ?? deletionStatus.error,
              'We could not update your deletion request.'
            )}
          </Alert>
        ) : null}
        {activeDeletion ? (
          <Alert
            severity="warning"
            action={
              deletionStatus.data?.can_cancel ? (
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<Undo />}
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  sx={ACTION_BUTTON_SX}
                >
                  Cancel deletion
                </Button>
              ) : undefined
            }
          >
            Deletion is scheduled for {formatDate(deletionStatus.data?.scheduled_for)}.
          </Alert>
        ) : (
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteForever />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={ACTION_BUTTON_SX}
          >
            Request account deletion
          </Button>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6">Policies</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            marginBottom: '16px',
          }}
        >
          Terms, privacy, and related notices stay available in the app, including before you sign
          in.
        </Typography>
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          {SETTINGS_LEGAL_LINKS.map((item) => (
            <Link key={item.key} component={RouterLink} to={item.path}>
              {item.label}
            </Link>
          ))}
        </Stack>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => (deleteMutation.isPending ? undefined : setDeleteDialogOpen(false))}
        fullWidth
        fullScreen={compact}
        maxWidth="sm"
        aria-labelledby="delete-account-title"
        slotProps={{
          paper: {
            sx: compact
              ? {
                  pt: SAFE_AREA.top,
                  pl: SAFE_AREA.left,
                  pr: SAFE_AREA.right,
                  pb: `calc(${SAFE_AREA.bottom} + var(--keyboard-inset, 0px))`,
                }
              : undefined,
          },
        }}
      >
        <DialogTitle id="delete-account-title">Request permanent account deletion?</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This begins deletion of your public website and all Yarba account data. You can cancel
            only during the grace period.
          </Alert>
          {deletionValidationError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deletionValidationError}
            </Alert>
          ) : null}
          <TextField
            fullWidth
            label="Type DELETE to confirm"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={deleteMutation.isPending}
            sx={{ mb: 2 }}
          />
          {requiresPassword ? (
            <TextField
              fullWidth
              type="password"
              label="Current password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={deleteMutation.isPending}
              autoComplete="current-password"
            />
          ) : null}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteMutation.isPending}
            sx={ACTION_BUTTON_SX}
          >
            Keep account
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeletionRequest}
            disabled={deleteMutation.isPending}
            sx={ACTION_BUTTON_SX}
            startIcon={
              deleteMutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined
            }
          >
            Request deletion
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DataPrivacySettings;
