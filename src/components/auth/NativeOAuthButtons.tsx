import React, { useRef, useState } from 'react';
import AppleIcon from '@mui/icons-material/Apple';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { env } from '../../config/env';
import type { ProviderSignInResult } from '../../contexts/AuthContext';
import { ProviderPopupCancelledError, signInWithApple } from '../../services/appleOAuthAdapter';
import { issueOAuthNonce } from '../../services/oauthService';
import { extractApiErrorMessage } from '../../utils/apiErrors';

const OAUTH_UI_TEXT = {
  appleButton: 'Continue with Apple',
  appleCancelled: 'Apple sign-in was cancelled.',
  appleFailure: 'Unable to complete Apple sign-in. Please try again.',
  configurationMissing: 'Direct provider sign-in is not configured for this environment.',
  googleDialogTitle: 'Continue with Google',
  googleFailure: 'Google sign-in was cancelled or could not be completed. Please try again.',
  googlePrepare: 'Prepare Google sign-in',
  googlePreparing: 'Preparing Google sign-in…',
  googleRetry: 'Try Google again',
  providerFailure: 'Unable to complete provider sign-in. Please try again.',
} as const;

interface NativeOAuthButtonsProps {
  disabled: boolean;
  onGoogleToken: (idToken: string) => Promise<ProviderSignInResult>;
  onAppleToken: (idToken: string, displayName?: string) => Promise<ProviderSignInResult>;
  onAuthenticated: (result: ProviderSignInResult) => void;
}

const NativeOAuthButtons: React.FC<NativeOAuthButtonsProps> = ({
  disabled,
  onGoogleToken,
  onAppleToken,
  onAuthenticated,
}) => {
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [googleNonce, setGoogleNonce] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const operationInFlight = useRef(false);

  const googleConfigured = Boolean(env.oauth.googleClientId);
  const appleConfigured = Boolean(env.oauth.appleServiceId && env.oauth.appleRedirectUri);
  const isBusy = disabled || activeProvider !== null;

  const prepareGoogleSignIn = async () => {
    if (!googleConfigured || operationInFlight.current) {
      return;
    }
    operationInFlight.current = true;
    setGoogleDialogOpen(true);
    setGoogleNonce(null);
    setError(null);
    setActiveProvider('google');
    try {
      const nonceResponse = await issueOAuthNonce('google');
      setGoogleNonce(nonceResponse.nonce);
    } catch (nonceError: unknown) {
      setError(extractApiErrorMessage(nonceError, OAUTH_UI_TEXT.providerFailure));
    } finally {
      operationInFlight.current = false;
      setActiveProvider(null);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential || operationInFlight.current) {
      setGoogleNonce(null);
      setError(OAUTH_UI_TEXT.googleFailure);
      return;
    }

    operationInFlight.current = true;
    setActiveProvider('google');
    setError(null);
    try {
      const result = await onGoogleToken(response.credential);
      setGoogleDialogOpen(false);
      setGoogleNonce(null);
      onAuthenticated(result);
    } catch (exchangeError: unknown) {
      setGoogleNonce(null);
      setError(extractApiErrorMessage(exchangeError, OAUTH_UI_TEXT.providerFailure));
    } finally {
      operationInFlight.current = false;
      setActiveProvider(null);
    }
  };

  const handleGoogleError = () => {
    setGoogleNonce(null);
    setError(OAUTH_UI_TEXT.googleFailure);
  };

  const handleGoogleDialogClose = () => {
    if (operationInFlight.current) {
      return;
    }
    setGoogleDialogOpen(false);
    setGoogleNonce(null);
    setError(null);
  };

  const handleAppleSignIn = async () => {
    if (
      !appleConfigured ||
      operationInFlight.current ||
      !env.oauth.appleServiceId ||
      !env.oauth.appleRedirectUri
    ) {
      return;
    }

    operationInFlight.current = true;
    setActiveProvider('apple');
    setError(null);
    try {
      const nonceResponse = await issueOAuthNonce('apple');
      const appleResult = await signInWithApple({
        rawNonce: nonceResponse.nonce,
        clientId: env.oauth.appleServiceId,
        redirectUri: env.oauth.appleRedirectUri,
      });
      const result = await onAppleToken(appleResult.idToken, appleResult.displayName);
      onAuthenticated(result);
    } catch (providerError: unknown) {
      const message =
        providerError instanceof ProviderPopupCancelledError
          ? OAUTH_UI_TEXT.appleCancelled
          : extractApiErrorMessage(providerError, OAUTH_UI_TEXT.appleFailure);
      setError(message);
    } finally {
      operationInFlight.current = false;
      setActiveProvider(null);
    }
  };

  if (!googleConfigured && !appleConfigured) {
    return <Alert severity="warning">{OAUTH_UI_TEXT.configurationMissing}</Alert>;
  }

  return (
    <>
      {error && !googleDialogOpen ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Stack spacing={1.5}>
        {googleConfigured ? (
          <Button
            type="button"
            fullWidth
            variant="outlined"
            onClick={() => void prepareGoogleSignIn()}
            disabled={isBusy}
          >
            {activeProvider === 'google' ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {OAUTH_UI_TEXT.googlePreparing}
              </>
            ) : (
              OAUTH_UI_TEXT.googlePrepare
            )}
          </Button>
        ) : null}
        {appleConfigured ? (
          <Button
            type="button"
            fullWidth
            variant="contained"
            startIcon={
              activeProvider === 'apple' ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AppleIcon />
              )
            }
            onClick={() => void handleAppleSignIn()}
            disabled={isBusy}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { bgcolor: '#1f1f1f' },
            }}
          >
            {OAUTH_UI_TEXT.appleButton}
          </Button>
        ) : null}
      </Stack>

      {googleConfigured ? (
        <Dialog
          open={googleDialogOpen}
          onClose={handleGoogleDialogClose}
          aria-labelledby="google-sign-in-title"
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle id="google-sign-in-title">{OAUTH_UI_TEXT.googleDialogTitle}</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Use Google&apos;s secure sign-in button to continue.
            </Typography>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 44 }}>
              {googleNonce && env.oauth.googleClientId ? (
                <GoogleOAuthProvider clientId={env.oauth.googleClientId}>
                  <GoogleLogin
                    nonce={googleNonce}
                    onSuccess={(response) => void handleGoogleSuccess(response)}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                  />
                </GoogleOAuthProvider>
              ) : activeProvider === 'google' ? (
                <CircularProgress aria-label={OAUTH_UI_TEXT.googlePreparing} />
              ) : null}
            </Box>
          </DialogContent>
          <DialogActions>
            {!googleNonce && error ? (
              <Button type="button" onClick={() => void prepareGoogleSignIn()}>
                {OAUTH_UI_TEXT.googleRetry}
              </Button>
            ) : null}
            <Button type="button" onClick={handleGoogleDialogClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
};

export default NativeOAuthButtons;
