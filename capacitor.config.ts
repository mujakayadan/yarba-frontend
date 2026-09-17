/// <reference types="@capacitor/splash-screen" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yarba.app',
  appName: 'Yarba',
  webDir: 'build',
  backgroundColor: '#F7FAFC',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#F7FAFC',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      launchFadeOutDuration: 200,
      backgroundColor: '#E05B49',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER',
      showSpinner: false,
    },
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
      hidden: false,
    },
  },
};

export default config;
