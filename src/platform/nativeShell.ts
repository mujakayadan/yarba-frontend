import { SystemBarType, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { isNativeRuntime } from './nativeRuntime';

export const NATIVE_SHELL_CLASS = 'yarba-native-shell';

export const statusBarStyle = SystemBarsStyle.Dark;

export const navigationBarStyleForPalette = (paletteMode: 'light' | 'dark'): SystemBarsStyle =>
  paletteMode === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light;

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
  await SplashScreen.hide({ fadeOutDuration: 200 });
};
