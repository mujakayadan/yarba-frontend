import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProfileEditTabProps } from '../../../types/profileEdit';

const refetchPreferences = vi.fn();

vi.mock('../../../contexts/ToastContext', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));

vi.mock('../../../hooks/useApplicationPreferences', () => ({
  useApplicationPreferences: () => ({
    data: undefined,
    isLoading: false,
    isError: true,
    refetch: refetchPreferences,
  }),
  useDemographics: () => ({ data: undefined }),
  useApplyCredentialsStatus: () => ({ data: undefined }),
  useApplicationPreferencesMutations: () => ({
    updatePreferencesMutation: { mutateAsync: vi.fn(), isPending: false },
    updateConsentMutation: { mutateAsync: vi.fn(), isPending: false },
    updateDemographicsMutation: { mutateAsync: vi.fn(), isPending: false },
    deleteDemographicsMutation: { mutateAsync: vi.fn(), isPending: false },
    updateApplyCredentialsMutation: { mutateAsync: vi.fn(), isPending: false },
    deleteApplyCredentialsMutation: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

import { ApplicationPreferencesEditTab } from './ApplicationPreferencesEditTab';

describe('ApplicationPreferencesEditTab', () => {
  it('shows a recoverable error instead of an indefinite spinner', () => {
    render(<ApplicationPreferencesEditTab {...({} as ProfileEditTabProps)} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Application settings could not be loaded');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetchPreferences).toHaveBeenCalledOnce();
  });
});
