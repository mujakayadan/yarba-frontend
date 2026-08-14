import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiPost: vi.fn(),
  nativeAuth: false,
  refresh: vi.fn(),
  firebaseEmailLogin: vi.fn(),
  firebaseGoogleLogin: vi.fn(),
  firebaseLogout: vi.fn(),
  firebaseReset: vi.fn(),
  firebaseChangePassword: vi.fn(),
  firebaseToken: vi.fn(),
  firebaseUser: vi.fn(),
}));

vi.mock('../config/env', () => ({
  env: {
    get nativeAuth() {
      return mocks.nativeAuth;
    },
  },
}));

vi.mock('./api', () => ({
  default: {
    post: mocks.apiPost,
    get: vi.fn(),
  },
}));

vi.mock('./nativeAuthSession', () => ({
  requestNativeSessionRefresh: mocks.refresh,
}));

vi.mock('./firebaseAuthAdapter', () => ({
  changeFirebasePassword: mocks.firebaseChangePassword,
  getFirebaseToken: mocks.firebaseToken,
  getFirebaseUser: mocks.firebaseUser,
  sendFirebasePasswordReset: mocks.firebaseReset,
  signInWithFirebaseEmail: mocks.firebaseEmailLogin,
  signInWithFirebaseGoogle: mocks.firebaseGoogleLogin,
  signOutFirebase: mocks.firebaseLogout,
}));

import {
  changePassword,
  confirmEmailVerification,
  forgotPassword,
  loginWithEmail,
  logout,
  refreshPasswordSession,
  registerWithEmail,
  requestEmailVerification,
  resetPassword,
} from './authService';

const nativeResponse = {
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
  access_token_expires_in: 900,
  is_new_user: false,
  current_setup_step: 0,
  registration_resumed: false,
};

describe('authService authentication adapters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.nativeAuth = false;
  });

  it('selects native password login and registration without Firebase', async () => {
    mocks.nativeAuth = true;
    mocks.apiPost.mockResolvedValue({ data: nativeResponse });

    await loginWithEmail('user@example.com', 'password');
    await registerWithEmail({ email: 'new@example.com', password: 'password' });

    expect(mocks.apiPost).toHaveBeenNthCalledWith(1, '/auth/password/login', {
      email: 'user@example.com',
      password: 'password',
    });
    expect(mocks.apiPost).toHaveBeenNthCalledWith(2, '/auth/password/register', {
      email: 'new@example.com',
      password: 'password',
    });
    expect(mocks.firebaseEmailLogin).not.toHaveBeenCalled();
    expect(localStorage.getItem('auth_token')).toBe('access-token');
  });

  it('keeps Firebase email login and reset behavior when native auth is disabled', async () => {
    mocks.firebaseToken.mockResolvedValue('firebase-token');
    mocks.apiPost.mockResolvedValue({ data: nativeResponse });

    await loginWithEmail('user@example.com', 'password');
    await forgotPassword('user@example.com');

    expect(mocks.firebaseEmailLogin).toHaveBeenCalledWith('user@example.com', 'password');
    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/login', { id_token: 'firebase-token' });
    expect(mocks.firebaseReset).toHaveBeenCalledWith('user@example.com');
  });

  it('uses native forgot, reset, verification, change, refresh, and logout routes', async () => {
    mocks.nativeAuth = true;
    mocks.apiPost.mockResolvedValue({ data: { message: 'ok' } });
    mocks.refresh.mockResolvedValue(nativeResponse);

    await forgotPassword('user@example.com');
    await resetPassword('reset-token', 'new-password');
    await requestEmailVerification('user@example.com');
    await confirmEmailVerification('verify-token');
    await changePassword('old-password', 'new-password');
    await refreshPasswordSession();
    await logout();

    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/password/forgot-password', {
      email: 'user@example.com',
    });
    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/password/reset-password', {
      token: 'reset-token',
      new_password: 'new-password',
    });
    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/password/request-verification', {
      email: 'user@example.com',
    });
    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/password/confirm-verification', {
      token: 'verify-token',
    });
    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/password/change-password', {
      current_password: 'old-password',
      new_password: 'new-password',
    });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/password/logout');
    expect(mocks.firebaseChangePassword).not.toHaveBeenCalled();
    expect(mocks.firebaseLogout).toHaveBeenCalledTimes(1);
  });

  it('completes native local logout when backend and Firebase cleanup fail', async () => {
    mocks.nativeAuth = true;
    localStorage.setItem('auth_token', 'access-token');
    mocks.apiPost.mockRejectedValue(new Error('Backend unavailable'));
    mocks.firebaseLogout.mockRejectedValue(new Error('Firebase unavailable'));

    await expect(logout()).resolves.toBeUndefined();

    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/password/logout');
    expect(mocks.firebaseLogout).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
