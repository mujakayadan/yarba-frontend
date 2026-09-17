import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: false,
  addListener: vi.fn(),
}));

vi.mock('./nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: mocks.addListener,
  },
}));

import { subscribeToAppResume } from './appLifecycle';

describe('appLifecycle', () => {
  beforeEach(() => {
    mocks.native = false;
    mocks.addListener.mockReset().mockResolvedValue({ remove: vi.fn() });
  });

  it('treats document visibility as resume on the website', () => {
    const onResume = vi.fn();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    const unsubscribe = subscribeToAppResume(onResume);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(onResume).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('ignores hidden visibility on the website', () => {
    const onResume = vi.fn();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    const unsubscribe = subscribeToAppResume(onResume);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(onResume).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('fires on Capacitor appStateChange when the app becomes active', async () => {
    mocks.native = true;
    let listener: ((state: { isActive: boolean }) => void) | undefined;
    mocks.addListener.mockImplementation(async (_event, callback) => {
      listener = callback;
      return { remove: vi.fn() };
    });

    const onResume = vi.fn();
    const unsubscribe = subscribeToAppResume(onResume);
    await vi.waitFor(() => expect(listener).toBeDefined());

    listener?.({ isActive: false });
    listener?.({ isActive: true });
    expect(onResume).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
