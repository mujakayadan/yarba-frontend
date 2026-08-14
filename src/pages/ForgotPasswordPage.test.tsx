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
  });
});
