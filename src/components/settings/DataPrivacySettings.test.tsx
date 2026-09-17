import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  nativeAuth: true,
  signOut: vi.fn(),
  openUrl: vi.fn(),
  getExport: vi.fn(),
  requestExport: vi.fn(),
  getDeletion: vi.fn(),
  requestDeletion: vi.fn(),
  cancelDeletion: vi.fn(),
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
    user: { email: 'user@example.com', auth_provider: 'password' },
    signOut: mocks.signOut,
  }),
}));

vi.mock('../../contexts/PrivacyPreferencesContext', () => ({
  usePrivacyPreferences: () => ({
    analyticsEnabled: false,
    setAnalyticsEnabled: vi.fn(),
  }),
}));

vi.mock('../../utils/openUrl', () => ({
  openUrl: mocks.openUrl,
}));

vi.mock('../../services/accountService', () => ({
  getAccountExportStatus: mocks.getExport,
  requestAccountExport: mocks.requestExport,
  getAccountDeletionStatus: mocks.getDeletion,
  requestAccountDeletion: mocks.requestDeletion,
  cancelAccountDeletion: mocks.cancelDeletion,
}));

import DataPrivacySettings from './DataPrivacySettings';

const idleDeletion = {
  status: 'not_requested' as const,
  can_cancel: false,
};

const renderSettings = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DataPrivacySettings />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('DataPrivacySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nativeAuth = true;
    mocks.signOut.mockResolvedValue(undefined);
    mocks.openUrl.mockResolvedValue(undefined);
    mocks.getExport.mockResolvedValue({ status: 'not_requested' });
    mocks.getDeletion.mockResolvedValue(idleDeletion);
    mocks.requestDeletion.mockResolvedValue({
      status: 'pending',
      can_cancel: true,
      scheduled_for: '2026-09-24T00:00:00Z',
    });
  });

  it('keeps Terms and Privacy reachable from Settings', async () => {
    renderSettings();

    expect(
      await screen.findByRole('button', { name: 'Request account deletion' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  });

  it('requires DELETE and the current password before queueing deletion', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(await screen.findByRole('button', { name: 'Request account deletion' }));
    await user.click(screen.getByRole('button', { name: 'Request deletion' }));
    expect(screen.getByText('Type DELETE exactly to confirm this request.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Type DELETE to confirm'), 'DELETE');
    await user.click(screen.getByRole('button', { name: 'Request deletion' }));
    expect(
      screen.getByText('Enter your current password to verify this request.')
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Current password'), 'CurrentPassword1');
    await user.click(screen.getByRole('button', { name: 'Request deletion' }));

    await waitFor(() =>
      expect(mocks.requestDeletion.mock.calls[0]?.[0]).toEqual({
        confirmation: 'DELETE',
        current_password: 'CurrentPassword1',
      })
    );
    expect(await screen.findByText(/Deletion is scheduled for/)).toBeInTheDocument();
  });

  it('signs out locally after deletion completes', async () => {
    mocks.getDeletion.mockResolvedValue({ status: 'completed', can_cancel: false });
    renderSettings();

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
  });

  it('opens a ready export archive outside the WebView', async () => {
    mocks.getExport.mockResolvedValue({
      status: 'ready',
      download_url: 'https://cdn.example.com/export.zip',
      expires_at: '2026-09-18T00:00:00Z',
    });
    const user = userEvent.setup();
    renderSettings();

    await user.click(await screen.findByRole('button', { name: 'Download archive' }));
    expect(mocks.openUrl).toHaveBeenCalledWith('https://cdn.example.com/export.zip');
  });
});
