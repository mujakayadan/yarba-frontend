import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { env } from '../config/env';
import { resetPassword } from '../services/authService';
import { extractApiErrorMessage } from '../utils/apiErrors';
import { NATIVE_PASSWORD_POLICY_MESSAGE, validateNativePassword } from '../utils/passwordPolicy';

const ResetPasswordPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : 'This password reset link is invalid or incomplete.'
  );

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
      setError('This password reset link is invalid or incomplete.');
      return;
    }
    const passwordError = env.nativeAuth
      ? validateNativePassword(newPassword)
      : newPassword.length < 6
        ? 'Your new password must be at least 6 characters.'
        : null;
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
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
      setError(
        extractApiErrorMessage(
          submitError,
          'Unable to reset your password. The link may have expired.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <RouterLink
            to="/"
            aria-label="YARBA home"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img src="/logo.svg" alt="YARBA" style={{ height: 50, width: 'auto' }} />
          </RouterLink>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm">
        <Box sx={{ mt: 14 }}>
          <Paper component="section" elevation={3} sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Choose a new password
            </Typography>
            {success ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Your password has been reset. You can now sign in.
                </Alert>
                <Button component={RouterLink} to="/login" variant="contained" fullWidth>
                  Continue to sign in
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
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={isSubmitting || !token}
                    helperText={
                      env.nativeAuth ? NATIVE_PASSWORD_POLICY_MESSAGE : 'Use at least 6 characters.'
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isSubmitting || !token}
                    error={Boolean(confirmPassword && newPassword !== confirmPassword)}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting || !token}
                    sx={{ mt: 3 }}
                  >
                    {isSubmitting ? 'Resetting…' : 'Reset password'}
                  </Button>
                </Box>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Link component={RouterLink} to="/forgot-password">
                    Request a new reset link
                  </Link>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ResetPasswordPage;
