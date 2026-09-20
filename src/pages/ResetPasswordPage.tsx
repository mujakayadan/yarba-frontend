import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Grid from '../mui/Grid';
import BrandedAuthAppBar from '../components/layout/BrandedAuthAppBar';
import AccountRecoveryHelp from '../components/auth/AccountRecoveryHelp';
import { ACCOUNT_RECOVERY_TEXT } from '../content/accountRecovery';
import { resetPassword } from '../services/authService';
import { AUTH_ERROR_MESSAGES, extractApiErrorMessage } from '../utils/apiErrors';
import { NATIVE_PASSWORD_POLICY_MESSAGE, validateNativePassword } from '../utils/passwordPolicy';

const PAGE_TEXT = {
  title: 'Choose a new password',
  recoveryTitle: 'Request a new reset link',
  description: 'Pick a password you have not used on YARBA before.',
  newPasswordLabel: 'New password',
  confirmPasswordLabel: 'Confirm new password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  submit: 'Reset password',
  submitting: 'Resetting…',
  success: 'Your password has been reset. You can now sign in.',
  continueToSignIn: 'Continue to sign in',
  requestNewLink: ACCOUNT_RECOVERY_TEXT.requestNewPassword,
  missingLink: ACCOUNT_RECOVERY_TEXT.resetMissing,
  mismatch: 'Passwords do not match.',
  submitError: AUTH_ERROR_MESSAGES.invalid_or_expired_action_token,
} as const;

const ResetPasswordPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [linkUnusable, setLinkUnusable] = useState(!token);
  const [error, setError] = useState<string | null>(token ? null : PAGE_TEXT.missingLink);

  useEffect(() => {
    if (!searchParams.has('token')) {
      return;
    }

    const redactedParams = new URLSearchParams(searchParams);
    redactedParams.delete('token');
    setSearchParams(redactedParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError(PAGE_TEXT.missingLink);
      return;
    }
    const passwordError = validateNativePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(PAGE_TEXT.mismatch);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (submitError: unknown) {
      const message = extractApiErrorMessage(submitError, PAGE_TEXT.submitError);
      setError(message);
      if (message === PAGE_TEXT.submitError || message === PAGE_TEXT.missingLink) {
        setLinkUnusable(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordType = showPassword ? 'text' : 'password';
  const visibilityLabel = showPassword ? PAGE_TEXT.hidePassword : PAGE_TEXT.showPassword;
  const fieldsDisabled = isSubmitting || !token;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <BrandedAuthAppBar />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Grid
          container
          spacing={0}
          sx={{
            maxWidth: 880,
            width: '100%',
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              order: { xs: 2, md: 1 },
              bgcolor: '#F3EFE6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: 180, md: 420 },
              p: { xs: 2, md: 3 },
            }}
          >
            <Box
              component="img"
              src="/reset-password.svg"
              alt=""
              sx={{
                width: '100%',
                maxWidth: { xs: 220, md: 320 },
                height: 'auto',
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              order: { xs: 1, md: 2 },
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Paper
              component="section"
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4.5 },
                width: '100%',
                maxWidth: 420,
                mx: 'auto',
              }}
            >
              <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
                {success || !linkUnusable ? PAGE_TEXT.title : PAGE_TEXT.recoveryTitle}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                {success || !linkUnusable
                  ? PAGE_TEXT.description
                  : (error ?? PAGE_TEXT.missingLink)}
              </Typography>

              {success ? (
                <>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {PAGE_TEXT.success}
                  </Alert>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    fullWidth
                    sx={{ minHeight: 44 }}
                  >
                    {PAGE_TEXT.continueToSignIn}
                  </Button>
                </>
              ) : linkUnusable ? (
                <>
                  <Alert severity="error" sx={{ mb: 2 }} role="alert">
                    {error ?? PAGE_TEXT.missingLink}
                  </Alert>
                  <Button
                    component={RouterLink}
                    to="/forgot-password"
                    variant="contained"
                    fullWidth
                    sx={{ minHeight: 44 }}
                  >
                    {PAGE_TEXT.requestNewLink}
                  </Button>
                  <Box sx={{ mt: 3 }}>
                    <AccountRecoveryHelp />
                  </Box>
                </>
              ) : (
                <>
                  {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  ) : null}
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                      required
                      fullWidth
                      label={PAGE_TEXT.newPasswordLabel}
                      type={passwordType}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={fieldsDisabled}
                      helperText={NATIVE_PASSWORD_POLICY_MESSAGE}
                      sx={{ mb: 2 }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={visibilityLabel}
                                edge="end"
                                onClick={() => setShowPassword((visible) => !visible)}
                              >
                                {showPassword ? (
                                  <VisibilityOffOutlinedIcon />
                                ) : (
                                  <VisibilityOutlinedIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <TextField
                      required
                      fullWidth
                      label={PAGE_TEXT.confirmPasswordLabel}
                      type={passwordType}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={fieldsDisabled}
                      error={Boolean(confirmPassword && newPassword !== confirmPassword)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={fieldsDisabled}
                      startIcon={
                        isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined
                      }
                      sx={{ mt: 2.5, minHeight: 44 }}
                    >
                      {isSubmitting ? PAGE_TEXT.submitting : PAGE_TEXT.submit}
                    </Button>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <Link component={RouterLink} to="/forgot-password" variant="body2">
                      {PAGE_TEXT.requestNewLink}
                    </Link>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
