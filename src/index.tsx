import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initChunkLoadRecovery } from './utils/chunkLoadRecovery';
import { hydrateAuthToken } from './utils/auth';

initChunkLoadRecovery();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

void hydrateAuthToken().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  reportWebVitals();
});
