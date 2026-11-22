import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCOUNT_RECOVERY_TEXT } from '../../content/accountRecovery';
import { NATIVE_PASSWORD_POLICY_MESSAGE } from '../../utils/passwordPolicy';
import { buildLegalAcceptance } from '../../services/legalService';

const mocks = vi.hoisted(() => ({
  nativeRuntime: false,
  googleClientId: 'google-client-id' as string | undefined,
  appleServiceId: 'apple-service-id' as string | undefined,
  appleRedirectUri: 'https://example.com/login' as string | undefined,
  register: vi.fn(),
}));

vi.mock('../../config/env', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../config/env')>();
  return {
    ...original,
    env: {
      oauth: {
        get googleClientId() {
          return mocks.googleClientId;
        },
        get appleServiceId() {
          return mocks.appleServiceId;
        },
        get appleRedirectUri() {
          return mocks.appleRedirectUri;
        },
      },
    },
  };
});

vi.mock('../../platform/nativeRuntime', () => ({
  isNativeRuntime: () => mocks.nativeRuntime,
  getNativePlatform: () => (mocks.nativeRuntime ? 'android' : 'web'),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: mocks.register,
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

import AuthForm from './auth';

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
    mocks.nativeRuntime = false;
    mocks.googleClientId = 'google-client-id';
    mocks.appleServiceId = 'apple-service-id';
    mocks.appleRedirectUri = 'https://example.com/login';
    mocks.register.mockResolvedValue({ setupRoute: '/dashboard' });
  });

  it('uses provider buttons when Google is configured', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthForm initialMode="login" />
      </MemoryRouter>
    );

    expect(screen.getByText('Direct provider authentication')).toBeInTheDocument();
    expect(screen.getByText(ACCOUNT_RECOVERY_TEXT.returningUserNotice)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ACCOUNT_RECOVERY_TEXT.requestNewPassword })
    ).toBeInTheDocument();
  });

  it('uses provider buttons on native when Google is configured', () => {
    mocks.nativeRuntime = true;
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthForm initialMode="login" />
      </MemoryRouter>
    );

    expect(screen.getByText('Direct provider authentication')).toBeInTheDocument();
  });

  it('hides provider buttons when Google and Apple are not configured', () => {
    mocks.googleClientId = undefined;
    mocks.appleServiceId = undefined;
    mocks.appleRedirectUri = undefined;
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthForm initialMode="login" />
      </MemoryRouter>
    );

    expect(screen.queryByText('Direct provider authentication')).not.toBeInTheDocument();
  });

  it('blocks passwords outside the backend policy', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <AuthForm initialMode="register" />
      </MemoryRouter>
    );

    await completeRegistration('abcdef');

    expect(screen.getByRole('alert')).toHaveTextContent(NATIVE_PASSWORD_POLICY_MESSAGE);
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('registers with the password acceptance surface', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <AuthForm initialMode="register" />
      </MemoryRouter>
    );

    await completeRegistration('Abcdefg1');

    expect(mocks.register).toHaveBeenCalledWith(
      'user@example.com',
      'Abcdefg1',
      buildLegalAcceptance('password_registration')
    );
  });
});
