import { initializeApp } from 'firebase/app';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { env, isDev } from './config/env';
import { createDebugger } from './utils/debug';

const debug = createDebugger('Firebase');

const PROJECT_ID = 'yarba-app';

if (isDev) {
  console.log('Firebase initialization starting...');
  console.log('Environment project ID:', env.firebase.projectId);
}

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId || PROJECT_ID,
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

if (isDev) {
  console.log('Firebase auth configuration:', {
    projectId: auth.app.options.projectId,
    authDomain: auth.app.options.authDomain,
  });
}

debug.log('Firebase initialized successfully');

export { app, analytics, auth };
