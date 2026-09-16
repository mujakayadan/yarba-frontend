import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: false,
  get: vi.fn(async (): Promise<string | null> => null),
  set: vi.fn(async () => undefined),
  remove: vi.fn(async () => undefined),
  setKeyPrefix: vi.fn(async () => undefined),
}));

vi.mock('./nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
  getNativePlatform: () => (mocks.native ? 'android' : 'web'),
}));

vi.mock('@aparajita/capacitor-secure-storage', () => ({
  SecureStorage: {
    get: mocks.get,
    set: mocks.set,
    remove: mocks.remove,
    setKeyPrefix: mocks.setKeyPrefix,
  },
}));

import { getSecureItem, removeSecureItem, setSecureItem } from './secureStorage';

describe('secureStorage', () => {
  beforeEach(() => {
    mocks.native = true;
    mocks.get.mockReset();
    mocks.set.mockReset();
    mocks.remove.mockReset();
    mocks.setKeyPrefix.mockReset();
    mocks.get.mockResolvedValue(null);
    mocks.set.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue(undefined);
    mocks.setKeyPrefix.mockResolvedValue(undefined);
  });

  it('prefixes keys and stores string values on native', async () => {
    await setSecureItem('auth_token', 'jwt');

    expect(mocks.setKeyPrefix).toHaveBeenCalledWith('yarba_');
    expect(mocks.set).toHaveBeenCalledWith('auth_token', 'jwt');
  });

  it('returns only string values from native storage', async () => {
    mocks.get.mockResolvedValueOnce('jwt');
    await expect(getSecureItem('auth_token')).resolves.toBe('jwt');

    mocks.get.mockResolvedValueOnce(12 as unknown as string);
    await expect(getSecureItem('auth_token')).resolves.toBeNull();
  });

  it('removes keys from native storage', async () => {
    await removeSecureItem('auth_token');
    expect(mocks.remove).toHaveBeenCalledWith('auth_token');
  });
});
