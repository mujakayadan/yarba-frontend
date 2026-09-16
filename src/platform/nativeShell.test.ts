import { SystemBarType, SystemBarsStyle } from '@capacitor/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  native: false,
  setStyle: vi.fn(async () => undefined),
  hide: vi.fn(async () => undefined),
}));

vi.mock('./nativeRuntime', () => ({
  isNativeRuntime: () => mocks.native,
}));

vi.mock('@capacitor/core', async () => {
  const actual = await vi.importActual<typeof import('@capacitor/core')>('@capacitor/core');
  return {
    ...actual,
    SystemBars: {
      setStyle: mocks.setStyle,
    },
  };
});

vi.mock('@capacitor/splash-screen', () => ({
  SplashScreen: {
    hide: mocks.hide,
  },
}));

import { applyNativeShell, NATIVE_SHELL_CLASS, navigationBarStyleForPalette } from './nativeShell';

describe('nativeShell', () => {
  beforeEach(() => {
    mocks.native = false;
    mocks.setStyle.mockClear();
    mocks.hide.mockClear();
    document.documentElement.classList.remove(NATIVE_SHELL_CLASS);
  });

  it('uses light navigation-bar content on a dark palette', () => {
    expect(navigationBarStyleForPalette('dark')).toBe(SystemBarsStyle.Dark);
    expect(navigationBarStyleForPalette('light')).toBe(SystemBarsStyle.Light);
  });

  it('is a no-op on web', async () => {
    await applyNativeShell('light');
    expect(mocks.setStyle).not.toHaveBeenCalled();
    expect(mocks.hide).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains(NATIVE_SHELL_CLASS)).toBe(false);
  });

  it('hides splash and styles system bars on native', async () => {
    mocks.native = true;
    await applyNativeShell('light');

    expect(document.documentElement.classList.contains(NATIVE_SHELL_CLASS)).toBe(true);
    expect(mocks.setStyle).toHaveBeenCalledWith({
      style: SystemBarsStyle.Dark,
      bar: SystemBarType.StatusBar,
    });
    expect(mocks.setStyle).toHaveBeenCalledWith({
      style: SystemBarsStyle.Light,
      bar: SystemBarType.NavigationBar,
    });
    expect(mocks.hide).toHaveBeenCalledWith({ fadeOutDuration: 200 });
  });
});
