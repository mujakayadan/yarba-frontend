import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { ViewPageHeader } from '../../components/common/ViewPageHeader';
import { PagePrimaryButton } from '../../components/common/PagePrimaryButton';
import { PageLoadingState } from '../../components/common/PageState';
import { useToast } from '../../contexts/ToastContext';
import { useAgentTokenMutations, useAgentTokens } from '../../hooks/useAgentTokens';
import { extractApiErrorMessage } from '../../utils/apiErrors';
import {
  AGENT_TOKEN_SCOPES,
  DEFAULT_AGENT_TOKEN_SCOPES,
  type AgentTokenScope,
} from '../../types/application';

const formatDate = (value: string | null) => {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
};

const AgentTokensPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { data: tokens = [], isLoading, isError } = useAgentTokens();
  const { createMutation, revokeMutation } = useAgentTokenMutations();

  const [createOpen, setCreateOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('90');
  const [selectedScopes, setSelectedScopes] = useState<AgentTokenScope[]>(
    DEFAULT_AGENT_TOKEN_SCOPES
  );
  const [rawTokenDialog, setRawTokenDialog] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; label: string } | null>(null);

  const activeTokens = useMemo(() => tokens.filter((token) => token.is_active), [tokens]);

  const toggleScope = (scope: AgentTokenScope) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((item) => item !== scope) : [...prev, scope]
    );
  };

  const handleCreate = async () => {
    if (!label.trim()) {
      showError('Label is required');
      return;
    }
    if (selectedScopes.length === 0) {
      showError('Select at least one scope');
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        label: label.trim(),
        scopes: selectedScopes,
        expires_in_days: expiresInDays ? Number(expiresInDays) : null,
      });
      setCreateOpen(false);
      setLabel('');
      setSelectedScopes(DEFAULT_AGENT_TOKEN_SCOPES);
      setExpiresInDays('90');
      setRawTokenDialog(created.raw_token);
      showSuccess('Agent token created');
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to create agent token'));
    }
  };

  const handleCopyToken = async () => {
    if (!rawTokenDialog) {
      return;
    }
    try {
      await navigator.clipboard.writeText(rawTokenDialog);
      showSuccess('Token copied to clipboard');
    } catch {
      showError('Failed to copy token');
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) {
      return;
    }
    try {
      await revokeMutation.mutateAsync(revokeTarget.id);
      setRevokeTarget(null);
      showSuccess('Agent token revoked');
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to revoke agent token'));
    }
  };

  if (isLoading) {
    return <PageLoadingState />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <ViewPageHeader
        title="Agent Access Tokens"
        action={
          <PagePrimaryButton startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Create Token
          </PagePrimaryButton>
        }
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        Personal access tokens let automation agents act on your behalf within the scopes you
        choose. Treat them like passwords — the raw token is shown only once at creation.
      </Alert>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load agent tokens.
        </Alert>
      )}

      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Scopes</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Last used</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Stack spacing={1} alignItems="center">
                      <KeyIcon color="disabled" />
                      <Typography color="text.secondary">
                        No active agent tokens. Create one for your apply automation client.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                activeTokens.map((token) => (
                  <TableRow key={token.id} hover>
                    <TableCell>{token.label}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {token.scopes.map((scope) => (
                          <Chip key={scope} label={scope} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{formatDate(token.expires_at)}</TableCell>
                    <TableCell>{formatDate(token.last_used_at)}</TableCell>
                    <TableCell>{formatDate(token.created_at)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Revoke token">
                        <IconButton
                          color="error"
                          onClick={() => setRevokeTarget({ id: token.id, label: token.label })}
                          aria-label={`Revoke ${token.label}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Button component={RouterLink} to="/user" variant="text">
          Back to account settings
        </Button>
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Agent Token</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="OpenClaw laptop"
              fullWidth
              required
            />
            <TextField
              label="Expires in (days)"
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              inputProps={{ min: 1, max: 365 }}
              fullWidth
              helperText="Leave empty for no expiry (not recommended)"
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Scopes
              </Typography>
              <FormGroup>
                {AGENT_TOKEN_SCOPES.map((scope) => (
                  <FormControlLabel
                    key={scope.value}
                    control={
                      <Checkbox
                        checked={selectedScopes.includes(scope.value)}
                        onChange={() => toggleScope(scope.value)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{scope.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {scope.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createMutation.isPending}
            startIcon={createMutation.isPending ? <CircularProgress size={18} /> : null}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(rawTokenDialog)}
        onClose={() => setRawTokenDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save your agent token</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Copy this token now. You will not be able to see it again.
          </DialogContentText>
          <TextField
            value={rawTokenDialog ?? ''}
            fullWidth
            multiline
            minRows={2}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopyToken} aria-label="Copy token">
                    <CopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setRawTokenDialog(null)}>
            I have saved it
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(revokeTarget)} onClose={() => setRevokeTarget(null)}>
        <DialogTitle>Revoke agent token?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Revoke &quot;{revokeTarget?.label}&quot;? Any automation using this token will stop
            working immediately.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRevoke}
            disabled={revokeMutation.isPending}
          >
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentTokensPage;
