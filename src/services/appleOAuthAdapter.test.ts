import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OAuthStateMismatchError,
  ProviderPopupCancelledError,
  loadAppleJsSdk,
  sha256Hex,
  signInWithApple,
} from './appleOAuthAdapter';

interface CapturedAppleConfig {
  clientId: string;
  redirectURI: string;
  nonce: string;
  state: string;
  scope: string;
  usePopup: boolean;
}

afterEach(() => {
  delete window.AppleID;
});

describe('appleOAuthAdapter', () => {
  it('hashes the raw nonce as lowercase SHA-256 hex', async () => {
    await expect(sha256Hex('abc')).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('loads an existing official Apple SDK without injecting another script', async () => {
    const appleSdk = {
      auth: {
        init: vi.fn(),
        signIn: vi.fn(),
      },
    };
    window.AppleID = appleSdk;

    await expect(Promise.all([loadAppleJsSdk(), loadAppleJsSdk()])).resolves.toEqual([
      appleSdk,
      appleSdk,
    ]);
    expect(document.querySelectorAll('#apple-sign-in-sdk')).toHaveLength(0);
  });

  it('passes the hashed nonce, validates state, and returns one-time display name', async () => {
    let config: CapturedAppleConfig | null = null;
    window.AppleID = {
      auth: {
        init: vi.fn((value: CapturedAppleConfig) => {
          config = value;
        }),
        signIn: vi.fn(async () => ({
          authorization: {
            id_token: 'apple-id-token',
            state: config?.state,
          },
          user: {
            name: {
              firstName: 'Example',
              lastName: 'User',
            },
          },
        })),
      },
    };

    await expect(
      signInWithApple({
        rawNonce: 'abc',
        clientId: 'com.example.web',
        redirectUri: 'https://example.com/login',
      })
    ).resolves.toEqual({
      idToken: 'apple-id-token',
      displayName: 'Example User',
    });

    expect(config).toMatchObject({
      clientId: 'com.example.web',
      redirectURI: 'https://example.com/login',
      nonce: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      scope: 'name email',
      usePopup: true,
    });
  });

  it('rejects an Apple response with mismatched state', async () => {
    window.AppleID = {
      auth: {
        init: vi.fn(),
        signIn: vi.fn(async () => ({
          authorization: {
            id_token: 'apple-id-token',
            state: 'unexpected-state',
          },
        })),
      },
    };

    await expect(
      signInWithApple({
        rawNonce: 'raw-nonce',
        clientId: 'com.example.web',
        redirectUri: 'https://example.com/login',
      })
    ).rejects.toBeInstanceOf(OAuthStateMismatchError);
  });

  it('maps popup closure to an accessible cancellation error', async () => {
    window.AppleID = {
      auth: {
        init: vi.fn(),
        signIn: vi.fn(async () => {
          throw Object.assign(new Error('Popup closed'), {
            error: 'popup_closed_by_user',
          });
        }),
      },
    };

    await expect(
      signInWithApple({
        rawNonce: 'raw-nonce',
        clientId: 'com.example.web',
        redirectUri: 'https://example.com/login',
      })
    ).rejects.toBeInstanceOf(ProviderPopupCancelledError);
  });
});
