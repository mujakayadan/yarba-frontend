import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: false,
  openBrowser: vi.fn(),
  openAppUrl: vi.fn(),
}));

vi.mock('../platform/nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
}));

vi.mock('@capacitor/browser', () => ({
  Browser: { open: mocks.openBrowser },
}));

vi.mock('@capacitor/app-launcher', () => ({
  AppLauncher: { openUrl: mocks.openAppUrl },
}));

import { classifyUrl, openUrl, resolvePostAuthPath, toInAppPath } from './openUrl';

describe('openUrl', () => {
  const origin = 'https://localhost';

  beforeEach(() => {
    mocks.native = false;
    mocks.openBrowser.mockReset();
    mocks.openAppUrl.mockReset();
  });

  it('classifies app hosts and custom-scheme URLs as in-app routes', () => {
    expect(classifyUrl('/resumes/abc', origin)).toEqual({
      kind: 'internal',
      href: 'https://localhost/resumes/abc',
      path: '/resumes/abc',
    });
    expect(toInAppPath(classifyUrl('https://yarba.app/applications', origin))).toBe(
      '/applications'
    );
    expect(toInAppPath(classifyUrl('com.yarba.app://dashboard', origin))).toBe('/dashboard');
    expect(toInAppPath(classifyUrl('com.yarba.app://localhost/settings/personal', origin))).toBe(
      '/settings/personal'
    );
    expect(toInAppPath(classifyUrl('com.yarba.app:///cover-letters/1?tab=preview', origin))).toBe(
      '/cover-letters/1?tab=preview'
    );
  });

  it('classifies OAuth callbacks, mailto, and external https separately', () => {
    expect(classifyUrl('com.yarba.app://auth/callback?code=abc', origin).kind).toBe('oauth');
    expect(classifyUrl('https://localhost/auth/callback?code=abc', origin).kind).toBe('oauth');
    expect(classifyUrl('mailto:admin@yarba.app', origin)).toEqual({
      kind: 'mailto',
      href: 'mailto:admin@yarba.app',
    });
    expect(classifyUrl('https://jobs.example.com/role', origin).kind).toBe('external');
    expect(classifyUrl('javascript:alert(1)', origin).kind).toBe('invalid');
  });

  it('keeps protected destinations after login unless onboarding is pending', () => {
    expect(
      resolvePostAuthPath({
        setupRoute: '/user/setup/personal-info',
        intendedPath: '/resumes/abc',
      })
    ).toBe('/user/setup/personal-info');
    expect(
      resolvePostAuthPath({
        setupRoute: '/dashboard',
        intendedPath: '/resumes/abc',
      })
    ).toBe('/resumes/abc');
    expect(resolvePostAuthPath({ intendedPath: '/applications?status=failed' })).toBe(
      '/applications?status=failed'
    );
    expect(resolvePostAuthPath({ intendedPath: '/login' })).toBe('/dashboard');
    expect(resolvePostAuthPath({ intendedPath: '//evil.example' })).toBe('/dashboard');
  });

  it('opens https and mailto outside the WebView on native builds', async () => {
    mocks.native = true;
    await openUrl('https://jobs.example.com/role');
    await openUrl('mailto:admin@yarba.app');
    expect(mocks.openBrowser).toHaveBeenCalledWith({ url: 'https://jobs.example.com/role' });
    expect(mocks.openAppUrl).toHaveBeenCalledWith({ url: 'mailto:admin@yarba.app' });
    expect(toInAppPath(classifyUrl('https://jobs.example.com/role', origin))).toBeNull();
  });
});
