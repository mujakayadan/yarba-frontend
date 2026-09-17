import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: false,
  getStatus: vi.fn(),
  addListener: vi.fn(),
}));

vi.mock('./nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
}));

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: mocks.getStatus,
    addListener: mocks.addListener,
  },
}));

import { getOnlineStatus, isCurrentlyOnline, subscribeToOnlineStatus } from './networkStatus';

describe('networkStatus', () => {
  beforeEach(() => {
    mocks.native = false;
    mocks.getStatus.mockReset();
    mocks.addListener.mockReset().mockResolvedValue({ remove: vi.fn() });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('reads navigator.onLine on the website', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    await expect(getOnlineStatus()).resolves.toBe(false);
    expect(isCurrentlyOnline()).toBe(false);
    expect(mocks.getStatus).not.toHaveBeenCalled();
  });

  it('uses Capacitor Network on native', async () => {
    mocks.native = true;
    mocks.getStatus.mockResolvedValue({ connected: true, connectionType: 'wifi' });
    await expect(getOnlineStatus()).resolves.toBe(true);
    expect(mocks.getStatus).toHaveBeenCalledTimes(1);
  });

  it('falls back to navigator.onLine when Network.getStatus rejects', async () => {
    mocks.native = true;
    mocks.getStatus.mockRejectedValue(new Error('unavailable'));
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    await expect(getOnlineStatus()).resolves.toBe(false);
  });

  it('subscribes to window online events on the website', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToOnlineStatus(onChange);

    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));

    expect(onChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledWith(true);
    unsubscribe();
  });

  it('subscribes to Capacitor Network on native', async () => {
    mocks.native = true;
    let listener: ((status: { connected: boolean }) => void) | undefined;
    mocks.addListener.mockImplementation(async (_event, callback) => {
      listener = callback;
      return { remove: vi.fn() };
    });

    const onChange = vi.fn();
    const unsubscribe = subscribeToOnlineStatus(onChange);
    await vi.waitFor(() => expect(listener).toBeDefined());

    listener?.({ connected: false });
    expect(onChange).toHaveBeenCalledWith(false);
    unsubscribe();
  });
});
