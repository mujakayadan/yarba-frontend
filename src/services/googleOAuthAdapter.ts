import { SocialLogin } from '@capgo/capacitor-social-login';
import { env } from '../config/env';
import { isNativeRuntime } from '../platform/nativeRuntime';
import { ProviderPopupCancelledError } from './appleOAuthAdapter';

let initializePromise: Promise<void> | null = null;

export const GOOGLE_ACCOUNT_REAUTH_MESSAGE =
  'Google could not re-authenticate this account on the device. Clear Yarba app storage, confirm Sign in with Google is allowed for Yarba in Google Account settings, then try again (or use a different Google account).';

export class GoogleAccountReauthError extends Error {
  constructor() {
    super(GOOGLE_ACCOUNT_REAUTH_MESSAGE);
    this.name = 'GoogleAccountReauthError';
  }
}

const isGoogleCancellation = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }
  const code = typeof error.code === 'string' ? error.code.toUpperCase() : '';
  return code === 'USER_CANCELLED' || code.endsWith('_CANCELLED') || code.endsWith('_CANCELED');
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }
  return typeof error === 'string' ? error : '';
};

const isAccountReauthFailure = (error: unknown): boolean => {
  const message = getErrorMessage(error);
  return message.includes('[16]') || /Account reauth failed/i.test(message);
};

const clearStaleGoogleCredentialState = async (): Promise<void> => {
  try {
    await SocialLogin.logout({ provider: 'google' });
  } catch {
    // Best-effort: Credential Manager may already have no Google session.
  }
};

const ensureGoogleInitialized = async (): Promise<void> => {
  const webClientId = env.oauth.googleClientId;
  if (!webClientId) {
    throw new Error('Google sign-in is not configured for this environment.');
  }
  if (!initializePromise) {
    initializePromise = SocialLogin.initialize({
      google: {
        webClientId,
        mode: 'online',
        skipAuthOnlyAuthorizationAfterSignIn: true,
      },
    }).catch((error: unknown) => {
      initializePromise = null;
      throw error;
    });
  }
  await initializePromise;
};

export const signInWithGoogleIdToken = async (rawNonce: string): Promise<string> => {
  if (!isNativeRuntime()) {
    throw new Error('Native Google sign-in is only available in the Capacitor app.');
  }
  if (!rawNonce.trim()) {
    throw new Error('Google sign-in requires a backend nonce.');
  }

  await ensureGoogleInitialized();
  await clearStaleGoogleCredentialState();

  try {
    // Capgo already requests openid/email/profile. Passing scopes forces an
    // Android authorization path that rejects unless MainActivity is modified.
    // Start with standard UI and no authorized-account filter so Family Link /
    // stale Credential Manager selections are less likely to trip [16].
    const response = await SocialLogin.login({
      provider: 'google',
      options: {
        nonce: rawNonce,
        style: 'standard',
        filterByAuthorizedAccounts: false,
        autoSelectEnabled: false,
      },
    });

    if (response.provider !== 'google' || response.result.responseType !== 'online') {
      throw new Error('Google sign-in did not return an ID token.');
    }

    const idToken = response.result.idToken;
    if (!idToken) {
      throw new Error('Google sign-in did not return an ID token.');
    }
    return idToken;
  } catch (error: unknown) {
    if (isGoogleCancellation(error)) {
      throw new ProviderPopupCancelledError('Google');
    }
    if (isAccountReauthFailure(error)) {
      throw new GoogleAccountReauthError();
    }
    throw error;
  }
};
