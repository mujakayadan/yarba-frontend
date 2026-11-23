import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  login: vi.fn(),
  isNativeRuntime: vi.fn(() => true),
  googleClientId: 'web-client.apps.googleusercontent.com',
}));

vi.mock('@capgo/capacitor-social-login', () => ({
  SocialLogin: {
    initialize: mocks.initialize,
    login: mocks.login,
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
import { signInWithGoogleIdToken } from './googleOAuthAdapter';

describe('googleOAuthAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNativeRuntime.mockReturnValue(true);
    mocks.googleClientId = 'web-client.apps.googleusercontent.com';
    mocks.initialize.mockResolvedValue(undefined);
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
    expect(mocks.login).toHaveBeenCalledWith({
      provider: 'google',
      options: { nonce: 'raw-nonce' },
    });
    expect(mocks.login.mock.calls[0][0].options).not.toHaveProperty('scopes');
  });

  it('maps Capgo cancellation codes to ProviderPopupCancelledError', async () => {
    mocks.login.mockRejectedValue({ code: 'USER_CANCELLED' });

    await expect(signInWithGoogleIdToken('raw-nonce')).rejects.toBeInstanceOf(
      ProviderPopupCancelledError
    );
  });
});
