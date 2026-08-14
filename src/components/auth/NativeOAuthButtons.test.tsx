import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  googleClientId: 'google-client-id',
  appleServiceId: 'apple-service-id',
  appleRedirectUri: 'https://example.com/login',
  issueNonce: vi.fn(),
  signInWithApple: vi.fn(),
}));

vi.mock('../../config/env', () => ({
  env: {
    oauth: {
      get googleClientId() {
        return mocks.googleClientId || undefined;
      },
      get appleServiceId() {
        return mocks.appleServiceId || undefined;
      },
      get appleRedirectUri() {
        return mocks.appleRedirectUri || undefined;
      },
    },
  },
}));

vi.mock('../../services/oauthService', () => ({
  issueOAuthNonce: mocks.issueNonce,
}));

vi.mock('../../services/appleOAuthAdapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../services/appleOAuthAdapter')>();
  return {
    ...original,
    signInWithApple: mocks.signInWithApple,
  };
});

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => children,
  GoogleLogin: ({
    onSuccess,
    onError,
    nonce,
  }: {
    onSuccess: (response: { credential?: string }) => void;
    onError: () => void;
    nonce: string;
  }) => (
    <div>
      <button type="button" onClick={() => onSuccess({ credential: 'google-id-token' })}>
        Official Google
      </button>
      <button type="button" onClick={onError}>
        Google SDK error
      </button>
      <span data-testid="google-nonce-ready">{nonce ? 'ready' : 'missing'}</span>
    </div>
  ),
}));

import NativeOAuthButtons from './NativeOAuthButtons';
import { ProviderPopupCancelledError } from '../../services/appleOAuthAdapter';

const defaultProps = () => ({
  disabled: false,
  onGoogleToken: vi.fn().mockResolvedValue({
    isNewUser: false,
    setupRoute: '/dashboard',
  }),
  onAppleToken: vi.fn().mockResolvedValue({
    isNewUser: false,
    setupRoute: '/dashboard',
  }),
  onAuthenticated: vi.fn(),
});

describe('NativeOAuthButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.googleClientId = 'google-client-id';
    mocks.appleServiceId = 'apple-service-id';
    mocks.appleRedirectUri = 'https://example.com/login';
  });

  it('shows configuration guidance and hides Apple when providers are not configured', () => {
    mocks.googleClientId = '';
    mocks.appleServiceId = '';
    mocks.appleRedirectUri = '';

    render(<NativeOAuthButtons {...defaultProps()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Direct provider sign-in is not configured'
    );
    expect(screen.queryByRole('button', { name: /apple/i })).not.toBeInTheDocument();
  });

  it('issues a Google nonce before rendering the official SDK button', async () => {
    const user = userEvent.setup();
    let resolveNonce: ((value: { nonce: string; expires_in: number }) => void) | undefined;
    mocks.issueNonce.mockReturnValue(
      new Promise((resolve) => {
        resolveNonce = resolve;
      })
    );

    render(<NativeOAuthButtons {...defaultProps()} />);
    await user.click(screen.getByRole('button', { name: /prepare google sign-in/i }));

    expect(mocks.issueNonce).toHaveBeenCalledWith('google');
    expect(screen.queryByRole('button', { name: 'Official Google' })).not.toBeInTheDocument();

    resolveNonce?.({ nonce: 'raw-google-nonce', expires_in: 300 });
    expect(await screen.findByRole('button', { name: 'Official Google' })).toBeInTheDocument();
    expect(screen.getByTestId('google-nonce-ready')).toHaveTextContent('ready');
  });

  it('gets a fresh Google nonce after SDK failure before retrying', async () => {
    const user = userEvent.setup();
    mocks.issueNonce
      .mockResolvedValueOnce({ nonce: 'first-nonce', expires_in: 300 })
      .mockResolvedValueOnce({ nonce: 'second-nonce', expires_in: 300 });

    render(<NativeOAuthButtons {...defaultProps()} />);
    await user.click(screen.getByRole('button', { name: /prepare google sign-in/i }));
    await screen.findByRole('button', { name: 'Official Google' });
    fireEvent.click(screen.getByRole('button', { name: 'Google SDK error' }));
    await user.click(screen.getByRole('button', { name: /try google again/i }));

    await waitFor(() => expect(mocks.issueNonce).toHaveBeenCalledTimes(2));
    expect(mocks.issueNonce).toHaveBeenNthCalledWith(2, 'google');
  });

  it('completes Google token exchange after SDK success', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    mocks.issueNonce.mockResolvedValue({ nonce: 'google-nonce', expires_in: 300 });

    render(<NativeOAuthButtons {...props} />);
    await user.click(screen.getByRole('button', { name: /prepare google sign-in/i }));
    await user.click(await screen.findByRole('button', { name: 'Official Google' }));

    await waitFor(() => expect(props.onGoogleToken).toHaveBeenCalledWith('google-id-token'));
    expect(props.onAuthenticated).toHaveBeenCalledWith({
      isNewUser: false,
      setupRoute: '/dashboard',
    });
  });

  it('issues an Apple nonce just-in-time before invoking Apple JS', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    mocks.issueNonce.mockResolvedValue({ nonce: 'raw-apple-nonce', expires_in: 300 });
    mocks.signInWithApple.mockResolvedValue({
      idToken: 'apple-id-token',
      displayName: 'Example User',
    });

    render(<NativeOAuthButtons {...props} />);
    await user.click(screen.getByRole('button', { name: /continue with apple/i }));

    await waitFor(() => expect(props.onAppleToken).toHaveBeenCalled());
    expect(mocks.issueNonce).toHaveBeenCalledWith('apple');
    expect(mocks.issueNonce.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.signInWithApple.mock.invocationCallOrder[0]
    );
    expect(mocks.signInWithApple).toHaveBeenCalledWith({
      rawNonce: 'raw-apple-nonce',
      clientId: 'apple-service-id',
      redirectUri: 'https://example.com/login',
    });
    expect(props.onAppleToken).toHaveBeenCalledWith('apple-id-token', 'Example User');
  });

  it('gets a fresh Apple nonce after popup cancellation', async () => {
    const user = userEvent.setup();
    mocks.issueNonce
      .mockResolvedValueOnce({ nonce: 'first-apple-nonce', expires_in: 300 })
      .mockResolvedValueOnce({ nonce: 'second-apple-nonce', expires_in: 300 });
    mocks.signInWithApple
      .mockRejectedValueOnce(new ProviderPopupCancelledError('Apple'))
      .mockResolvedValueOnce({ idToken: 'apple-id-token' });

    render(<NativeOAuthButtons {...defaultProps()} />);
    await user.click(screen.getByRole('button', { name: /continue with apple/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Apple sign-in was cancelled');
    await user.click(screen.getByRole('button', { name: /continue with apple/i }));

    await waitFor(() => expect(mocks.issueNonce).toHaveBeenCalledTimes(2));
    expect(mocks.issueNonce).toHaveBeenNthCalledWith(2, 'apple');
  });
});
