import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NATIVE_PASSWORD_POLICY_MESSAGE } from '../../utils/passwordPolicy';

const mocks = vi.hoisted(() => ({
  nativeAuth: true,
  nativeOAuth: false,
  register: vi.fn(),
}));

vi.mock('../../config/env', () => ({
  env: {
    get nativeAuth() {
      return mocks.nativeAuth;
    },
    get nativeOAuth() {
      return mocks.nativeOAuth;
    },
    oauth: {
      googleClientId: 'google-client-id',
      appleServiceId: 'apple-service-id',
      appleRedirectUri: 'https://example.com/login',
    },
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: mocks.register,
    signInWithGoogleFlow: vi.fn(),
    completeGoogleProviderSignIn: vi.fn(),
    completeAppleProviderSignIn: vi.fn(),
    error: null,
    setError: vi.fn(),
    isOfflineMode: false,
    isAuthenticated: false,
    getRedirectPathForUser: () => '/dashboard',
  }),
}));

vi.mock('./NativeOAuthButtons', () => ({
  default: () => <div>Direct provider authentication</div>,
}));

import FirebaseAuth from './auth';

const completeRegistration = async (password: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: /email address/i }), 'user@example.com');
  const passwordFields = screen.getAllByLabelText(/^password|re-enter password/i);
  await user.type(passwordFields[0], password);
  await user.type(passwordFields[1], password);
  await user.click(screen.getByRole('button', { name: /sign up/i }));
};

describe('registration password policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nativeAuth = true;
    mocks.nativeOAuth = false;
    mocks.register.mockResolvedValue({ setupRoute: '/dashboard' });
  });

  it('keeps Firebase Google while the separate OAuth rollout flag is disabled', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <FirebaseAuth initialMode="login" />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.queryByText('Direct provider authentication')).not.toBeInTheDocument();
  });

  it('switches to direct providers only when both rollout flags are enabled', () => {
    mocks.nativeOAuth = true;
    render(
      <MemoryRouter initialEntries={['/login']}>
        <FirebaseAuth initialMode="login" />
      </MemoryRouter>
    );

    expect(screen.getByText('Direct provider authentication')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue with google/i })).not.toBeInTheDocument();
  });

  it('blocks passwords outside the native backend policy', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <FirebaseAuth initialMode="register" />
      </MemoryRouter>
    );

    await completeRegistration('abcdef');

    expect(screen.getByRole('alert')).toHaveTextContent(NATIVE_PASSWORD_POLICY_MESSAGE);
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('preserves legacy Firebase registration validation', async () => {
    mocks.nativeAuth = false;
    render(
      <MemoryRouter initialEntries={['/register']}>
        <FirebaseAuth initialMode="register" />
      </MemoryRouter>
    );

    await completeRegistration('abcdef');

    expect(mocks.register).toHaveBeenCalledWith('user@example.com', 'abcdef');
  });
});
