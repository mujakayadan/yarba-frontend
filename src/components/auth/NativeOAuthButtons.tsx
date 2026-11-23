import React, { useEffect, useRef, useState } from 'react';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { env } from '../../config/env';
import type { ProviderSignInResult } from '../../contexts/AuthContext';
import { isNativeRuntime } from '../../platform/nativeRuntime';
import { ProviderPopupCancelledError, signInWithApple } from '../../services/appleOAuthAdapter';
import {
  GoogleAccountReauthError,
  signInWithGoogleIdToken,
} from '../../services/googleOAuthAdapter';
import { issueOAuthNonce } from '../../services/oauthService';
import { buildLegalAcceptance } from '../../services/legalService';
import type { LegalAcceptanceRequest } from '../../types/models';
import { ApiRequestError, extractApiErrorMessage } from '../../utils/apiErrors';
import AccountRecoveryHelp from './AccountRecoveryHelp';

const OAUTH_UI_TEXT = {
  appleButton: 'Continue with Apple',
  appleCancelled: 'Apple sign-in was cancelled.',
  appleFailure: 'Unable to complete Apple sign-in. Please try again.',
  configurationMissing: 'Direct provider sign-in is not configured for this environment.',
  googleButton: 'Continue with Google',
  googleCancelled: 'Google sign-in was cancelled.',
  googleFailure: 'Google sign-in was cancelled or could not be completed. Please try again.',
  googlePreparing: 'Preparing Google sign-in…',
  googleRetry: 'Try Google again',
  providerFailure: 'Unable to complete provider sign-in. Please try again.',
} as const;

const resolveGoogleProviderError = (error: unknown): string => {
  if (error instanceof ProviderPopupCancelledError) {
    return OAUTH_UI_TEXT.googleCancelled;
  }
  if (error instanceof GoogleAccountReauthError) {
    return error.message;
  }
  return extractApiErrorMessage(error, OAUTH_UI_TEXT.googleFailure);
};

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
  const [linkingRequired, setLinkingRequired] = useState(false);
  const operationInFlight = useRef(false);

  const googleConfigured = Boolean(env.oauth.googleClientId);
  const nativeRuntime = isNativeRuntime();
  const appleConfigured = Boolean(
    !nativeRuntime && env.oauth.appleServiceId && env.oauth.appleRedirectUri
  );
  const isBusy = disabled || activeProvider !== null;

  useEffect(() => {
    if (!googleConfigured || disabled || nativeRuntime) {
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
        setLinkingRequired(false);
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
  }, [disabled, googleConfigured, googleNonceEpoch, nativeRuntime]);

  const retryGoogleNonce = () => {
    if (operationInFlight.current) {
      return;
    }
    setError(null);
    setLinkingRequired(false);
    setGoogleNonceEpoch((current) => current + 1);
  };

  const completeGoogleToken = async (idToken: string) => {
    const result = await onGoogleToken(
      idToken,
      legalAcceptanceRequired ? buildLegalAcceptance('google_oauth') : undefined
    );
    setGoogleNonce(null);
    onAuthenticated(result);
  };

  const reportGoogleExchangeError = (exchangeError: unknown) => {
    setGoogleNonce(null);
    setLinkingRequired(
      exchangeError instanceof ApiRequestError &&
        exchangeError.errorCode === 'account_linking_required'
    );
    setError(resolveGoogleProviderError(exchangeError));
  };

  const handleNativeGoogleSignIn = async () => {
    if (!googleConfigured || operationInFlight.current) {
      return;
    }

    operationInFlight.current = true;
    setActiveProvider('google');
    setError(null);
    setLinkingRequired(false);
    try {
      const nonceResponse = await issueOAuthNonce('google');
      const idToken = await signInWithGoogleIdToken(nonceResponse.nonce);
      await completeGoogleToken(idToken);
    } catch (providerError: unknown) {
      reportGoogleExchangeError(providerError);
    } finally {
      operationInFlight.current = false;
      setActiveProvider(null);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (operationInFlight.current) {
      return;
    }
    if (!response.credential) {
      setGoogleNonce(null);
      setLinkingRequired(false);
      setError(OAUTH_UI_TEXT.googleFailure);
      return;
    }

    operationInFlight.current = true;
    setActiveProvider('google');
    setError(null);
    setLinkingRequired(false);
    try {
      await completeGoogleToken(response.credential);
    } catch (exchangeError: unknown) {
      reportGoogleExchangeError(exchangeError);
    } finally {
      operationInFlight.current = false;
      setActiveProvider(null);
    }
  };

  const handleGoogleError = () => {
    setGoogleNonce(null);
    setLinkingRequired(false);
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
    setLinkingRequired(false);
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
      setLinkingRequired(
        providerError instanceof ApiRequestError &&
          providerError.errorCode === 'account_linking_required'
      );
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
          {linkingRequired ? (
            <Box sx={{ mt: 1.5 }}>
              <AccountRecoveryHelp includeForgotPassword />
            </Box>
          ) : null}
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
            {nativeRuntime ? (
              <Button
                type="button"
                fullWidth
                variant="outlined"
                startIcon={
                  activeProvider === 'google' ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <GoogleIcon />
                  )
                }
                onClick={() => void handleNativeGoogleSignIn()}
                disabled={isBusy}
              >
                {OAUTH_UI_TEXT.googleButton}
              </Button>
            ) : disabled ? (
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
