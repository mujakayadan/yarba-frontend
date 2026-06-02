import { initializeApp } from 'firebase/app';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { env } from './config/env';
import { createDebugger } from './utils/debug';

const debug = createDebugger('Firebase');

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

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  measurementId: env.firebase.measurementId,
};

debug.log('Firebase Configuration:', {
  apiKey: firebaseConfig.apiKey ? 'CONFIGURED' : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId ? 'CONFIGURED' : 'MISSING',
  appId: firebaseConfig.appId ? 'CONFIGURED' : 'MISSING',
  measurementId: firebaseConfig.measurementId,
});

const app = initializeApp(firebaseConfig);

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

const auth = getAuth(app);
auth.tenantId = null;

debug.log('Firebase initialized successfully');

export { app, analytics, auth };
