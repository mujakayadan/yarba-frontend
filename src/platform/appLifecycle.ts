import type { PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { isNativeRuntime } from './nativeRuntime';

export const subscribeToAppResume = (onResume: () => void): (() => void) => {
  if (isNativeRuntime()) {
    let listener: PluginListenerHandle | undefined;
    let cancelled = false;

    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        onResume();
      }
    }).then((handle) => {
      listener = handle;
      if (cancelled) {
        void handle.remove();
      }
    });

    return () => {
      cancelled = true;
      void listener?.remove();
    };
  }

  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      onResume();
    }
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => document.removeEventListener('visibilitychange', onVisible);
};
