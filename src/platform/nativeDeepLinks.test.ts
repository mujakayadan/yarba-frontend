import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: true,
  getLaunchUrl: vi.fn(),
}));

vi.mock('./nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
}));

vi.mock('@capacitor/app', () => ({
  App: {
    getLaunchUrl: mocks.getLaunchUrl,
  },
}));

import { applyNativeLaunchPath, pathFromAppUrl } from './nativeDeepLinks';

describe('nativeDeepLinks', () => {
  beforeEach(() => {
    mocks.native = true;
    mocks.getLaunchUrl.mockReset();
    window.history.replaceState(window.history.state, '', '/');
  });

  it('maps custom-scheme and https app URLs to React Router paths', () => {
    expect(pathFromAppUrl('com.yarba.app://resumes/abc')).toBe('/resumes/abc');
    expect(pathFromAppUrl('https://yarba.app/website')).toBe('/website');
    expect(pathFromAppUrl('https://jobs.example.com/role')).toBeNull();
  });

  it('replaces the launch location so BrowserRouter starts on the deep link', async () => {
    mocks.getLaunchUrl.mockResolvedValue({ url: 'com.yarba.app://applications' });
    await applyNativeLaunchPath();
    expect(`${window.location.pathname}${window.location.search}`).toBe('/applications');
  });

  it('does not rewrite the history on web', async () => {
    mocks.native = false;
    mocks.getLaunchUrl.mockResolvedValue({ url: 'com.yarba.app://applications' });
    await applyNativeLaunchPath();
    expect(window.location.pathname).toBe('/');
    expect(mocks.getLaunchUrl).not.toHaveBeenCalled();
  });
});
