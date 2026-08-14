import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, loading: false }),
}));

vi.mock('../services/authService', () => ({
  confirmEmailVerification: vi.fn().mockResolvedValue(undefined),
  requestEmailVerification: vi.fn(),
  resetPassword: vi.fn(),
}));

import AppRoutes from './AppRoutes';

describe('password authentication routes', () => {
  it.each([
    ['/reset-password?token=route-reset-token', 'Choose a new password'],
    ['/verify-email?token=route-verify-token', 'Verify your email'],
  ])('renders %s', async (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
