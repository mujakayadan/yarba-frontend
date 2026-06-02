import type { FirebaseApp } from 'firebase/app';
import type { Analytics } from 'firebase/analytics';
import type { Auth } from 'firebase/auth';
import { env } from './config/env';
import { createDebugger } from './utils/debug';

const debug = createDebugger('Firebase');

type FirebaseBundle = {
  app: FirebaseApp;
  auth: Auth;
  analytics: Analytics | null;
};

let initPromise: Promise<FirebaseBundle> | null = null;

const validateFirebaseEnv = () => {
  const requiredFirebaseEnv = [
    ['apiKey', env.firebase.apiKey],
    ['authDomain', env.firebase.authDomain],
    ['projectId', env.firebase.projectId],
    ['storageBucket', env.firebase.storageBucket],
    ['messagingSenderId', env.firebase.messagingSenderId],
    ['appId', env.firebase.appId],
  ] as const;

  const missingFirebaseEnv = requiredFirebaseEnv
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingFirebaseEnv.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missingFirebaseEnv.join(', ')}. ` +
        'Copy .env.example to .env.local and fill in your Firebase web app config.',
    );
  }
};

const initFirebase = async (): Promise<FirebaseBundle> => {
  validateFirebaseEnv();

  const [{ initializeApp }, { getAnalytics, isSupported }, { getAuth }] = await Promise.all([
    import('firebase/app'),
    import('firebase/analytics'),
    import('firebase/auth'),
  ]);

  const config = {
    apiKey: env.firebase.apiKey!,
    authDomain: env.firebase.authDomain!,
    projectId: env.firebase.projectId!,
    storageBucket: env.firebase.storageBucket!,
    messagingSenderId: env.firebase.messagingSenderId!,
    appId: env.firebase.appId!,
    measurementId: env.firebase.measurementId,
  };

  debug.log('Firebase Configuration:', {
    apiKey: config.apiKey ? 'CONFIGURED' : 'MISSING',
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId ? 'CONFIGURED' : 'MISSING',
    appId: config.appId ? 'CONFIGURED' : 'MISSING',
    measurementId: config.measurementId,
  });

  const app = initializeApp(config);
  const auth = getAuth(app);
  auth.tenantId = null;

  let analytics: Analytics | null = null;
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        debug.log('Firebase Analytics initialized');
      } else {
        debug.warn('Firebase Analytics not supported in this environment');
      }
    })
    .catch((err) => {
      debug.error('Error checking Analytics support:', err);
    });

  debug.log('Firebase initialized successfully');
  return { app, auth, analytics };
};

const ensureFirebase = (): Promise<FirebaseBundle> => {
  if (!initPromise) {
    initPromise = initFirebase();
  }
  return initPromise;
};

export const getFirebaseAuth = async (): Promise<Auth> => {
  const { auth } = await ensureFirebase();
  return auth;
};

export const getFirebaseApp = async (): Promise<FirebaseApp> => {
  const { app } = await ensureFirebase();
  return app;
};

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  const { analytics } = await ensureFirebase();
  return analytics;
};
