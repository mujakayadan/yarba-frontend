import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  nativeAuth: true,
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  completeFirebaseRegistration: vi.fn(),
  getFirebaseUser: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  googleExchange: vi.fn(),
  appleExchange: vi.fn(),
  apiCommonHeaders: {} as Record<string, string>,
}));

vi.mock('../config/env', () => ({
  env: {
    get nativeAuth() {
      return mocks.nativeAuth;
    },
  },
}));

vi.mock('../services/api', () => ({
  default: {
    defaults: { headers: { common: mocks.apiCommonHeaders } },
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('../services/authService', () => ({
  completeFirebaseEmailRegistration: mocks.completeFirebaseRegistration,
  getCurrentFirebaseUser: mocks.getFirebaseUser,
  loginWithEmail: mocks.loginWithEmail,
  loginWithGoogle: vi.fn(),
  logout: mocks.logout,
  refreshPasswordSession: mocks.refresh,
  registerWithEmail: mocks.registerWithEmail,
}));

vi.mock('../services/oauthService', () => ({
  exchangeGoogleIdToken: mocks.googleExchange,
  exchangeAppleIdToken: mocks.appleExchange,
}));

import { AuthProvider, useAuth } from './AuthContext';
import { buildLegalAcceptance } from '../services/legalService';

const authResponse = {
  user: {
    id: 'user-1',
    username: 'user',
    email: 'user@example.com',
    is_active: true,
    is_superuser: false,
    last_login: '2026-08-12T00:00:00Z',
    last_active: '2026-08-12T00:00:00Z',
  },
  access_token: 'access-token',
  token_type: 'bearer',
  current_setup_step: 1,
  is_new_user: true,
  registration_resumed: false,
};

const AuthHarness = () => {
  const {
    firebaseUser,
    isAuthenticated,
    loading,
    login,
    register,
    signOut,
    completeGoogleProviderSignIn,
    completeAppleProviderSignIn,
  } = useAuth();
  return (
    <div>
      <span>{loading ? 'loading' : isAuthenticated ? 'authenticated' : 'signed-out'}</span>
      <span>{firebaseUser ? 'firebase-user' : 'no-firebase-user'}</span>
      <button onClick={() => void login('user@example.com', 'password')}>Log in</button>
      <button
        onClick={() =>
          void register(
            'user@example.com',
            'password',
            buildLegalAcceptance('password_registration')
          )
        }
      >
        Register
      </button>
      <button onClick={() => void signOut()}>Log out</button>
      <button
        onClick={() =>
          void completeGoogleProviderSignIn('google-id-token', buildLegalAcceptance('google_oauth'))
        }
      >
        Direct Google
      </button>
      <button
        onClick={() =>
          void completeAppleProviderSignIn(
            'apple-id-token',
            buildLegalAcceptance('apple_oauth'),
            'Example User'
          )
        }
      >
        Direct Apple
      </button>
    </div>
  );
};

describe('AuthProvider password adapter selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.nativeAuth = true;
    mocks.refresh.mockRejectedValue(new Error('No refresh session'));
    mocks.loginWithEmail.mockResolvedValue(authResponse);
    mocks.registerWithEmail.mockResolvedValue(authResponse);
    mocks.getFirebaseUser.mockResolvedValue(null);
    mocks.googleExchange.mockResolvedValue(authResponse);
    mocks.appleExchange.mockResolvedValue(authResponse);
    mocks.logout.mockResolvedValue(undefined);
    for (const key of Object.keys(mocks.apiCommonHeaders)) {
      delete mocks.apiCommonHeaders[key];
    }
  });

  it('does not call Firebase after native registration', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('signed-out');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await screen.findByText('authenticated');
    expect(mocks.registerWithEmail).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password',
      legal_acceptance: buildLegalAcceptance('password_registration'),
    });
    expect(mocks.completeFirebaseRegistration).not.toHaveBeenCalled();
    expect(mocks.getFirebaseUser).not.toHaveBeenCalled();
  });

  it('uses backend user state for native login', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('signed-out');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    await screen.findByText('authenticated');
    expect(mocks.loginWithEmail).toHaveBeenCalledWith('user@example.com', 'password');
    expect(mocks.getFirebaseUser).not.toHaveBeenCalled();
  });

  it('preserves the Firebase post-registration sign-in in fallback mode', async () => {
    mocks.nativeAuth = false;
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('signed-out')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await screen.findByText('authenticated');
    expect(mocks.completeFirebaseRegistration).toHaveBeenCalledWith('user@example.com', 'password');
    expect(mocks.getFirebaseUser).toHaveBeenCalledTimes(1);
  });

  it('clears native local state even when logout cleanup rejects', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('signed-out');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    await screen.findByText('authenticated');
    localStorage.setItem('auth_token', 'access-token');
    mocks.apiCommonHeaders.Authorization = 'Bearer access-token';
    mocks.logout.mockRejectedValue(new Error('Cleanup failed'));

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    await screen.findByText('signed-out');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(mocks.apiCommonHeaders.Authorization).toBeUndefined();
  });

  it('completes direct provider tokens with backend state and no Firebase user', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('signed-out');
    await user.click(screen.getByRole('button', { name: 'Direct Google' }));

    await screen.findByText('authenticated');
    expect(screen.getByText('no-firebase-user')).toBeInTheDocument();
    expect(mocks.googleExchange).toHaveBeenCalledWith(
      'google-id-token',
      buildLegalAcceptance('google_oauth')
    );

    await user.click(screen.getByRole('button', { name: 'Direct Apple' }));
    expect(mocks.appleExchange).toHaveBeenCalledWith(
      'apple-id-token',
      buildLegalAcceptance('apple_oauth'),
      'Example User'
    );
  });
});
