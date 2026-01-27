import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css'; // Tvoj globalni dizajn (Glassmorphism, Tailwind)
import './i18n/index.ts'; // Inicijalizacija prijevoda

// --- IMPORT PROVIDERS REMOVED (Moved to App.tsx) ---

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Remove initial HTML loader once React is ready to mount
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.remove();
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
