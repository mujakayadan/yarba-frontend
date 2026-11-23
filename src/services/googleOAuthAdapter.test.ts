import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  isNativeRuntime: vi.fn(() => true),
  googleClientId: 'web-client.apps.googleusercontent.com',
}));

vi.mock('@capgo/capacitor-social-login', () => ({
  SocialLogin: {
    initialize: mocks.initialize,
    login: mocks.login,
    logout: mocks.logout,
  },
}));

vi.mock('../platform/nativeRuntime', () => ({
  isNativeRuntime: () => mocks.isNativeRuntime(),
}));

vi.mock('../config/env', () => ({
  env: {
    oauth: {
      get googleClientId() {
        return mocks.googleClientId;
      },
    },
  },
}));

import { ProviderPopupCancelledError } from './appleOAuthAdapter';
import {
  GoogleAccountReauthError,
  GOOGLE_ACCOUNT_REAUTH_MESSAGE,
  signInWithGoogleIdToken,
} from './googleOAuthAdapter';

describe('googleOAuthAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNativeRuntime.mockReturnValue(true);
    mocks.googleClientId = 'web-client.apps.googleusercontent.com';
    mocks.initialize.mockResolvedValue(undefined);
    mocks.logout.mockResolvedValue(undefined);
    mocks.login.mockResolvedValue({
      provider: 'google',
      result: {
        responseType: 'online',
        idToken: 'google-id-token',
      },
    });
  });

  it('logs in with nonce only (no scopes that trip the Android MainActivity guard)', async () => {
    await expect(signInWithGoogleIdToken('raw-nonce')).resolves.toBe('google-id-token');

    expect(mocks.initialize).toHaveBeenCalledWith({
      google: {
        webClientId: 'web-client.apps.googleusercontent.com',
        mode: 'online',
        skipAuthOnlyAuthorizationAfterSignIn: true,
      },
    });
    expect(mocks.logout).toHaveBeenCalledWith({ provider: 'google' });
    expect(mocks.login).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        nonce: 'raw-nonce',
        style: 'standard',
        filterByAuthorizedAccounts: false,
        autoSelectEnabled: false,
      },
    });
    expect(mocks.login.mock.calls[0][0].options).not.toHaveProperty('scopes');
  });

  it('continues login when logout clear fails', async () => {
    mocks.logout.mockRejectedValue(new Error('no session'));

    await expect(signInWithGoogleIdToken('raw-nonce')).resolves.toBe('google-id-token');
    expect(mocks.login).toHaveBeenCalled();
  });

  it('maps Capgo cancellation codes to ProviderPopupCancelledError', async () => {
    mocks.login.mockRejectedValue({ code: 'USER_CANCELLED' });

    await expect(signInWithGoogleIdToken('raw-nonce')).rejects.toBeInstanceOf(
      ProviderPopupCancelledError
    );
  });

  it('maps Capgo [16] reauth failures to GoogleAccountReauthError', async () => {
    mocks.login.mockRejectedValue(
      new Error(
        'Google Sign-In failed: [16] Account reauth failed. The plugin cleared Credential Manager credential-selection state and retried once.'
      )
    );

    await expect(signInWithGoogleIdToken('raw-nonce')).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof GoogleAccountReauthError && error.message === GOOGLE_ACCOUNT_REAUTH_MESSAGE
    );
  });
});
