import { SystemBarType, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { isNativeRuntime } from './nativeRuntime';

export const NATIVE_SHELL_CLASS = 'yarba-native-shell';
export const NATIVE_SPLASH_FALLBACK_MS = 8000;

export const statusBarStyle = SystemBarsStyle.Dark;

export const navigationBarStyleForPalette = (paletteMode: 'light' | 'dark'): SystemBarsStyle =>
  paletteMode === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light;

let splashFallbackTimer: ReturnType<typeof setTimeout> | null = null;

const clearSplashFallback = (): void => {
  if (splashFallbackTimer !== null) {
    clearTimeout(splashFallbackTimer);
    splashFallbackTimer = null;
  }
};

export const hideNativeSplash = async (): Promise<void> => {
  if (!isNativeRuntime()) {
    return;
  }

  clearSplashFallback();
  await SplashScreen.hide({ fadeOutDuration: 200 });
};

export const scheduleNativeSplashFallback = (delayMs: number = NATIVE_SPLASH_FALLBACK_MS): void => {
  if (!isNativeRuntime() || splashFallbackTimer !== null) {
    return;
  }

  splashFallbackTimer = setTimeout(() => {
    splashFallbackTimer = null;
    void hideNativeSplash();
  }, delayMs);
};

export const applyNativeShell = async (paletteMode: 'light' | 'dark'): Promise<void> => {
  if (!isNativeRuntime()) {
    return;
  }

  document.documentElement.classList.add(NATIVE_SHELL_CLASS);

  await SystemBars.setStyle({
    style: statusBarStyle,
    bar: SystemBarType.StatusBar,
  });
  await SystemBars.setStyle({
    style: navigationBarStyleForPalette(paletteMode),
    bar: SystemBarType.NavigationBar,
  });
};
