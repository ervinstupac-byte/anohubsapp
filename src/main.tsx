import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('[main.tsx] 🚀 BOOT SEQUENCE STARTED');
console.log('[main.tsx] ✅ React Core Imports Loaded');

import './index.css';
console.log('[main.tsx] ✅ CSS Loaded');

// ============================================================================
// NC-76.3: SYNCHRONOUS i18n IMPORT (NO TOP-LEVEL AWAIT)
// ============================================================================
// Top-level await is DANGEROUS here. It can block the bundle parser.
// We stick to standard imports. i18n/index.ts handles its own errors.
console.log('[main.tsx] 🔧 Importing i18n...');
import './i18n/index.ts';
console.log('[main.tsx] ✅ i18n Imported');

// ============================================================================
// MOUNT REACT
// ============================================================================
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[main.tsx] 🚨 FATAL: Root element missing!');
} else {
  // Hide the static loader manually - we are taking over.
  // (index.html has its own 3s kill-switch as backup)
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.display = 'none';
    console.log('[main.tsx] 👻 Ghost Loader Hidden');
  }

  console.log('[main.tsx] ⚡ Mounting React Root...');
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('[main.tsx] ✅✅✅ React Mount Command Sent');
  } catch (err) {
    console.error('[main.tsx] 💥 React Mount Crashed:', err);
    // This alert is a last resort to see the error if console isn't open
    if (window.confirm('React Mount Crashed. Show error?')) {
      alert(String(err));
    }
  }
}
