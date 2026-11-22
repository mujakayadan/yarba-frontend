import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiPost: vi.fn(),
  refresh: vi.fn(),
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
import { buildLegalAcceptance } from './legalService';

const passwordResponse = {
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

describe('authService password authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('logs in and registers through password routes', async () => {
    mocks.apiPost.mockResolvedValue({ data: passwordResponse });

    await loginWithEmail('user@example.com', 'password');
    const legalAcceptance = buildLegalAcceptance('password_registration');
    await registerWithEmail({
      email: 'new@example.com',
      password: 'password',
      legal_acceptance: legalAcceptance,
    });

    expect(mocks.apiPost).toHaveBeenNthCalledWith(1, '/auth/password/login', {
      email: 'user@example.com',
      password: 'password',
    });
    expect(mocks.apiPost).toHaveBeenNthCalledWith(2, '/auth/password/register', {
      email: 'new@example.com',
      password: 'password',
      legal_acceptance: legalAcceptance,
    });
    expect(localStorage.getItem('auth_token')).toBe('access-token');
  });

  it('uses forgot, reset, verification, change, refresh, and logout routes', async () => {
    mocks.apiPost.mockResolvedValue({ data: { message: 'ok' } });
    mocks.refresh.mockResolvedValue(passwordResponse);

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
  });

  it('completes local logout when backend cleanup fails', async () => {
    localStorage.setItem('auth_token', 'access-token');
    mocks.apiPost.mockRejectedValue(new Error('Backend unavailable'));

    await expect(logout()).resolves.toBeUndefined();

    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/password/logout');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
