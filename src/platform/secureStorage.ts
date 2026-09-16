import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { isNativeRuntime } from './nativeRuntime';

const KEY_PREFIX = 'yarba_';

let prefixReady: Promise<void> | null = null;

const ensureNativePrefix = (): Promise<void> => {
  if (!isNativeRuntime()) {
    return Promise.resolve();
  }
  if (!prefixReady) {
    prefixReady = SecureStorage.setKeyPrefix(KEY_PREFIX);
  }
  return prefixReady;
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  await ensureNativePrefix();
  const value = await SecureStorage.get(key, false);
  return typeof value === 'string' ? value : null;
};

export const setSecureItem = async (key: string, value: string): Promise<void> => {
  await ensureNativePrefix();
  await SecureStorage.set(key, value);
};

export const removeSecureItem = async (key: string): Promise<void> => {
  await ensureNativePrefix();
  await SecureStorage.remove(key);
};
