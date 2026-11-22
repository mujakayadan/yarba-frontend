import { getNativePlatform, isNativeRuntime } from '../platform/nativeRuntime';

const readEnv = (key: string): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const ANDROID_EMULATOR_HOST = '10.0.2.2';

export const resolveNativeApiUrl = (
  rawUrl: string | undefined,
  platform: string = getNativePlatform(),
  native: boolean = isNativeRuntime()
): string | undefined => {
  if (!rawUrl || !native || platform !== 'android') {
    return rawUrl;
  }

  try {
    const url = new URL(rawUrl);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = ANDROID_EMULATOR_HOST;
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return rawUrl;
  }
};

export const shouldUseProviderOAuth = ({
  nativeRuntime,
  googleClientId,
  appleServiceId,
  appleRedirectUri,
}: {
  nativeRuntime: boolean;
  googleClientId?: string;
  appleServiceId?: string;
  appleRedirectUri?: string;
}): boolean => {
  if (googleClientId) {
    return true;
  }

  return Boolean(appleServiceId && appleRedirectUri) && !nativeRuntime;
};

export const env = {
  apiUrl: resolveNativeApiUrl(readEnv('VITE_API_URL')),
  cloudfrontUrl: readEnv('VITE_CLOUDFRONT_URL'),
  debug: import.meta.env.VITE_DEBUG === 'true',
  oauth: {
    googleClientId: readEnv('VITE_GOOGLE_CLIENT_ID'),
    appleServiceId: readEnv('VITE_APPLE_SERVICE_ID'),
    appleRedirectUri: readEnv('VITE_APPLE_REDIRECT_URI'),
  },
} as const;

export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
