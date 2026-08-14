import React, { useState } from 'react';
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
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import { extractApiErrorMessage } from '../utils/apiErrors';

const RESET_CONFIRMATION =
  'If an account exists for that email, password reset instructions will be sent.';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError('Enter your email address.');
      return;
    }

    setError(null);
    setConfirmation(null);
    setIsSubmitting(true);

    try {
      await forgotPassword(normalizedEmail);
      setConfirmation(RESET_CONFIRMATION);
    } catch (error: unknown) {
      setError(
        extractApiErrorMessage(
          error,
          'Unable to send reset instructions. Check your connection and try again.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundImage: 'linear-gradient(to right,rgb(142, 92, 150),rgb(122, 172, 216))',
        }}
      >
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
              Reset your password
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Enter the email address associated with your YARBA account.
            </Typography>

            {confirmation ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                {confirmation}
              </Alert>
            ) : null}
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                required
                fullWidth
                id="reset-email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{ mt: 3 }}
              >
                {isSubmitting ? 'Sending…' : 'Send reset instructions'}
              </Button>
            </Box>

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

export default ForgotPasswordPage;
