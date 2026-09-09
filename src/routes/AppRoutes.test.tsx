import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, loading: false, user: null, signOut: vi.fn() }),
}));

vi.mock('../hooks/useUserProfile', () => ({
  useUserProfile: () => ({ data: undefined, isPending: false }),
}));

vi.mock('../services/authService', () => ({
  confirmEmailVerification: vi.fn().mockResolvedValue(undefined),
  requestEmailVerification: vi.fn(),
  resetPassword: vi.fn(),
}));

import AppRoutes from './AppRoutes';

describe('password authentication routes', () => {
  it('redirects /report-abuse to the public report page', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/report-abuse']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole('heading', { name: 'Report abuse' })).toBeInTheDocument();
  });

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
