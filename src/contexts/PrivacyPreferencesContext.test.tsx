import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { PrivacyPreferencesProvider, usePrivacyPreferences } from './PrivacyPreferencesContext';

const PrivacyHarness = () => {
  const { analyticsEnabled, setAnalyticsEnabled } = usePrivacyPreferences();
  return (
    <button type="button" onClick={() => setAnalyticsEnabled(!analyticsEnabled)}>
      Analytics {analyticsEnabled ? 'enabled' : 'disabled'}
    </button>
  );
};

describe('PrivacyPreferencesProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults optional analytics off and persists an explicit choice', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <PrivacyPreferencesProvider>
        <PrivacyHarness />
      </PrivacyPreferencesProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Analytics disabled' }));
    expect(screen.getByRole('button', { name: 'Analytics enabled' })).toBeInTheDocument();

    unmount();
    render(
      <PrivacyPreferencesProvider>
        <PrivacyHarness />
      </PrivacyPreferencesProvider>
    );
    expect(screen.getByRole('button', { name: 'Analytics enabled' })).toBeInTheDocument();
  });

  it('does not reuse one account analytics choice for another account', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PrivacyPreferencesProvider subjectId="user-a">
        <PrivacyHarness />
      </PrivacyPreferencesProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Analytics disabled' }));

    rerender(
      <PrivacyPreferencesProvider subjectId="user-b">
        <PrivacyHarness />
      </PrivacyPreferencesProvider>
    );

    expect(await screen.findByRole('button', { name: 'Analytics disabled' })).toBeInTheDocument();
  });
});
