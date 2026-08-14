import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NATIVE_PASSWORD_POLICY_MESSAGE } from '../../utils/passwordPolicy';

const mocks = vi.hoisted(() => ({
  nativeAuth: true,
  changePassword: vi.fn(),
  signOut: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock('../../config/env', () => ({
  env: {
    get nativeAuth() {
      return mocks.nativeAuth;
    },
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'user@example.com', username: 'user' },
    signOut: mocks.signOut,
  }),
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showSuccess: mocks.showSuccess,
    showError: mocks.showError,
  }),
}));

vi.mock('../../services/authService', () => ({
  changePassword: mocks.changePassword,
}));

import UserPage from './UserPage';

const submitPasswordChange = async (newPassword: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/^current password/i), 'CurrentPassword1');
  await user.type(screen.getByLabelText(/^new password/i), newPassword);
  await user.type(screen.getByLabelText(/^confirm new password/i), newPassword);
  await user.click(screen.getByRole('button', { name: /^change password$/i }));
};

describe('UserPage password changes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nativeAuth = true;
    mocks.changePassword.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
  });

  it('applies the native backend password policy', async () => {
    render(
      <MemoryRouter>
        <UserPage embedded />
      </MemoryRouter>
    );

    await submitPasswordChange('abcdef');

    expect(screen.getByRole('alert')).toHaveTextContent(NATIVE_PASSWORD_POLICY_MESSAGE);
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it('signs out after a successful native password change', async () => {
    render(
      <MemoryRouter>
        <UserPage embedded />
      </MemoryRouter>
    );

    await submitPasswordChange('NewPassword1');

    expect(mocks.changePassword).toHaveBeenCalledWith('CurrentPassword1', 'NewPassword1');
    expect(mocks.showSuccess).toHaveBeenCalledWith(
      'Password changed. For your security, sign in again.'
    );
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });

  it('preserves legacy Firebase password behavior without signing out', async () => {
    mocks.nativeAuth = false;
    render(
      <MemoryRouter>
        <UserPage embedded />
      </MemoryRouter>
    );

    await submitPasswordChange('abcdef');

    expect(mocks.changePassword).toHaveBeenCalledWith('CurrentPassword1', 'abcdef');
    expect(mocks.showSuccess).toHaveBeenCalledWith('Password changed successfully');
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
