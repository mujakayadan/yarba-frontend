import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Grid from '../mui/Grid';
import { resetPassword } from '../services/authService';
import { headerGradient } from '../theme/tokens';
import { extractApiErrorMessage } from '../utils/apiErrors';
import { NATIVE_PASSWORD_POLICY_MESSAGE, validateNativePassword } from '../utils/passwordPolicy';

const PAGE_TEXT = {
  title: 'Choose a new password',
  description: 'Pick a password you have not used on YARBA before.',
  newPasswordLabel: 'New password',
  confirmPasswordLabel: 'Confirm new password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  submit: 'Reset password',
  submitting: 'Resetting…',
  success: 'Your password has been reset. You can now sign in.',
  continueToSignIn: 'Continue to sign in',
  requestNewLink: 'Request a new reset link',
  missingLink: 'This password reset link is invalid or incomplete.',
  mismatch: 'Passwords do not match.',
  submitError: 'Unable to reset your password. The link may have expired.',
} as const;

const ResetPasswordPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
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
      setError(extractApiErrorMessage(submitError, PAGE_TEXT.submitError));
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
      <AppBar
        position="sticky"
        sx={{
          backgroundImage: headerGradient(),
          boxShadow: 3,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 1.5, sm: 2 } }}>
          <RouterLink
            to="/"
            aria-label="YARBA home"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img src="/logo.svg" alt="YARBA" style={{ height: 44, width: 'auto' }} />
          </RouterLink>
        </Toolbar>
      </AppBar>

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
                {PAGE_TEXT.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                {PAGE_TEXT.description}
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
