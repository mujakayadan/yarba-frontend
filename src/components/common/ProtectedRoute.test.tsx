import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getStatus: vi.fn(),
  isOfflineMode: false,
  setupRoute: null as string | null,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    loading: false,
    get isOfflineMode() {
      return mocks.isOfflineMode;
    },
    get setupRoute() {
      return mocks.setupRoute;
    },
  }),
}));

vi.mock('../../services/legalService', () => ({
  getLegalAcceptanceStatus: mocks.getStatus,
}));

vi.mock('../legal/LegalAcceptanceGate', () => ({
  default: () => <div>Legal acceptance required</div>,
}));

import { ProtectedRoute } from './ProtectedRoute';

const renderProtectedRoute = (path = '/dashboard') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProtectedRoute legal acceptance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOfflineMode = false;
    mocks.setupRoute = null;
  });

  it('renders protected content after current policy acceptance', async () => {
    mocks.getStatus.mockResolvedValue({
      requires_acceptance: false,
      current_versions: {},
      accepted_versions: {},
    });

    renderProtectedRoute();

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
  });

  it('shows the acceptance gate for a material policy update', async () => {
    mocks.getStatus.mockResolvedValue({
      requires_acceptance: true,
      current_versions: {},
      accepted_versions: {},
    });

    renderProtectedRoute();

    expect(await screen.findByText('Legal acceptance required')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('keeps data-rights settings available without accepting changed terms', async () => {
    mocks.setupRoute = '/user/setup/personal-info';
    renderProtectedRoute('/settings/data-privacy');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(mocks.getStatus).not.toHaveBeenCalled();
  });

  it('does not expose protected data while offline', () => {
    mocks.isOfflineMode = true;

    renderProtectedRoute();

    expect(screen.getByText('Connection required')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
