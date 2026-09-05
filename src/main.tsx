import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/haptics';
import { registerServiceWorker } from './utils/offlineSessionManager';
import { ErrorBoundary } from './components/ErrorBoundary';

// Register Service Worker for core assets & active session offline caching
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
