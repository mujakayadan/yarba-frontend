import Grid from '../../mui/Grid';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Link,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import { type ProviderSignInResult, useAuth } from '../../contexts/AuthContext';
import { getAuthErrorMessage } from '../../utils/errorHandler';
import { createDebugger } from '../../utils/debug';
import { useLocation, useNavigate } from 'react-router-dom';
import { env, shouldUseProviderOAuth } from '../../config/env';
import { isNativeRuntime } from '../../platform/nativeRuntime';
import { locationToPath, resolvePostAuthPath } from '../../utils/openUrl';
import { NATIVE_PASSWORD_POLICY_MESSAGE, validateNativePassword } from '../../utils/passwordPolicy';
import { ACCOUNT_RECOVERY_TEXT } from '../../content/accountRecovery';
import NativeOAuthButtons from './NativeOAuthButtons';
import AccountRecoveryHelp from './AccountRecoveryHelp';
import LegalAgreementFields from '../legal/LegalAgreementFields';
import { buildLegalAcceptance } from '../../services/legalService';
import AuthDocumentPreview from './AuthDocumentPreview';

const debug = createDebugger('AuthForm');

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  initialMode?: AuthMode;
}

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  // State management
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [legalAgreementConfirmed, setLegalAgreementConfirmed] = useState(false);
  const [legalAgreementError, setLegalAgreementError] = useState(false);

  // Auth context
  const {
    login,
    register,
    completeGoogleProviderSignIn,
    completeAppleProviderSignIn,
    error: contextError,
    setError,
    isOfflineMode,
    isAuthenticated,
    setupRoute,
    getRedirectPathForUser,
  } = useAuth();

  // Navigation
  const navigate = useNavigate();

  // Get offline state from location if passed
  const location = useLocation();
  const intendedPath = locationToPath(location.state?.from);
  const isOffline = isOfflineMode || (location.state && location.state.offline);
  const providerOAuthEnabled = shouldUseProviderOAuth({
    nativeRuntime: isNativeRuntime(),
    googleClientId: env.oauth.googleClientId,
    appleServiceId: env.oauth.appleServiceId,
    appleRedirectUri: env.oauth.appleRedirectUri,
  });

  // Effect to redirect when authentication state changes
  useEffect(() => {
    debug.log('Auth state check - isAuthenticated:', isAuthenticated);
    debug.log('Auth state check - from location:', intendedPath);
    debug.log('Auth state check - initialMode:', initialMode);
    debug.log('Auth state check - current path:', location.pathname);

    if (isAuthenticated) {
      // Only redirect from login page, not the register page
      // This allows users to register a new account even if already authenticated
      if (initialMode === 'login') {
        const redirectPath = resolvePostAuthPath({
          setupRoute,
          intendedPath,
          fallback: getRedirectPathForUser(),
        });
        debug.log('User is authenticated on login page. Redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        debug.log('User is authenticated but on register page. No automatic redirect.');
      }
    }
  }, [
    isAuthenticated,
    navigate,
    intendedPath,
    initialMode,
    location.pathname,
    setupRoute,
    getRedirectPathForUser,
  ]);

  // Effect to update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Reset error when switching modes
  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLegalAgreementConfirmed(false);
    setLegalAgreementError(false);
    setLocalError(null);
    setError(null);
  }, [setError]);

  // Handle form submission for login or register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);
    const normalizedEmail = email.trim();

    // Check for offline mode first
    if (isOffline) {
      setLocalError('Cannot authenticate while offline. Please check your internet connection.');
      return;
    }

    if (!normalizedEmail || !password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (mode === 'register') {
      if (!legalAgreementConfirmed) {
        setLegalAgreementError(true);
        setLocalError('You must confirm the legal terms before creating an account.');
        return;
      }
      const passwordError = validateNativePassword(password);
      if (passwordError) {
        setLocalError(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
    }

    setEmail(normalizedEmail);
    debug.log(`Submitting ${mode} form for email: ${normalizedEmail}`);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        debug.log('Attempting to log in');
        await login(normalizedEmail, password);
        debug.log('Login successful');

        // Navigate to the appropriate route based on user state
        const redirectPath = resolvePostAuthPath({
          setupRoute,
          intendedPath,
          fallback: getRedirectPathForUser(),
        });
        debug.log(`Navigating to ${redirectPath} after login`);
        navigate(redirectPath, { replace: true });
      } else {
        debug.log('Attempting to register');
        const { setupRoute } = await register(
          normalizedEmail,
          password,
          buildLegalAcceptance('password_registration')
        );
        debug.log('Registration successful');

        // Navigate directly to the setup route or dashboard
        debug.log(`Navigating to ${setupRoute} after registration`);
        navigate(setupRoute, { replace: true });
      }
    } catch (error: unknown) {
      const errorMsg = getAuthErrorMessage(error);
      debug.error(`${mode} error:`, error);
      setLocalError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderAuthenticated = (result: ProviderSignInResult) => {
    navigate(
      resolvePostAuthPath({
        setupRoute: result.setupRoute,
        intendedPath,
        fallback: getRedirectPathForUser(),
      }),
      { replace: true }
    );
  };

  // Toggle between login and register modes
  const toggleMode = () => {
    resetForm();
    if (mode === 'login') {
      navigate('/register', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
    debug.log(`Navigating to: ${mode === 'login' ? '/register' : '/login'}`);
  };

  // Handle password visibility toggle
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Show error if exists
  const errorMessage = localError || contextError;

  // Display offline mode message
  if (isOffline) {
    return (
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, mx: 'auto' }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          {mode === 'login' ? 'Sign In' : 'Create an Account'}
        </Typography>

        <Alert severity="warning" sx={{ mb: 2 }}>
          You appear to be offline. Authentication requires an internet connection.
        </Alert>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 2,
          }}
        >
          Please check your internet connection and try again. If you believe this is an error, try
          refreshing the page once your connection is restored.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid
      container
      spacing={0}
      sx={{
        width: '100%',
        maxWidth: 1040,
        mx: 'auto',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: '0 24px 70px rgba(40, 55, 90, 0.14)',
        overflow: 'hidden',
      }}
    >
      <Grid
        item
        xs={12}
        md={5}
        sx={{
          display: 'flex',
          order: { xs: 2, md: 1 },
        }}
      >
        <AuthDocumentPreview mode={mode} />
      </Grid>
      <Grid
        item
        xs={12}
        md={7}
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          order: { xs: 1, md: 2 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'stretch',
            height: '100%',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5, md: 5 },
              width: '100%',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 0.75 }}>
              {mode === 'login' ? 'Sign In' : 'Create an Account'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              {mode === 'login'
                ? 'Welcome back. Continue building your next opportunity.'
                : 'Create tailored career documents and tell your story with confidence.'}
            </Typography>

            {mode === 'login' ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {ACCOUNT_RECOVERY_TEXT.returningUserNotice}
              </Alert>
            ) : null}

            {errorMessage && (
              <Box sx={{ mb: 2, width: '100%' }}>
                <Alert
                  severity="error"
                  icon={<ErrorOutlinedIcon fontSize="inherit" />}
                  sx={{
                    width: '100%',
                    '.MuiAlert-message': {
                      width: '100%',
                      textAlign: 'center',
                      fontWeight: 500,
                    },
                  }}
                >
                  {errorMessage}
                </Alert>
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    error={!!localError && email === ''}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    helperText={mode === 'register' ? NATIVE_PASSWORD_POLICY_MESSAGE : undefined}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                {mode === 'register' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Re-enter Password"
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        error={confirmPassword !== '' && password !== confirmPassword}
                        helperText={
                          confirmPassword !== '' && password !== confirmPassword
                            ? 'Passwords do not match'
                            : ''
                        }
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleTogglePasswordVisibility}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </>
                )}

                {mode === 'register' ? (
                  <Grid item xs={12}>
                    <LegalAgreementFields
                      checked={legalAgreementConfirmed}
                      disabled={isSubmitting}
                      error={legalAgreementError}
                      onChange={(checked) => {
                        setLegalAgreementConfirmed(checked);
                        if (checked) {
                          setLegalAgreementError(false);
                        }
                      }}
                    />
                  </Grid>
                ) : null}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 1, minHeight: 46 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : mode === 'login' ? (
                      'Sign In'
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </Grid>
              </Grid>

              {providerOAuthEnabled ? (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      OR
                    </Typography>
                  </Divider>
                  <NativeOAuthButtons
                    disabled={isSubmitting || (mode === 'register' && !legalAgreementConfirmed)}
                    legalAcceptanceRequired={mode === 'register'}
                    onGoogleToken={completeGoogleProviderSignIn}
                    onAppleToken={completeAppleProviderSignIn}
                    onAuthenticated={handleProviderAuthenticated}
                  />
                </>
              ) : null}

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link component="button" variant="body2" onClick={toggleMode} type="button">
                  {mode === 'login'
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Sign In'}
                </Link>
                {mode === 'login' && (
                  <Box
                    sx={{
                      mt: 1,
                    }}
                  >
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/forgot-password')}
                      type="button"
                    >
                      {ACCOUNT_RECOVERY_TEXT.requestNewPassword}
                    </Link>
                  </Box>
                )}
              </Box>
              {mode === 'login' ? (
                <Box sx={{ mt: 2 }}>
                  <AccountRecoveryHelp />
                </Box>
              ) : null}
            </Box>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthForm;
