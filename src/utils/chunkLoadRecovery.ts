const CHUNK_RELOAD_SESSION_KEY = 'yarba:chunk-reload';

/** True when a lazy route chunk failed to load (often after a new deploy). */
export function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.message} ${error.name}`
      : typeof error === 'string'
        ? error
        : '';

  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('Failed to load module script') ||
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError')
  );
}

function attemptChunkReload(): void {
  if (sessionStorage.getItem(CHUNK_RELOAD_SESSION_KEY)) {
    return;
  }
  sessionStorage.setItem(CHUNK_RELOAD_SESSION_KEY, '1');
  window.location.reload();
}

/** Call once at app startup (before React render). */
export function initChunkLoadRecovery(): void {
  // Successful load after an auto-reload — allow a future recovery attempt.
  if (sessionStorage.getItem(CHUNK_RELOAD_SESSION_KEY)) {
    sessionStorage.removeItem(CHUNK_RELOAD_SESSION_KEY);
  }

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    attemptChunkReload();
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      event.preventDefault();
      attemptChunkReload();
    }
  });
}
