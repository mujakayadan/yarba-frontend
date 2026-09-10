import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yarba.app',
  appName: 'Yarba',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
};

export default config;
