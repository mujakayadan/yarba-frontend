import type { PluginListenerHandle } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { isNativeRuntime } from './nativeRuntime';

const readNavigatorOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine;

let cachedOnline = readNavigatorOnline();

export const isCurrentlyOnline = (): boolean => cachedOnline;

export const getOnlineStatus = async (): Promise<boolean> => {
  if (isNativeRuntime()) {
    try {
      const status = await Network.getStatus();
      cachedOnline = status.connected;
      return cachedOnline;
    } catch {
      cachedOnline = readNavigatorOnline();
      return cachedOnline;
    }
  }

  cachedOnline = readNavigatorOnline();
  return cachedOnline;
};

export const subscribeToOnlineStatus = (onChange: (online: boolean) => void): (() => void) => {
  let cancelled = false;
  let nativeListener: PluginListenerHandle | undefined;

  const emit = (online: boolean) => {
    cachedOnline = online;
    onChange(online);
  };

  if (isNativeRuntime()) {
    void Network.addListener('networkStatusChange', (status) => {
      if (!cancelled) {
        emit(status.connected);
      }
    }).then((handle) => {
      nativeListener = handle;
      if (cancelled) {
        void handle.remove();
      }
    });

    return () => {
      cancelled = true;
      void nativeListener?.remove();
    };
  }

  const handleOnline = () => emit(true);
  const handleOffline = () => emit(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    cancelled = true;
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
