import React, { useEffect, useRef, useState } from 'react';
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
import { confirmEmailVerification, requestEmailVerification } from '../services/authService';
import { extractApiErrorMessage } from '../utils/apiErrors';

const VerifyEmailPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '');
  const [email, setEmail] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    token ? null : 'This verification link is invalid or incomplete.'
  );
  const verificationInFlight = useRef(false);

  useEffect(() => {
    if (!searchParams.has('token')) {
      return;
    }

    const redactedParams = new URLSearchParams(searchParams);
    redactedParams.delete('token');
    setSearchParams(redactedParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleConfirm = async () => {
    if (!token || verificationInFlight.current || success) {
      return;
    }

    verificationInFlight.current = true;
    setError(null);
    setIsConfirming(true);
    try {
      await confirmEmailVerification(token);
      setSuccess('Your email address has been verified.');
    } catch (confirmationError: unknown) {
      setError(
        extractApiErrorMessage(
          confirmationError,
          'Unable to verify your email. The link may have expired.'
        )
      );
    } finally {
      verificationInFlight.current = false;
      setIsConfirming(false);
    }
  };

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError('Enter your email address.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsRequesting(true);
    try {
      await requestEmailVerification(normalizedEmail);
      setSuccess('If the account still needs verification, a new verification link will be sent.');
    } catch (requestError: unknown) {
      setError(extractApiErrorMessage(requestError, 'Unable to request a new verification link.'));
    } finally {
      setIsRequesting(false);
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
              Verify your email
            </Typography>
            {success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            ) : null}
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            {!token && !success ? (
              <Box component="form" onSubmit={handleRequest} noValidate>
                <TextField
                  required
                  fullWidth
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isRequesting}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isRequesting}
                  sx={{ mt: 3 }}
                >
                  {isRequesting ? 'Sending…' : 'Send a new verification link'}
                </Button>
              </Box>
            ) : null}

            {token && !success ? (
              <Button
                type="button"
                onClick={() => void handleConfirm()}
                variant="contained"
                fullWidth
                disabled={isConfirming}
                sx={{ mt: 2 }}
              >
                {isConfirming ? 'Verifying…' : 'Verify email'}
              </Button>
            ) : null}
            {token && success ? (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
              >
                Continue to sign in
              </Button>
            ) : null}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login">
                Back to sign in
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default VerifyEmailPage;
