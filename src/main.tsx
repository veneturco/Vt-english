import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/haptics';
import { registerServiceWorker } from './utils/offlineSessionManager';

// Register Service Worker for core assets & active session offline caching
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
