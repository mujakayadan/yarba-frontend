import { SocialLogin } from '@capgo/capacitor-social-login';
import { env } from '../config/env';
import { isNativeRuntime } from '../platform/nativeRuntime';
import { ProviderPopupCancelledError } from './appleOAuthAdapter';

let initializePromise: Promise<void> | null = null;

const isGoogleCancellation = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
  return (
    code === 'USER_CANCELLED' ||
    code.toLowerCase().includes('cancel') ||
    message.toLowerCase().includes('cancel')
  );
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

  await ensureGoogleInitialized();

  try {
    const response = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: ['email', 'profile'],
        nonce: rawNonce,
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
    throw error;
  }
};
