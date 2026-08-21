import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  accept: vi.fn(),
}));

vi.mock('../../services/legalService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../services/legalService')>();
  return {
    ...original,
    acceptCurrentLegalDocuments: mocks.accept,
  };
});

import LegalAcceptanceGate from './LegalAcceptanceGate';

describe('LegalAcceptanceGate', () => {
  it('requires explicit confirmation before recording acceptance', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    mocks.accept.mockResolvedValue({
      requires_acceptance: false,
      current_versions: {
        terms: '2026-08-19',
        acceptable_use: '2026-08-19',
        privacy: '2026-08-19',
        ai_data_use: '2026-08-19',
      },
      accepted_versions: {
        terms: '2026-08-19',
        acceptable_use: '2026-08-19',
        privacy: '2026-08-19',
        ai_data_use: '2026-08-19',
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LegalAcceptanceGate />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Accept and continue' }));
    expect(screen.getByText(/must confirm/i)).toBeInTheDocument();
    expect(mocks.accept).not.toHaveBeenCalled();

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Accept and continue' }));
    await waitFor(() => expect(mocks.accept).toHaveBeenCalledTimes(1));
  });
});
