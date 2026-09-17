import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { applyNativeLaunchPath } from './platform/nativeDeepLinks';
import { scheduleNativeSplashFallback } from './platform/nativeShell';
import { initChunkLoadRecovery } from './utils/chunkLoadRecovery';
import { hydrateAuthToken } from './utils/auth';

initChunkLoadRecovery();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

void Promise.all([hydrateAuthToken(), applyNativeLaunchPath()]).finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  scheduleNativeSplashFallback();
  reportWebVitals();
});
