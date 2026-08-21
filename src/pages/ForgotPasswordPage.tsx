import React, { useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '../mui/Grid';
import { forgotPassword } from '../services/authService';
import { headerGradient } from '../theme/tokens';
import { extractApiErrorMessage } from '../utils/apiErrors';

const PAGE_TEXT = {
  title: 'Forgot password?',
  description: 'We’ll email reset instructions if that address has a YARBA account.',
  emailLabel: 'Email address',
  emailRequired: 'Enter your email address.',
  submit: 'Send reset instructions',
  submitting: 'Sending…',
  confirmation: 'If an account exists for that email, password reset instructions will be sent.',
  confirmationTitle: 'Check your email',
  confirmationBody: 'It can take a minute to arrive. Check spam if you do not see it.',
  sendError: 'Unable to send reset instructions. Check your connection and try again.',
  backToSignIn: 'Back to sign in',
  continueToSignIn: 'Continue to sign in',
  useDifferentEmail: 'Use a different email',
} as const;

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError(PAGE_TEXT.emailRequired);
      return;
    }

    setError(null);
    setConfirmation(null);
    setIsSubmitting(true);

    try {
      await forgotPassword(normalizedEmail);
      setConfirmation(PAGE_TEXT.confirmation);
    } catch (submitError: unknown) {
      setError(extractApiErrorMessage(submitError, PAGE_TEXT.sendError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDifferentEmail = () => {
    setConfirmation(null);
    setError(null);
  };

  const emailFieldError = error === PAGE_TEXT.emailRequired;

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
              src="/forgot-password.svg"
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
                {confirmation ? PAGE_TEXT.confirmationTitle : PAGE_TEXT.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {confirmation ? PAGE_TEXT.confirmationBody : PAGE_TEXT.description}
              </Typography>

              {confirmation ? (
                <>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {confirmation}
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
                  <Box sx={{ mt: 2 }}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={handleUseDifferentEmail}
                    >
                      {PAGE_TEXT.useDifferentEmail}
                    </Link>
                  </Box>
                </>
              ) : (
                <>
                  {error && !emailFieldError ? (
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
                      label={PAGE_TEXT.emailLabel}
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (emailFieldError) {
                          setError(null);
                        }
                      }}
                      disabled={isSubmitting}
                      error={emailFieldError}
                      helperText={emailFieldError ? error : undefined}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutlineIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined
                      }
                      sx={{ mt: 2.5, minHeight: 44 }}
                    >
                      {isSubmitting ? PAGE_TEXT.submitting : PAGE_TEXT.submit}
                    </Button>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Link component={RouterLink} to="/login" variant="body2">
                      {PAGE_TEXT.backToSignIn}
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

export default ForgotPasswordPage;
