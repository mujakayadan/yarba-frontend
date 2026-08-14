const readEnv = (key: string): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

export const env = {
  apiUrl: readEnv('VITE_API_URL'),
  cloudfrontUrl: readEnv('VITE_CLOUDFRONT_URL'),
  debug: import.meta.env.VITE_DEBUG === 'true',
  nativeAuth: import.meta.env.VITE_NATIVE_AUTH === 'true',
  nativeOAuth: import.meta.env.VITE_NATIVE_OAUTH === 'true',
  oauth: {
    googleClientId: readEnv('VITE_GOOGLE_CLIENT_ID'),
    appleServiceId: readEnv('VITE_APPLE_SERVICE_ID'),
    appleRedirectUri: readEnv('VITE_APPLE_REDIRECT_URI'),
  },
  firebase: {
    apiKey: readEnv('VITE_FIREBASE_API_KEY'),
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnv('VITE_FIREBASE_APP_ID'),
    measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID'),
  },
} as const;

export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
