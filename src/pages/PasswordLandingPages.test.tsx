import React, { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  confirmEmailVerification,
  requestEmailVerification,
  resetPassword,
} from '../services/authService';
import ResetPasswordPage from './ResetPasswordPage';
import VerifyEmailPage from './VerifyEmailPage';

vi.mock('../config/env', () => ({
  env: { nativeAuth: true },
}));

vi.mock('../services/authService', () => ({
  confirmEmailVerification: vi.fn(),
  requestEmailVerification: vi.fn(),
  resetPassword: vi.fn(),
}));

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location-search">{location.search}</span>;
};

describe('password authentication landing pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a reset token and matching new password', async () => {
    const user = userEvent.setup();
    vi.mocked(resetPassword).mockResolvedValue();

    render(
      <MemoryRouter initialEntries={['/reset-password?token=reset-token']}>
        <ResetPasswordPage />
        <LocationProbe />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('location-search')).toBeEmptyDOMElement());
    await user.type(screen.getByLabelText(/^new password/i), 'NewPassword1');
    await user.type(screen.getByLabelText(/^confirm new password/i), 'NewPassword1');
    await user.click(screen.getByRole('button', { name: /^reset password$/i }));

    expect(resetPassword).toHaveBeenCalledWith('reset-token', 'NewPassword1');
    expect(await screen.findByText(/password has been reset/i)).toBeInTheDocument();
  });

  it('rejects reset passwords outside the native backend policy', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/reset-password?token=reset-token']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/^new password/i), 'abcdef');
    await user.type(screen.getByLabelText(/^confirm new password/i), 'abcdef');
    await user.click(screen.getByRole('button', { name: /^reset password$/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password must be 8-64 characters and contain at least one uppercase letter, one lowercase letter, and one number'
    );
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('redacts and consumes a verification token only after one explicit action', async () => {
    let resolveConfirmation: (() => void) | undefined;
    vi.mocked(confirmEmailVerification).mockReturnValue(
      new Promise((resolve) => {
        resolveConfirmation = resolve;
      })
    );

    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/verify-email?token=strict-token']}>
          <VerifyEmailPage />
          <LocationProbe />
        </MemoryRouter>
      </StrictMode>
    );

    await waitFor(() => expect(screen.getByTestId('location-search')).toBeEmptyDOMElement());
    expect(confirmEmailVerification).not.toHaveBeenCalled();

    const verifyButton = screen.getByRole('button', { name: /^verify email$/i });
    fireEvent.click(verifyButton);
    fireEvent.click(verifyButton);

    expect(confirmEmailVerification).toHaveBeenCalledTimes(1);
    expect(confirmEmailVerification).toHaveBeenCalledWith('strict-token');
    resolveConfirmation?.();
    expect(await screen.findByText(/email address has been verified/i)).toBeInTheDocument();
  });

  it('requests a new verification link when a token is missing', async () => {
    const user = userEvent.setup();
    vi.mocked(requestEmailVerification).mockResolvedValue();

    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmailPage />
      </MemoryRouter>
    );

    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send a new verification link/i }));

    await waitFor(() => expect(requestEmailVerification).toHaveBeenCalledWith('user@example.com'));
  });
});
