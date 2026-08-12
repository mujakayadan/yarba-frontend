import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendPasswordResetEmail } from 'firebase/auth';
import ForgotPasswordPage from './ForgotPasswordPage';

const mockAuth = {};

vi.mock('../firebaseConfig', () => ({
  getFirebaseAuth: vi.fn(async () => mockAuth),
}));

vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends reset instructions for the normalized email address', async () => {
    const user = userEvent.setup();
    vi.mocked(sendPasswordResetEmail).mockResolvedValue();

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

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'user@example.com');
    expect(
      await screen.findByText(
        'If an account exists for that email, Firebase will send password reset instructions.'
      )
    ).toBeInTheDocument();
  });
});
