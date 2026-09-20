import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCOUNT_RECOVERY_TEXT } from '../../content/accountRecovery';
import { NATIVE_PASSWORD_POLICY_MESSAGE } from '../../utils/passwordPolicy';
import { buildLegalAcceptance } from '../../services/legalService';

const mocks = vi.hoisted(() => ({
  nativeAuth: true,
  nativeOAuth: false,
  nativeRuntime: false,
  register: vi.fn(),
}));

vi.mock('../../config/env', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../config/env')>();
  return {
    ...original,
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
  };
});

vi.mock('../../platform/nativeRuntime', () => ({
  isNativeRuntime: () => mocks.nativeRuntime,
  getNativePlatform: () => (mocks.nativeRuntime ? 'ios' : 'web'),
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
    setupRoute: null,
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
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: /sign up/i }));
};

describe('registration password policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nativeAuth = true;
    mocks.nativeOAuth = false;
    mocks.nativeRuntime = false;
    mocks.register.mockResolvedValue({ setupRoute: '/dashboard' });
  });

  it('uses backend Google on web when native auth is on', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <FirebaseAuth initialMode="login" />
      </MemoryRouter>
    );

    expect(screen.getByText('Direct provider authentication')).toBeInTheDocument();
    expect(screen.getByText(ACCOUNT_RECOVERY_TEXT.returningUserNotice)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ACCOUNT_RECOVERY_TEXT.requestNewPassword })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue with google/i })).not.toBeInTheDocument();
  });

  it('keeps Firebase Google on Capacitor while the mobile OAuth flag is off', () => {
    mocks.nativeRuntime = true;
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

    expect(mocks.register).toHaveBeenCalledWith(
      'user@example.com',
      'abcdef',
      buildLegalAcceptance('firebase_registration')
    );
  });
});
