import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CHUNK_RELOAD_SESSION_KEY = 'yarba:chunk-reload';

describe('chunkLoadRecovery', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('location', { reload: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('detects chunk failures from Error, string, and message objects', async () => {
    const { isChunkLoadError } = await import('./chunkLoadRecovery');
    expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module'))).toBe(true);
    expect(isChunkLoadError('Importing a module script failed')).toBe(true);
    expect(isChunkLoadError({ message: 'Loading chunk 12 failed' })).toBe(true);
    expect(isChunkLoadError(new Error('Network Error'))).toBe(false);
  });

  it('reloads once for a stale chunk, then stops', async () => {
    const { attemptChunkReload } = await import('./chunkLoadRecovery');
    attemptChunkReload();
    attemptChunkReload();
    expect(window.location.reload).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(CHUNK_RELOAD_SESSION_KEY)).toBe('1');
  });
});
