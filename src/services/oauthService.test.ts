import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '../utils/apiErrors';

const mocks = vi.hoisted(() => ({
  apiPost: vi.fn(),
  storeToken: vi.fn(),
}));

vi.mock('./api', () => ({
  default: { post: mocks.apiPost },
}));

vi.mock('../utils/auth', () => ({
  storeToken: mocks.storeToken,
}));

import { exchangeAppleIdToken, exchangeGoogleIdToken, issueOAuthNonce } from './oauthService';

const authResponse = {
  user: {
    id: 'user-1',
    email: 'user@example.com',
    username: 'user',
    email_verified: true,
    is_active: true,
    is_superuser: false,
    auth_provider: 'google',
  },
  access_token: 'backend-access-token',
  token_type: 'bearer',
  access_token_expires_in: 900,
  is_new_user: false,
  current_setup_step: 0,
  registration_resumed: false,
};

describe('oauthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['google', 'apple'] as const)(
    'issues a %s nonce with credentials-enabled API',
    async (provider) => {
      mocks.apiPost.mockResolvedValue({ data: { nonce: 'raw-nonce', expires_in: 300 } });

      await expect(issueOAuthNonce(provider)).resolves.toEqual({
        nonce: 'raw-nonce',
        expires_in: 300,
      });

      expect(mocks.apiPost).toHaveBeenCalledWith(`/auth/oauth/nonce/${provider}`);
    }
  );

  it('exchanges a Google ID token and stores only the backend access token', async () => {
    mocks.apiPost.mockResolvedValue({ data: authResponse });

    await expect(exchangeGoogleIdToken('google-id-token')).resolves.toEqual(authResponse);

    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/oauth/google', {
      id_token: 'google-id-token',
    });
    expect(mocks.storeToken).toHaveBeenCalledWith('backend-access-token');
  });

  it('exchanges an Apple ID token with a one-time display name', async () => {
    mocks.apiPost.mockResolvedValue({ data: authResponse });

    await exchangeAppleIdToken('apple-id-token', 'Example User');

    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/oauth/apple', {
      id_token: 'apple-id-token',
      display_name: 'Example User',
    });
    expect(mocks.storeToken).toHaveBeenCalledWith('backend-access-token');
  });

  it('maps provider exchange failures to ApiRequestError without logging secrets', async () => {
    const consoleSpies = [
      vi.spyOn(console, 'log').mockImplementation(() => undefined),
      vi.spyOn(console, 'debug').mockImplementation(() => undefined),
      vi.spyOn(console, 'warn').mockImplementation(() => undefined),
      vi.spyOn(console, 'error').mockImplementation(() => undefined),
    ];
    mocks.apiPost.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { detail: 'Identity conflict', error_code: 'identity_conflict' },
      },
    });

    await expect(exchangeGoogleIdToken('secret-google-token')).rejects.toBeInstanceOf(
      ApiRequestError
    );

    const loggedValues = consoleSpies
      .flatMap((spy) => spy.mock.calls)
      .flat()
      .map(String)
      .join(' ');
    expect(loggedValues).not.toContain('secret-google-token');
    for (const spy of consoleSpies) {
      spy.mockRestore();
    }
  });
});
