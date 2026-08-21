import React, { useEffect, useRef, useState } from 'react';
import AppleIcon from '@mui/icons-material/Apple';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { env } from '../../config/env';
import type { ProviderSignInResult } from '../../contexts/AuthContext';
import { ProviderPopupCancelledError, signInWithApple } from '../../services/appleOAuthAdapter';
import { issueOAuthNonce } from '../../services/oauthService';
import { buildLegalAcceptance } from '../../services/legalService';
import type { LegalAcceptanceRequest } from '../../types/models';
import { extractApiErrorMessage } from '../../utils/apiErrors';

const OAUTH_UI_TEXT = {
  appleButton: 'Continue with Apple',
  appleCancelled: 'Apple sign-in was cancelled.',
  appleFailure: 'Unable to complete Apple sign-in. Please try again.',
  configurationMissing: 'Direct provider sign-in is not configured for this environment.',
  googleButton: 'Continue with Google',
  googleFailure: 'Google sign-in was cancelled or could not be completed. Please try again.',
  googlePreparing: 'Preparing Google sign-in…',
  googleRetry: 'Try Google again',
  providerFailure: 'Unable to complete provider sign-in. Please try again.',
} as const;

interface NativeOAuthButtonsProps {
  disabled: boolean;
  legalAcceptanceRequired: boolean;
  onGoogleToken: (
    idToken: string,
    legalAcceptance?: LegalAcceptanceRequest
  ) => Promise<ProviderSignInResult>;
  onAppleToken: (
    idToken: string,
    legalAcceptance?: LegalAcceptanceRequest,
    displayName?: string
  ) => Promise<ProviderSignInResult>;
  onAuthenticated: (result: ProviderSignInResult) => void;
}

const NativeOAuthButtons: React.FC<NativeOAuthButtonsProps> = ({
  disabled,
  legalAcceptanceRequired,
  onGoogleToken,
  onAppleToken,
  onAuthenticated,
}) => {
  const [googleNonce, setGoogleNonce] = useState<string | null>(null);
  const [googleNonceEpoch, setGoogleNonceEpoch] = useState(0);
  const [activeProvider, setActiveProvider] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const operationInFlight = useRef(false);

  const googleConfigured = Boolean(env.oauth.googleClientId);
  const appleConfigured = Boolean(env.oauth.appleServiceId && env.oauth.appleRedirectUri);
  const isBusy = disabled || activeProvider !== null;

  useEffect(() => {
    if (!googleConfigured || disabled) {
      return;
    }

    let cancelled = false;
    setGoogleNonce(null);
    setActiveProvider('google');

    const loadNonce = async () => {
      try {
        const nonceResponse = await issueOAuthNonce('google');
        if (cancelled) {
          return;
        }
        setGoogleNonce(nonceResponse.nonce);
        setError(null);
      } catch (nonceError: unknown) {
        if (cancelled) {
          return;
        }
        setGoogleNonce(null);
        setError(extractApiErrorMessage(nonceError, OAUTH_UI_TEXT.providerFailure));
      } finally {
        if (!cancelled) {
          setActiveProvider((current) => (current === 'google' ? null : current));
        }
      }
    };

    void loadNonce();
    return () => {
      cancelled = true;
    };
  }, [disabled, googleConfigured, googleNonceEpoch]);

  const retryGoogleNonce = () => {
    if (operationInFlight.current) {
      return;
    }
    setError(null);
    setGoogleNonceEpoch((current) => current + 1);
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (operationInFlight.current) {
      return;
    }
    if (!response.credential) {
      setGoogleNonce(null);
      setError(OAUTH_UI_TEXT.googleFailure);
      return;
    }

    operationInFlight.current = true;
    setActiveProvider('google');
    setError(null);
    try {
      const result = await onGoogleToken(
        response.credential,
        legalAcceptanceRequired ? buildLegalAcceptance('google_oauth') : undefined
      );
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
      const result = await onAppleToken(
        appleResult.idToken,
        legalAcceptanceRequired ? buildLegalAcceptance('apple_oauth') : undefined,
        appleResult.displayName
      );
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
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Stack
        spacing={1.5}
        sx={{
          alignItems: 'center',
        }}
      >
        {googleConfigured && env.oauth.googleClientId ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 44, width: '100%' }}>
            {disabled ? (
              <Button type="button" fullWidth variant="outlined" disabled>
                {OAUTH_UI_TEXT.googleButton}
              </Button>
            ) : googleNonce ? (
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
            ) : (
              <Button type="button" fullWidth variant="outlined" onClick={retryGoogleNonce}>
                {OAUTH_UI_TEXT.googleRetry}
              </Button>
            )}
          </Box>
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
    </>
  );
};

export default NativeOAuthButtons;
