import { isNativeRuntime } from '../platform/nativeRuntime';
import { getSecureItem, removeSecureItem, setSecureItem } from '../platform/secureStorage';
import { createDebugger } from './debug';

const debug = createDebugger('AuthUtils');

export const AUTH_TOKEN_KEY = 'auth_token';

let memoryToken: string | null = null;
let hydrated = false;
let hydratePromise: Promise<void> | null = null;
let persistQueue: Promise<void> = Promise.resolve();

const enqueuePersist = (operation: () => Promise<void>): Promise<void> => {
  persistQueue = persistQueue.then(operation, operation);
  return persistQueue;
};

const persistNativeToken = (token: string | null): Promise<void> =>
  enqueuePersist(async () => {
    try {
      if (token) {
        await setSecureItem(AUTH_TOKEN_KEY, token);
        return;
      }
      await removeSecureItem(AUTH_TOKEN_KEY);
    } catch (error) {
      debug.error('Native auth token persist failed', error);
    }
  });

/**
 * Load the JWT into memory. On native, migrate any leftover WebView localStorage
 * copy into Keychain / Keystore-backed storage and delete the web copy.
 */
export const hydrateAuthToken = async (): Promise<void> => {
  if (hydrated) {
    return;
  }

  if (!hydratePromise) {
    hydratePromise = (async () => {
      if (!isNativeRuntime()) {
        memoryToken = localStorage.getItem(AUTH_TOKEN_KEY);
        return;
      }

      let token: string | null = null;
      try {
        token = await getSecureItem(AUTH_TOKEN_KEY);
      } catch (error) {
        debug.error('Native auth token read failed', error);
      }

      const legacy = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token && legacy) {
        debug.log('Migrating auth token from WebView storage');
        token = legacy;
        await persistNativeToken(legacy);
      }

      if (legacy) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }

      memoryToken = token;
    })().finally(() => {
      hydrated = true;
    });
  }

  await hydratePromise;
};

export const flushAuthStorage = (): Promise<void> => persistQueue;

/**
 * Store authentication token. Native writes go to secure storage; the web keeps localStorage.
 */
export const storeToken = (token: string): void => {
  debug.log('Storing auth token');
  memoryToken = token;
  hydrated = true;

  if (!isNativeRuntime()) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  void persistNativeToken(token);
};

/**
 * Retrieve authentication token from memory (hydrated native store or localStorage on web).
 */
export const getToken = (): string | null => {
  if (hydrated) {
    debug.log(`Retrieved auth token: ${memoryToken ? 'present' : 'missing'}`);
    return memoryToken;
  }

  if (!isNativeRuntime()) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    debug.log(`Retrieved auth token: ${token ? 'present' : 'missing'}`);
    return token;
  }

  debug.log(`Retrieved auth token: ${memoryToken ? 'present' : 'missing'}`);
  return memoryToken;
};

/**
 * Remove authentication token from memory, web storage, and native secure storage.
 */
export const removeToken = (): void => {
  debug.log('Removing auth token');
  memoryToken = null;
  hydrated = true;
  localStorage.removeItem(AUTH_TOKEN_KEY);

  if (isNativeRuntime()) {
    void persistNativeToken(null);
  }
};

/**
 * Check if user is authenticated (has a token)
 */
export const isAuthenticated = (): boolean => {
  const hasToken = !!getToken();
  debug.log(`Authentication check: ${hasToken ? 'Authenticated' : 'Not authenticated'}`);
  return hasToken;
};

export const resetAuthStorageForTests = (): void => {
  memoryToken = null;
  hydrated = false;
  hydratePromise = null;
  persistQueue = Promise.resolve();
};
