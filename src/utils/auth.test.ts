import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: false,
  getSecureItem: vi.fn(async (): Promise<string | null> => null),
  setSecureItem: vi.fn(async () => undefined),
  removeSecureItem: vi.fn(async () => undefined),
}));

vi.mock('../platform/nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
  getNativePlatform: () => (mocks.native ? 'android' : 'web'),
}));

vi.mock('../platform/secureStorage', () => ({
  getSecureItem: mocks.getSecureItem,
  setSecureItem: mocks.setSecureItem,
  removeSecureItem: mocks.removeSecureItem,
}));

import {
  AUTH_TOKEN_KEY,
  flushAuthStorage,
  getToken,
  hydrateAuthToken,
  removeToken,
  resetAuthStorageForTests,
  storeToken,
} from './auth';

describe('auth token storage', () => {
  beforeEach(() => {
    mocks.native = false;
    mocks.getSecureItem.mockReset();
    mocks.setSecureItem.mockReset();
    mocks.removeSecureItem.mockReset();
    mocks.getSecureItem.mockResolvedValue(null);
    mocks.setSecureItem.mockResolvedValue(undefined);
    mocks.removeSecureItem.mockResolvedValue(undefined);
    resetAuthStorageForTests();
    localStorage.clear();
  });

  it('keeps the JWT in localStorage on web', async () => {
    storeToken('web-jwt');
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('web-jwt');
    expect(getToken()).toBe('web-jwt');

    await hydrateAuthToken();
    expect(getToken()).toBe('web-jwt');

    removeToken();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(getToken()).toBeNull();
    expect(mocks.setSecureItem).not.toHaveBeenCalled();
  });

  it('migrates a leftover WebView token into native secure storage', async () => {
    mocks.native = true;
    localStorage.setItem(AUTH_TOKEN_KEY, 'legacy-jwt');

    await hydrateAuthToken();
    await flushAuthStorage();

    expect(getToken()).toBe('legacy-jwt');
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(mocks.setSecureItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'legacy-jwt');
  });

  it('restores a native session from secure storage on cold start', async () => {
    mocks.native = true;
    mocks.getSecureItem.mockResolvedValue('native-jwt');

    await hydrateAuthToken();

    expect(getToken()).toBe('native-jwt');
    expect(mocks.setSecureItem).not.toHaveBeenCalled();
  });

  it('writes and clears the native store without leaving a WebView copy', async () => {
    mocks.native = true;
    await hydrateAuthToken();

    storeToken('native-jwt');
    await flushAuthStorage();

    expect(getToken()).toBe('native-jwt');
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(mocks.setSecureItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'native-jwt');

    removeToken();
    await flushAuthStorage();

    expect(getToken()).toBeNull();
    expect(mocks.removeSecureItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
  });
});
