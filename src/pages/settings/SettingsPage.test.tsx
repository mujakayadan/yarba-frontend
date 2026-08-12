import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../profile/ProfileEditPage', () => ({
  default: ({
    sectionIndex,
    onDirtyChange,
  }: {
    sectionIndex?: number;
    onDirtyChange?: (dirty: boolean) => void;
  }) => (
    <div>
      Profile settings section {sectionIndex}
      <button onClick={() => onDirtyChange?.(true)}>Change a setting</button>
    </div>
  ),
}));

vi.mock('../user/UserPage', () => ({
  default: () => <div>Account security settings</div>,
}));

import SettingsPage from './SettingsPage';

const renderSettings = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/settings/:section" element={<SettingsPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('SettingsPage', () => {
  it('maps readable section routes to the correct settings editor', () => {
    renderSettings('/settings/story');

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Story & voice' })).toBeInTheDocument();
    expect(screen.getByText('Profile settings section 2')).toBeInTheDocument();
  });

  it('navigates between named settings sections', () => {
    renderSettings('/settings/personal');

    fireEvent.click(screen.getByText('Account & security'));

    expect(screen.getByText('Account security settings')).toBeInTheDocument();
  });

  it('warns before discarding an edited settings section', () => {
    renderSettings('/settings/personal');

    fireEvent.click(screen.getByRole('button', { name: 'Change a setting' }));
    fireEvent.click(screen.getByText('Account & security'));

    expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeInTheDocument();
    expect(screen.getByText('Profile settings section 0')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(screen.getByText('Account security settings')).toBeInTheDocument();
  });
});
