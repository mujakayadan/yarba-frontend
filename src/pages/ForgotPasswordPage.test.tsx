import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { forgotPassword } from '../services/authService';
import ForgotPasswordPage from './ForgotPasswordPage';

vi.mock('../services/authService', () => ({
  forgotPassword: vi.fn(),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends reset instructions for the normalized email address', async () => {
    const user = userEvent.setup();
    vi.mocked(forgotPassword).mockResolvedValue();

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    await user.type(
      screen.getByRole('textbox', { name: /email address/i }),
      '  user@example.com  '
    );
    await user.click(screen.getByRole('button', { name: 'Send reset instructions' }));

    expect(forgotPassword).toHaveBeenCalledWith('user@example.com');
    expect(
      await screen.findByText(
        'If an account exists for that email, password reset instructions will be sent.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue to sign in/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('shows a field error when the email is empty', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Send reset instructions' }));

    expect(forgotPassword).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /email address/i })).toHaveAccessibleDescription(
      'Enter your email address.'
    );
  });
});
