import { App } from '@capacitor/app';
import { isNativeRuntime } from './nativeRuntime';
import { classifyUrl, toInAppPath } from '../utils/openUrl';

export const pathFromAppUrl = (url: string): string | null => {
  const classified = classifyUrl(url);
  return toInAppPath(classified);
};

export const applyNativeLaunchPath = async (): Promise<void> => {
  if (!isNativeRuntime()) {
    return;
  }

  const launched = await App.getLaunchUrl();
  if (!launched?.url) {
    return;
  }

  const path = pathFromAppUrl(launched.url);
  if (!path) {
    return;
  }

  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (path !== current) {
    window.history.replaceState(window.history.state, '', path);
  }
};
