import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  googleExchange: vi.fn(),
  appleExchange: vi.fn(),
  apiCommonHeaders: {} as Record<string, string>,
}));

vi.mock('../services/api', () => ({
  default: {
    defaults: { headers: { common: mocks.apiCommonHeaders } },
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('../services/authService', () => ({
  loginWithEmail: mocks.loginWithEmail,
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

describe('AuthProvider password sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.refresh.mockRejectedValue(new Error('No refresh session'));
    mocks.loginWithEmail.mockResolvedValue(authResponse);
    mocks.registerWithEmail.mockResolvedValue(authResponse);
    mocks.googleExchange.mockResolvedValue(authResponse);
    mocks.appleExchange.mockResolvedValue(authResponse);
    mocks.logout.mockResolvedValue(undefined);
    for (const key of Object.keys(mocks.apiCommonHeaders)) {
      delete mocks.apiCommonHeaders[key];
    }
  });

  it('registers through the password API', async () => {
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
  });

  it('uses backend user state for password login', async () => {
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
  });

  it('clears local state even when logout cleanup rejects', async () => {
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

  it('completes direct provider tokens with backend state', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await screen.findByText('signed-out');
    await user.click(screen.getByRole('button', { name: 'Direct Google' }));

    await screen.findByText('authenticated');
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
