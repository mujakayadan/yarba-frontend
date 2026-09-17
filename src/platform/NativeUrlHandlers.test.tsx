import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: true,
  openBrowser: vi.fn(),
  openAppUrl: vi.fn(),
  addListener: vi.fn(),
}));

vi.mock('./nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
}));

vi.mock('@capacitor/browser', () => ({
  Browser: { open: mocks.openBrowser },
}));

vi.mock('@capacitor/app-launcher', () => ({
  AppLauncher: { openUrl: mocks.openAppUrl },
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: mocks.addListener,
  },
}));

import { NativeUrlHandlers } from './NativeUrlHandlers';

describe('NativeUrlHandlers', () => {
  beforeEach(() => {
    mocks.native = true;
    mocks.openBrowser.mockReset().mockResolvedValue(undefined);
    mocks.openAppUrl.mockReset().mockResolvedValue(undefined);
    mocks.addListener.mockReset().mockResolvedValue({ remove: vi.fn() });
  });

  it('opens external https and mailto through native plugins', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NativeUrlHandlers />
        <a href="https://jobs.example.com/role">Job</a>
        <a href="mailto:admin@yarba.app">Email</a>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: 'Job' }));
    await user.click(screen.getByRole('link', { name: 'Email' }));

    expect(mocks.openBrowser).toHaveBeenCalledWith({ url: 'https://jobs.example.com/role' });
    expect(mocks.openAppUrl).toHaveBeenCalledWith({ url: 'mailto:admin@yarba.app' });
  });

  it('does not intercept clicks on the website', async () => {
    mocks.native = false;
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NativeUrlHandlers />
        <a href="https://jobs.example.com/role">Job</a>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: 'Job' }));
    expect(mocks.openBrowser).not.toHaveBeenCalled();
  });
});
